import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { busAPI } from '../services/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const NPR_TO_INR_RATE = 0.625;
const convertNprToInr = (nprAmount) => Number((Number(nprAmount || 0) * NPR_TO_INR_RATE).toFixed(2));

const SeatSelectionScreen = ({ navigation, route }) => {
  const { busData } = route.params;
  const priceNpr = Number(busData?.priceNpr ?? busData?.price ?? busData?.tripData?.fare ?? busData?.tripData?.price ?? 0);
  const priceInr = convertNprToInr(priceNpr);

  const [activeDeck, setActiveDeck] = useState('LOWER');
  const [seatGridLayout, setSeatGridLayout] = useState({ width: 0, height: 0 });
  
  // States for API data
  const [isLoading, setIsLoading] = useState(true);
  const [busInfo, setBusInfo] = useState(null);
  const [apiError, setApiError] = useState(null);
  
  // Initialize empty seat states - will be populated from API
  const [seatStates, setSeatStates] = useState({});
  const [seatMapping, setSeatMapping] = useState({}); // Maps seat number to seat object with ID
  
  // Fetch seat data from API on component mount
  useEffect(() => {
    fetchSeatData();
  }, []);
  
  const fetchSeatData = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      console.log('🪑 Starting seat data fetch...');
      console.log('🪑 Available busData:', busData);
      console.log('🪑 Available route params:', route.params);
      
      // Get auth token (not required for this endpoint, but keep if available)
      const token = (await AsyncStorage.getItem('authToken')) || (await AsyncStorage.getItem('token'));
      
      // Extract trip and stop IDs with proper fallbacks and validation
      let tripId = busData?.tripId || route.params?.tripId;
      let fromStopId = busData?.fromStopId || route.params?.fromStopId || route.params?.fromStop?.id;
      let toStopId = busData?.toStopId || route.params?.toStopId || route.params?.toStop?.id;
      
      console.log('🪑 Initial extracted IDs:', { tripId, fromStopId, toStopId });
      
      // If still missing data, try to extract from tripData
      if (!tripId || !fromStopId || !toStopId) {
        console.log('🪑 Missing some IDs, trying to extract from tripData...');
        
        const tripData = busData?.tripData || route.params?.busData?.tripData;
        const searchData = route.params?.searchData;
        
        console.log('🪑 Available tripData:', tripData);
        console.log('🪑 Available searchData:', searchData);
        
        if (tripData) {
          // Try multiple ways to get tripId - prioritize tripId field from API response
          tripId = tripId || tripData.tripId || tripData.id;
          
          // Try to get stop IDs directly from tripData first
          if (tripData.fromStop && tripData.toStop) {
            fromStopId = fromStopId || tripData.fromStop.id;
            toStopId = toStopId || tripData.toStop.id;
            console.log('🪑 Got stop IDs from tripData directly:', { fromStopId, toStopId });
          } else {
            // Try to find stop IDs from trip route data
            const tripRoute = tripData.route || {};
            const stops = Array.isArray(tripRoute.stops) ? tripRoute.stops : [];
            
            if (stops.length > 0 && searchData) {
              const startLocation = searchData.startLocation || busData?.from || '';
              const endLocation = searchData.endLocation || busData?.to || '';
              
              const fromStop = stops.find(stop => 
                stop?.location && typeof stop.location === 'string' && 
                stop.location.toLowerCase().includes(startLocation.toLowerCase())
              );
              
              const toStop = stops.find(stop => 
                stop?.location && typeof stop.location === 'string' &&
                stop.location.toLowerCase().includes(endLocation.toLowerCase())
              );
              
              fromStopId = fromStopId || fromStop?.id;
              toStopId = toStopId || toStop?.id;
              
              console.log('🪑 Found stops from route data:', { 
                fromStop: fromStop,
                toStop: toStop,
                fromStopId: fromStopId, 
                toStopId: toStopId 
              });
            }
          }
        }
      }
      
      console.log('🪑 Final extracted IDs:', { tripId, fromStopId, toStopId });
      
      if (!tripId) {
        throw new Error('Trip ID is missing. Please try selecting the bus again.');
      }
      
      if (!fromStopId) {
        throw new Error('Starting stop information is missing. Please go back and search again.');
      }
      
      if (!toStopId) {
        throw new Error('Destination stop information is missing. Please go back and search again.');
      }
      
      console.log('Final API call parameters:', { tripId, fromStopId, toStopId });
      
      const response = await busAPI.getBusInfo(tripId, fromStopId, toStopId, token);
      
      if (response.success) {
        setBusInfo(response.data);
        
        // Transform API seat data to current component format
        const newSeatStates = {};
        const newSeatMapping = {};
        
        // Process lower deck seats
        if (response.data.seats?.lowerDeck) {
          response.data.seats.lowerDeck.forEach(seat => {
            const seatId = seat.id; // Use seat ID as unique key
            newSeatStates[seatId] = seat.isAvailable ? 'available' : 'booked';
            newSeatMapping[seatId] = {
              id: seat.id,
              seatNumber: seat.seatNumber,
              type: seat.type,
              level: seat.level,
              row: seat.row,
              column: seat.column,
              rowSpan: seat.rowSpan,
              columnSpan: seat.columnSpan,
              isAvailable: seat.isAvailable
            };
          });
        }
        
        // Process upper deck seats if available
        if (response.data.seats?.upperDeck) {
          response.data.seats.upperDeck.forEach(seat => {
            const seatId = seat.id; // Use seat ID as unique key
            newSeatStates[seatId] = seat.isAvailable ? 'available' : 'booked';
            newSeatMapping[seatId] = {
              id: seat.id,
              seatNumber: seat.seatNumber,
              type: seat.type,
              level: seat.level,
              row: seat.row,
              column: seat.column,
              rowSpan: seat.rowSpan,
              columnSpan: seat.columnSpan,
              isAvailable: seat.isAvailable
            };
          });
        }
        
        setSeatStates(newSeatStates);
        setSeatMapping(newSeatMapping);
        console.log('🎯 Seat states loaded:', newSeatStates);
        console.log('🎯 Seat mapping loaded:', newSeatMapping);
        console.log('🎯 Available seats count:', response.data.seats?.availableCount || 0);
        console.log('🎯 Backend seat numbers:', Object.keys(newSeatStates));
        console.log('🎯 Backend lower deck seats:', response.data.seats?.lowerDeck || []);
        console.log('🎯 Backend upper deck seats:', response.data.seats?.upperDeck || []);
        
      } else {
        throw new Error(response.error || 'Failed to fetch seat data from server');
      }
      
    } catch (error) {
      console.error('Error fetching seat data:', error);
      setApiError(error.message);
      
      Alert.alert(
        'Error Loading Seats',
        error.message + '\n\nWould you like to try again?',
        [
          { text: 'Go Back', onPress: () => navigation.goBack() },
          { text: 'Retry', onPress: fetchSeatData }
        ]
      );
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatPress = (seatId) => {
    if (seatStates[seatId] === 'booked') return; // Can't select booked seats
    
    setSeatStates(prev => ({
      ...prev,
      [seatId]: prev[seatId] === 'selected' ? 'available' : 'selected'
    }));
  };

  const getSeatStyle = (state) => {
    switch(state) {
      case 'selected':
        return { backgroundColor: '#2D9B9B', borderColor: '#2D9B9B' };
      case 'booked':
        return { backgroundColor: '#FF4D4F', borderColor: '#FF4D4F' };
      default:
        return { backgroundColor: '#FFFFFF', borderColor: '#D1D5DB' };
    }
  };

  const getSeatTextStyle = (state) => {
    return state === 'available' 
      ? { color: '#2C2C2C' } 
      : { color: '#FFFFFF' };
  };

  const getJourneySeatPricing = () => {
    const fromStop = busInfo?.route?.fromStop;
    const toStop = busInfo?.route?.toStop;
    if (!fromStop || !toStop) {
      return {
        lowerSeater: 0,
        lowerSleeper: 0,
        upperSleeper: 0,
      };
    }

    return {
      lowerSeater: Math.abs(Number(toStop.lowerSeaterPrice || 0) - Number(fromStop.lowerSeaterPrice || 0)),
      lowerSleeper: Math.abs(Number(toStop.lowerSleeperPrice || 0) - Number(fromStop.lowerSleeperPrice || 0)),
      upperSleeper: Math.abs(Number(toStop.upperSleeperPrice || 0) - Number(fromStop.upperSleeperPrice || 0)),
    };
  };

  const renderSeatBox = (seat) => {
    const state = seatStates[seat.id] || (seat.isAvailable ? 'available' : 'booked');
    const isSleeper = String(seat.type || '').toUpperCase() === 'SLEEPER' || Number(seat.rowSpan || 1) > 1 || Number(seat.columnSpan || 1) > 1;
    const iconName = isSleeper ? 'bed' : 'seat';
    const iconSize = isSleeper ? 20 : 16;

    const row = Number(seat.row || 0);
    const column = Number(seat.column || 0);
    const rowSpan = Math.max(1, Number(seat.rowSpan || 1));
    const columnSpan = Math.max(1, Number(seat.columnSpan || 1));

    const gridColumns = Number(busInfo?.bus?.gridColumns || busInfo?.gridColumns || 4);
    const gutter = 10;
    const containerWidth = seatGridLayout.width || 1;
    const cellSize = Math.floor((containerWidth - (gridColumns - 1) * gutter) / gridColumns);

    const left = column * (cellSize + gutter);
    const top = row * (cellSize + gutter);
    const width = columnSpan * cellSize + (columnSpan - 1) * gutter;
    const height = rowSpan * cellSize + (rowSpan - 1) * gutter;

    const seatStyle = [
      styles.seatBox,
      { left, top, width, height },
      getSeatStyle(state),
      isSleeper ? styles.seatBoxSleeper : styles.seatBoxSeater,
    ];

    const isDisabled = state === 'booked';

    return (
      <TouchableOpacity
        key={seat.id}
        style={seatStyle}
        onPress={() => handleSeatPress(seat.id)}
        disabled={isDisabled}
        activeOpacity={0.75}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={iconSize}
          color={state === 'available' ? '#111827' : '#FFFFFF'}
        />
        <Text style={[styles.seatNumberText, { color: state === 'available' ? '#111827' : '#FFFFFF' }]}>
          {seat.seatNumber}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSeatMap = () => {
    if (!busInfo?.seats) {
      return (
        <View style={styles.seatMapEmpty}>
          <Text style={styles.seatMapEmptyText}>Loading seats...</Text>
        </View>
      );
    }

    const deckSeats = activeDeck === 'UPPER'
      ? (busInfo.seats.upperDeck || [])
      : (busInfo.seats.lowerDeck || []);

    if (!deckSeats || deckSeats.length === 0) {
      return (
        <View style={styles.seatMapEmpty}>
          <Text style={styles.seatMapEmptyText}>No seats available</Text>
        </View>
      );
    }

    const gridColumns = Number(busInfo?.bus?.gridColumns || busInfo?.gridColumns || 4);
    const gutter = 10;
    const containerWidth = seatGridLayout.width || 1;
    const cellSize = Math.floor((containerWidth - (gridColumns - 1) * gutter) / gridColumns);

    // Compute rows actually needed for this deck so the card doesn't become overly tall.
    const requiredRows = deckSeats.reduce((maxRow, seat) => {
      const row = Number(seat.row || 0);
      const rowSpan = Math.max(1, Number(seat.rowSpan || 1));
      return Math.max(maxRow, row + rowSpan);
    }, 0);

    const safeRows = Math.max(1, requiredRows);
    const mapHeight = safeRows * cellSize + Math.max(0, (safeRows - 1) * gutter);

    return (
      <View style={styles.seatMapOuter}>
        <View style={styles.seatMapHeaderRow}>
          <View style={styles.frontBox}>
            <Text style={styles.frontText}>← FRONT →</Text>
          </View>
          <View style={styles.driverBox}>
            <MaterialCommunityIcons name="steering" size={18} color="#A16207" />
            <Text style={styles.driverText}>DRIVER</Text>
          </View>
        </View>

        <View
          style={[styles.seatMapGrid, { height: mapHeight }]}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            if (width !== seatGridLayout.width || height !== seatGridLayout.height) {
              setSeatGridLayout({ width, height });
            }
          }}
        >
          {deckSeats.map(renderSeatBox)}
        </View>

        <View style={styles.backBox}>
          <Text style={styles.backText}>BACK</Text>
        </View>
      </View>
    );
  };

  const selectedSeats = Object.keys(seatStates).filter(
    key => seatStates[key] === 'selected'
  );
  
  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2D9B9B" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
          Loading seat information...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar hidden />
      
      {/* Top 25% - Background Image with Header (Full-bleed from top) */}
      <ImageBackground
        source={require('../../assets/landing-background.jpg')}
        style={styles.topSection}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        
        {/* SafeArea only for header content */}
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.routeText}>
                {busData.from} To {busData.to}
              </Text>
              <Text style={styles.dateText}>{busData.date}</Text>
            </View>
            
            <View style={styles.headerPlaceholder} />
          </View>
        </SafeAreaView>
      </ImageBackground>

        {/* Scrollable Content - Overlapping the image */}
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Bus Info Card - Floating over background image */}
          <View style={styles.busInfoCardWrapper}>
          <View style={styles.busInfoCard}>
            <View style={styles.busInfoRow}>
              <View style={styles.busInfoLeft}>
                <Text style={styles.busTimeText}>
                  {busData.departureTime} – {busData.arrivalTime}
                </Text>
                <Text style={styles.busOperatorText}>{busData.operator}</Text>
                <Text style={styles.busTypeText}>{busData.type}</Text>
              </View>
              <View style={styles.busInfoRight}>
                <View style={styles.ratingContainer}>
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text style={styles.ratingText}>{busData.rating}</Text>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.priceText}>NPR {priceNpr.toFixed(2)}</Text>
                  <Text style={styles.priceSubText}>(₹ {priceInr.toFixed(2)})</Text>
                </View>
                <Text style={styles.durationText}>{busData.duration}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Seat Status Legend - Direct on white background */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#2D9B9B' }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#FF4D4F' }]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
        </View>

        {/* Deck Tabs */}
        <View style={styles.deckTabsRow}>
          <TouchableOpacity
            style={[styles.deckTab, activeDeck === 'LOWER' && styles.deckTabActive]}
            onPress={() => setActiveDeck('LOWER')}
            activeOpacity={0.8}
          >
            <Text style={[styles.deckTabText, activeDeck === 'LOWER' && styles.deckTabTextActive]}>Lower Deck</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deckTab, styles.deckTabLast, activeDeck === 'UPPER' && styles.deckTabActive]}
            onPress={() => setActiveDeck('UPPER')}
            activeOpacity={0.8}
          >
            <Text style={[styles.deckTabText, activeDeck === 'UPPER' && styles.deckTabTextActive]}>Upper Deck</Text>
          </TouchableOpacity>
        </View>

        {/* Seat Pricing */}
        <View style={styles.seatPricingCard}>
          <Text style={styles.seatPricingTitle}>Seat Pricing</Text>
          {(() => {
            const pricing = getJourneySeatPricing();
            return (
              <View style={styles.seatPricingRow}>
                <View style={styles.seatPricingCol}>
                  <Text style={styles.seatPricingLabel}>Lower Seater</Text>
                  <Text style={styles.seatPricingValue}>NPR {pricing.lowerSeater.toFixed(2)} (₹{convertNprToInr(pricing.lowerSeater).toFixed(2)})</Text>
                </View>
                <View style={styles.seatPricingCol}>
                  <Text style={styles.seatPricingLabel}>Lower Sleeper</Text>
                  <Text style={styles.seatPricingValue}>NPR {pricing.lowerSleeper.toFixed(2)} (₹{convertNprToInr(pricing.lowerSleeper).toFixed(2)})</Text>
                </View>
                <View style={styles.seatPricingCol}>
                  <Text style={styles.seatPricingLabel}>Upper Sleeper</Text>
                  <Text style={styles.seatPricingValue}>NPR {pricing.upperSleeper.toFixed(2)} (₹{convertNprToInr(pricing.upperSleeper).toFixed(2)})</Text>
                </View>
              </View>
            );
          })()}
        </View>

        {/* Seat Layout */}
        <View style={styles.seatLayoutContainer}>
          {renderSeatMap()}
        </View>

        {/* Bottom spacing for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Continue Button - Direct on white background */}
      <View style={styles.buttonWrapper}>
        {(() => {
          const selectedSeatCount = Object.keys(seatStates).filter(key => seatStates[key] === 'selected').length;
          const isDisabled = selectedSeatCount === 0;
          
          return (
            <TouchableOpacity
              style={[styles.continueButton, isDisabled && styles.continueButtonDisabled]}
              activeOpacity={isDisabled ? 1 : 0.8}
              disabled={isDisabled}
              onPress={() => {
                // Navigate to boarding points with API data
                const selectedSeatIds = Object.keys(seatStates).filter(key => seatStates[key] === 'selected');
                const selectedSeatObjects = selectedSeatIds.map(seatId => seatMapping[seatId]).filter(Boolean);
                
                console.log('🎯 Selected seat IDs:', selectedSeatIds);
                console.log('🎯 Selected seat objects:', selectedSeatObjects);
                console.log('🎯 Seat mapping keys:', Object.keys(seatMapping));
                console.log('🎯 Seat states:', seatStates);
                
                // Validate selection before navigation
                if (selectedSeatObjects.length === 0) {
                  console.error('❌ No valid seat objects found for selection');
                  Alert.alert('No Seats Selected', 'Please select at least one seat before continuing.');
                  return;
                }

                // Ensure seat objects have required properties
                const invalidSeats = selectedSeatObjects.filter(seat => !seat || !seat.id);
                if (invalidSeats.length > 0) {
                  console.error('❌ Invalid seat objects found:', invalidSeats);
                  Alert.alert('Seat Selection Error', 'Some seat data is invalid. Please try selecting seats again.');
                  return;
                }
                
                console.log('✅ Navigating to BoardingPoints with valid seats:', selectedSeatObjects.length);
                
                navigation.navigate('BoardingPoints', {
                  busData,
                  selectedSeats: selectedSeatObjects, // Contains full seat objects with IDs
                  busInfo: busInfo,
                  boardingPoints: busInfo?.route?.boardingPoints || [],
                  droppingPoints: busInfo?.route?.droppingPoints || [],
                });
              }}
            >
              <Text style={[styles.continueButtonText, isDisabled && styles.continueButtonTextDisabled]}>
                Continue Booking
              </Text>
            </TouchableOpacity>
          );
        })()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    height: SCREEN_HEIGHT * 0.25, // 25% of screen height for background image
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43, 99, 110, 0.85)',
  },
  scrollContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.12, // Lift content slightly so seat card/back stays visible
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 100,
    backgroundColor: 'transparent',
  },
  busInfoCardWrapper: {
    paddingTop: 0,
    marginTop: 0,
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  routeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginTop: 2,
  },

  // Bus Info Card Styles
  busInfoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  busInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  busInfoLeft: {
    flex: 1,
  },
  busTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  busOperatorText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  busTypeText: {
    fontSize: 13,
    color: '#7A7A7A',
  },
  busInfoRight: {
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starIcon: {
    fontSize: 14,
    marginRight: 3,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  priceBlock: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5B7EFF',
  },
  priceSubText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },
  durationText: {
    fontSize: 12,
    color: '#7A7A7A',
  },

  // Legend Styles
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendBox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#4A4A4A',
    fontWeight: '500',
  },

  // Seat Layout Styles
  seatLayoutContainer: {
    marginHorizontal: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },

  deckTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  deckTab: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  deckTabLast: {
    marginRight: 0,
  },
  deckTabActive: {
    backgroundColor: '#5B7EFF',
  },
  deckTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  deckTabTextActive: {
    color: '#FFFFFF',
  },

  seatPricingCard: {
    marginHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#EEF2FF',
    padding: 12,
    marginBottom: 14,
  },
  seatPricingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  seatPricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seatPricingCol: {
    flex: 1,
    marginRight: 10,
  },
  seatPricingLabel: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
  },
  seatPricingValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
  },

  seatMapOuter: {
    alignItems: 'center',
  },
  seatMapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  frontBox: {
    borderWidth: 2,
    borderColor: '#60A5FA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#DBEAFE',
  },
  frontText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  driverBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FEF3C7',
  },
  driverText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '900',
    color: '#92400E',
  },
  seatMapGrid: {
    width: '100%',
    position: 'relative',
    borderRadius: 14,
    borderWidth: 6,
    borderColor: '#1F2937',
    backgroundColor: '#FFFFFF',
    padding: 22,
    marginBottom: 10,
  },
  backBox: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#D1D5DB',
    paddingVertical: 10,
    alignItems: 'center',
  },
  backText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#374151',
  },
  seatBox: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatBoxSeater: {
    borderRadius: 8,
  },
  seatBoxSleeper: {
    borderRadius: 10,
  },
  seatNumberText: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '800',
  },
  seatMapEmpty: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  seatMapEmptyText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },

  // Bottom Button Styles
  buttonWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  continueButton: {
    backgroundColor: '#5B7EFF',
    borderRadius: 18,
    height: 40,
    paddingHorizontal: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#5B7EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: 'transparent',
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  continueButtonTextDisabled: {
    color: '#E5E7EB',
  },
});

export default SeatSelectionScreen;
