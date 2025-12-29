import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Svg, { Path } from 'react-native-svg';
import API_BASE_URL, { API_ENDPOINTS } from '../config/api';
import { userAPI } from '../services/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const tabs = ['Active', 'Completed', 'Cancelled'];

const STATUS_META = {
  CONFIRMED: { label: 'Confirmed', bg: '#DCFCE7', color: '#166534' },
  PENDING: { label: 'Pending', bg: '#FEF3C7', color: '#92400E' },
  CANCELLED: { label: 'Cancelled', bg: '#FEE2E2', color: '#B91C1C' },
  REFUNDED: { label: 'Refunded', bg: '#DBEAFE', color: '#1D4ED8' },
  COMPLETED: { label: 'Completed', bg: '#E0E7FF', color: '#3730A3' },
};

const parseTripDate = (tripDate) => {
  if (!tripDate) return null;
  const safeValue = tripDate.includes('T') ? tripDate : `${tripDate}T00:00:00`;
  const parsed = new Date(safeValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseDateValue = (value, fallbackDate) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  if (typeof value === 'string' && fallbackDate) {
    const [hours, minutes] = value.split(':').map((part) => parseInt(part, 10));
    if (!Number.isNaN(hours)) {
      const derived = new Date(fallbackDate);
      derived.setHours(hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
      return derived;
    }
  }
  return null;
};

const formatDateLabel = (date) => {
  if (!date) return '--';
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTimeLabel = (date) => {
  if (!date) return '--';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDuration = (start, end) => {
  if (!start || !end) return null;
  const diffMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  if (!diffMinutes) return null;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  if (!hours) return `${minutes}m`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

const formatCurrency = (amount, currency = 'INR') => {
  const safeAmount = Number(amount) || 0;
  const formatted = safeAmount.toLocaleString('en-IN');
  if (currency === 'NPR') {
    return `NPR ${formatted}`;
  }
  return `₹ ${formatted}`;
};

const getStatusMeta = (booking) => {
  if (!booking) return STATUS_META.CONFIRMED;
  if (booking.status === 'CANCELLED') return STATUS_META.CANCELLED;
  if (booking.status === 'REFUNDED') return STATUS_META.REFUNDED;
  if (booking.trip?.tripStatus === 'COMPLETED') return STATUS_META.COMPLETED;
  if (booking.status === 'PENDING') return STATUS_META.PENDING;
  return STATUS_META.CONFIRMED;
};

const getSeatLabel = (booking) => {
  if (!booking?.seats?.length) return 'Seat details NA';
  return booking.seats.map((seat) => seat.seatNumber).join(', ');
};

const canCancelBooking = (booking, departureDateTime) => {
  if (!booking) return false;
  if (booking.status !== 'CONFIRMED') return false;
  const tripStatus = booking.trip?.tripStatus;
  if (!tripStatus || ['COMPLETED', 'CANCELLED', 'ONGOING'].includes(tripStatus)) {
    return false;
  }
  if (!departureDateTime) {
    return true;
  }
  const hoursUntilDeparture = (departureDateTime.getTime() - Date.now()) / 3600000;
  return hoursUntilDeparture > 2;
};

const buildDownloadUrl = (bookingGroupId) =>
  `${API_BASE_URL}${API_ENDPOINTS.DOWNLOAD_TICKET}/${bookingGroupId}`;

const BookingsScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('Active');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadBookings = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          setBookings([]);
          setError('Please sign in to view your bookings.');
          return;
        }

        const response = await userAPI.getBookings({ limit: 100 }, token);

        if (response.success) {
          setBookings(response.data?.bookings || []);
        } else {
          setError(response.error || 'Failed to fetch bookings');
        }
      } catch (err) {
        console.error('Bookings fetch error:', err);
        setError(err.message || 'Failed to fetch bookings');
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings({ silent: true });
    setRefreshing(false);
  }, [loadBookings]);

  const groupedBookings = useMemo(() => {
    const grouped = {
      Active: [],
      Completed: [],
      Cancelled: [],
    };

    bookings.forEach((booking) => {
      if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
        grouped.Cancelled.push(booking);
      } else if (booking.trip?.tripStatus === 'COMPLETED') {
        grouped.Completed.push(booking);
      } else {
        grouped.Active.push(booking);
      }
    });

    return grouped;
  }, [bookings]);

  const handleCancelBooking = useCallback(
    async (bookingGroupId) => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          Alert.alert('Not Signed In', 'Please sign in to cancel bookings.');
          return;
        }

        setCancellingId(bookingGroupId);
        const response = await userAPI.cancelTicket(bookingGroupId, token);

        if (response.success) {
          Alert.alert('Booking Cancelled', 'We have cancelled your tickets and started the refund process.');
          await loadBookings({ silent: true });
        } else {
          throw new Error(response.error || 'Failed to cancel booking');
        }
      } catch (err) {
        console.error('Cancel booking error:', err);
        Alert.alert('Cancellation Failed', err.message || 'We could not cancel this booking. Please try again.');
      } finally {
        setCancellingId(null);
      }
    },
    [loadBookings]
  );

  const handleDownloadTicket = useCallback(async (booking) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Not Signed In', 'Please sign in to download tickets.');
        return;
      }

      setDownloadingId(booking.bookingGroupId);
      const downloadUrl = buildDownloadUrl(booking.bookingGroupId);
      const directory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      if (!directory) {
        throw new Error('Storage directory not available');
      }

      const fileUri = `${directory}ticket-${booking.bookingGroupId}.pdf`;
      const downloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (downloadResult.status !== 200) {
        throw new Error('Unable to download ticket at the moment');
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share ticket PDF',
        });
      } else {
        Alert.alert('Ticket Downloaded', 'Sharing is not available on this device. The file is stored inside the app sandbox.');
      }
    } catch (err) {
      console.error('Ticket download error:', err);
      Alert.alert('Download Failed', err.message || 'We could not download the ticket right now.');
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const confirmCancelBooking = (booking) => {
    Alert.alert(
      'Cancel Booking',
      'Seats will be released immediately and refund will follow our policy. Do you want to cancel?',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Trip',
          style: 'destructive',
          onPress: () => handleCancelBooking(booking.bookingGroupId),
        },
      ]
    );
  };

  const renderErrorBanner = () => {
    if (!error) return null;
    const isAuthError = error.toLowerCase().includes('sign in');
    return (
      <View style={styles.errorBanner}>
        <MaterialCommunityIcons name="alert-circle" size={18} color="#B91C1C" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.errorAction}
          onPress={() => {
            if (isAuthError) {
              navigation.navigate('SignIn');
            } else {
              loadBookings();
            }
          }}
        >
          <Text style={styles.errorActionText}>{isAuthError ? 'Sign In' : 'Retry'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="calendar-blank" size={28} color="#9CA3AF" />
      <Text style={styles.emptyStateTitle}>No {selectedTab.toLowerCase()} bookings</Text>
      <Text style={styles.emptyStateSubtext}>When you reserve seats, they will show up here automatically.</Text>
      {selectedTab !== 'Cancelled' && (
        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
          <Text style={styles.ctaButtonText}>Search Buses</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderBookingCard = ({ item: booking }) => {
    const tripDate = parseTripDate(booking.trip?.tripDate);
    const departureDateTime = parseDateValue(booking.route?.from?.departureTime, tripDate);
    const arrivalDateTime = parseDateValue(booking.route?.to?.arrivalTime, tripDate);
    const boardingTime = parseDateValue(
      booking.boardingPoint?.time,
      departureDateTime || tripDate
    );
    const droppingTime = parseDateValue(
      booking.droppingPoint?.time,
      arrivalDateTime || tripDate
    );
    const statusMeta = getStatusMeta(booking);
    const seatLabel = getSeatLabel(booking);
    const passengersLabel = `${booking.seatCount || booking.seats?.length || 0} Passenger${(booking.seatCount || 0) > 1 ? 's' : ''}`;
    const durationText = formatDuration(departureDateTime, arrivalDateTime);
    const isCancellable = canCancelBooking(booking, departureDateTime);
    const canDownload = booking.status !== 'CANCELLED';

    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <View style={styles.operatorRow}>
            <Image source={require('../../assets/logo.png')} style={styles.operatorLogo} />
            <View style={styles.operatorInfo}>
              <Text style={styles.operatorName}>{booking.bus?.name || 'Bus Partner'}</Text>
              <Text style={styles.busType}>{booking.bus?.type || 'Coach'}</Text>
            </View>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
            <Text style={[styles.statusPillText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
          </View>
        </View>

        <View style={styles.tripDateRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#3B82F6" />
          <Text style={styles.tripDateText}>{formatDateLabel(departureDateTime || tripDate)}</Text>
          <Text style={styles.bookedAtText}>
            Booked {booking.bookedAt ? new Date(booking.bookedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '--'}
          </Text>
        </View>

        <View style={styles.journeySection}>
          <View style={styles.locationContainer}>
            <Text style={styles.cityName}>{booking.route?.from?.city || booking.route?.from?.name}</Text>
            <Text style={styles.stationName}>{booking.route?.from?.name}</Text>
            <Text style={styles.dateTime}>{formatTimeLabel(departureDateTime)}</Text>
          </View>

          <View style={styles.connectorWrapper}>
            <View style={styles.connectorContainer}>
              <View style={styles.dottedLine} />
              <MaterialCommunityIcons name="bus" size={18} color="#2563EB" style={styles.busIcon} />
              <View style={styles.dottedLine} />
            </View>
            {durationText && <Text style={styles.durationText}>{durationText}</Text>}
          </View>

          <View style={[styles.locationContainer, { alignItems: 'flex-end' }]}>
            <Text style={styles.cityName}>{booking.route?.to?.city || booking.route?.to?.name}</Text>
            <Text style={styles.stationName}>{booking.route?.to?.name}</Text>
            <Text style={styles.dateTime}>{formatTimeLabel(arrivalDateTime)}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>Passengers</Text>
            <Text style={styles.metaValue}>{passengersLabel}</Text>
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>Seat No.</Text>
            <Text style={styles.metaValue}>{seatLabel}</Text>
          </View>
          <View style={styles.metaColumnAmount}>
            <Text style={styles.metaLabel}>Amount</Text>
            <Text style={styles.metaValue}>{formatCurrency(booking.finalPrice ?? booking.totalPrice, booking.payment?.currency)}</Text>
          </View>
        </View>

        <View style={styles.boardingCard}>
          <View style={styles.boardingRow}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#475569" />
            <Text style={styles.boardingLabel}>Boarding</Text>
            <Text style={styles.boardingValue}>
              {booking.boardingPoint?.name || 'NA'} • {formatTimeLabel(boardingTime)}
            </Text>
          </View>
          <View style={styles.boardingRow}>
            <MaterialCommunityIcons name="map-marker-distance" size={18} color="#475569" />
            <Text style={styles.boardingLabel}>Dropping</Text>
            <Text style={styles.boardingValue}>
              {booking.droppingPoint?.name || 'NA'} {droppingTime ? `• ${formatTimeLabel(droppingTime)}` : ''}
            </Text>
          </View>
          <View style={styles.boardingRow}>
            <MaterialCommunityIcons name="credit-card" size={18} color="#475569" />
            <Text style={styles.boardingLabel}>Payment</Text>
            <Text style={styles.boardingValue}>{booking.payment?.method || '—'}</Text>
          </View>
        </View>

        {booking.coupon?.code && (
          <View style={styles.couponPill}>
            <MaterialCommunityIcons name="ticket-confirmation" size={16} color="#0F172A" />
            <Text style={styles.couponText}>{booking.coupon.code} applied</Text>
            <Text style={styles.couponSavings}>Saved ₹{booking.discountAmount || 0}</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.primaryAction, !canDownload && styles.disabledAction]}
            onPress={() => canDownload && handleDownloadTicket(booking)}
            activeOpacity={0.8}
            disabled={!canDownload || downloadingId === booking.bookingGroupId}
          >
            {downloadingId === booking.bookingGroupId ? (
              <ActivityIndicator size="small" color="#1D4ED8" />
            ) : (
              <MaterialCommunityIcons name="download" size={18} color="#1D4ED8" />
            )}
            <Text style={styles.primaryActionText}>{canDownload ? 'Download Ticket' : 'Ticket Unavailable'}</Text>
          </TouchableOpacity>

          {isCancellable ? (
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => confirmCancelBooking(booking)}
              activeOpacity={0.8}
              disabled={cancellingId === booking.bookingGroupId}
            >
              {cancellingId === booking.bookingGroupId ? (
                <ActivityIndicator size="small" color="#B91C1C" />
              ) : (
                <MaterialCommunityIcons name="cancel" size={18} color="#B91C1C" />
              )}
              <Text style={styles.secondaryActionText}>Cancel Trip</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.secondaryGhostAction} onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
              <Text style={styles.secondaryGhostText}>Book Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.topImageSection}>
        <ImageBackground
          source={require('../../assets/landing-background.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />

          <SafeAreaView edges={['top']} style={styles.safeHeader}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>My Bookings</Text>
              <Text style={styles.headerSubtitle}>Track every journey, cancellations, and receipts in one place.</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      <View style={styles.tabSelectorContainer}>
        <View style={styles.tabSelector}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {renderErrorBanner()}
      </View>

      <View style={styles.bookingsListArea}>
        {loading && !refreshing ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Fetching bookings...</Text>
          </View>
        ) : (
          <FlatList
            data={groupedBookings[selectedTab]}
            keyExtractor={(item) => item.bookingGroupId}
            contentContainerStyle={
              groupedBookings[selectedTab].length === 0
                ? styles.flatListEmpty
                : styles.scrollContent
            }
            renderItem={renderBookingCard}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#2563EB"
                colors={['#2563EB']}
              />
            }
            ListEmptyComponent={!loading ? renderEmptyState : null}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topImageSection: {
    height: SCREEN_HEIGHT * 0.24,
    width: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  safeHeader: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontSize: 14,
  },
  tabSelectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
  },
  bookingsListArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  flatListEmpty: {
    padding: 16,
    flexGrow: 1,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  operatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  operatorLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F8FAFC',
  },
  operatorInfo: {
    flex: 1,
  },
  operatorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  busType: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tripDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
  },
  tripDateText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  bookedAtText: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#94A3B8',
  },
  journeySection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationContainer: {
    flex: 1,
  },
  cityName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  stationName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  dateTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  connectorWrapper: {
    width: 80,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  connectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  dottedLine: {
    flex: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    height: 1,
  },
  busIcon: {
    marginHorizontal: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  metaColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  metaColumnAmount: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  boardingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 0,
    marginBottom: 16,
  },
  boardingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  boardingLabel: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
    width: 70,
    fontWeight: '500',
  },
  boardingValue: {
    fontSize: 13,
    color: '#0F172A',
    flex: 1,
    fontWeight: '500',
    lineHeight: 18,
  },
  couponPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 16,
  },
  couponText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B45309',
  },
  couponSavings: {
    fontSize: 12,
    color: '#B45309',
    marginLeft: 'auto',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Changed to white for better contrast if border is used, or keep blue
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5, // Added border
    borderColor: '#1D4ED8', // Blue border
  },
  primaryActionText: {
    color: '#1D4ED8', // Changed text color to blue
    fontWeight: '700',
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F87171',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  secondaryGhostAction: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryGhostText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  disabledAction: {
    backgroundColor: '#CBD5F5',
  },
  errorBanner: {
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    color: '#991B1B',
    fontSize: 13,
  },
  errorAction: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#B91C1C',
  },
  errorActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyStateSubtext: {
    textAlign: 'center',
    color: '#475569',
    fontSize: 13,
  },
  ctaButton: {
    marginTop: 8,
    backgroundColor: '#0F172A',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#475569',
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#2C5F6F',
    paddingTop: 10,
    paddingBottom: 20,
    height: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    fontWeight: '400',
  },
  navLabelActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default BookingsScreen;
