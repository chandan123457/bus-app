import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { userAPI } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const formatDate = (value) => {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatCurrency = (amount = 0) => {
  const safeAmount = Number(amount) || 0;
  return `₹${safeAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalBookings: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    setError(null);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const cachedUser = await AsyncStorage.getItem('userData');

      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          setProfile(parsed);
        } catch (parseError) {
          console.warn('Failed to parse cached user data:', parseError);
        }
      }

      if (!token) {
        setLoading(false);
        setError('Please sign in to view your profile.');
        navigation.navigate('SignIn');
        return;
      }

      const result = await userAPI.getProfile(token);

      if (result.success) {
        setProfile(result.data.user);
        setEditedName(result.data.user?.name || '');
        setEditedPhone(result.data.user?.phone || '');
        setStats({
          totalBookings: result.data.statistics?.totalBookings || 0,
          totalSpent: result.data.statistics?.totalSpent || 0,
        });
        await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));
      } else {
        setError(result.error || 'Unable to load profile right now.');
      }
    } catch (fetchError) {
      console.error('Profile fetch error:', fetchError);
      setError('Unable to load profile right now.');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile])
  );

  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Stay Logged In', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['authToken', 'userData']);
          navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
        },
      },
    ]);
  }, [navigation]);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedName(profile?.name || '');
      setEditedPhone(profile?.phone || '');
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      Alert.alert('Invalid Input', 'Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Please sign in again');
        return;
      }

      const updateData = {
        name: editedName.trim(),
        phone: editedPhone.trim() || undefined,
      };

      const result = await userAPI.updateProfile(updateData, token);

      if (result.success) {
        setProfile(result.data.user);
        await AsyncStorage.setItem('userData', JSON.stringify(result.data.user));
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };



  const travelerName = profile?.name || 'Traveler';
  const avatarInitial = travelerName.charAt(0).toUpperCase();
  const isVerified = Boolean(profile?.verified);
  const verificationLabel = isVerified ? 'Verified' : 'Pending';
  const verificationIcon = isVerified ? 'check-decagram' : 'shield-alert';

  const accountDetails = [
    {
      id: 'name',
      label: 'Full Name',
      value: travelerName,
      icon: 'account-outline',
      editable: true,
    },
    {
      id: 'email',
      label: 'Email Address',
      value: profile?.email || 'Add your email address',
      icon: 'email-check-outline',
      editable: false,
    },
    {
      id: 'phone',
      label: 'Phone Number',
      value: profile?.phone || 'Add your phone number',
      icon: 'phone-outline',
      editable: true,
    },
    {
      id: 'memberSince',
      label: 'Member Since',
      value: formatDate(profile?.createdAt),
      icon: 'calendar-month-outline',
      editable: false,
    },
  ];

  const quickActions = [
    {
      id: 'bookings',
      label: 'View Bookings',
      icon: 'ticket-confirmation-outline',
      onPress: () => navigation.navigate('Bookings'),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'bell-outline',
      onPress: handleNotifications,
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: 'logout',
      onPress: handleLogout,
      destructive: true,
    },
  ];

  const renderAccountDetail = (detail) => {
    const isNameField = detail.id === 'name';
    const isPhoneField = detail.id === 'phone';
    const showInput = isEditing && detail.editable;

    return (
      <View key={detail.id} style={styles.infoRow}>
        <View style={styles.infoLabelGroup}>
          <MaterialCommunityIcons name={detail.icon} size={20} color="#6366F1" />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>{detail.label}</Text>
            {showInput ? (
              <TextInput
                style={styles.infoInput}
                value={isNameField ? editedName : isPhoneField ? editedPhone : detail.value}
                onChangeText={(text) => {
                  if (isNameField) setEditedName(text);
                  else if (isPhoneField) setEditedPhone(text);
                }}
                placeholder={detail.label}
                keyboardType={isPhoneField ? 'phone-pad' : 'default'}
                editable={!saving}
              />
            ) : (
              <Text style={styles.infoValue}>{detail.value}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderQuickAction = (action) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionRow}
      onPress={action.onPress}
      activeOpacity={0.8}
    >
      <View style={styles.quickActionLeft}>
        <View
          style={[
            styles.quickActionIcon,
            action.destructive && styles.quickActionIconDanger,
          ]}
        >
          <MaterialCommunityIcons
            name={action.icon}
            size={18}
            color={action.destructive ? '#FFFFFF' : '#4F46E5'}
          />
        </View>
        <Text
          style={[
            styles.quickActionText,
            action.destructive && styles.quickActionDangerText,
          ]}
        >
          {action.label}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.heroSection}>
        <ImageBackground
          source={require('../../assets/landing-background.jpg')}
          style={styles.heroBackground}
          imageStyle={styles.heroBackgroundImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />

          <SafeAreaView edges={['top']} style={styles.heroInner}>
            <View style={styles.heroBrandRow}>
              <Image source={require('../../assets/logo.png')} style={styles.brandLogo} />
              <Text style={styles.brandTagline}>Your Journey Partner</Text>
            </View>
            <Text style={styles.heroTitle}>My Profile</Text>
            <Text style={styles.heroSubtitle}>Manage your account information</Text>
          </SafeAreaView>
        </ImageBackground>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#B91C1C" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchUserProfile} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{avatarInitial}</Text>
          </View>
          <View style={styles.avatarMeta}>
            <Text style={styles.avatarName}>{travelerName}</Text>
            <Text style={styles.avatarEmail} numberOfLines={1} ellipsizeMode="tail">{profile?.email || 'Add your email'}</Text>
          </View>
          <View style={[
            styles.verificationPill,
            isVerified ? styles.verificationPillSuccess : styles.verificationPillWarning,
          ]}>
            <MaterialCommunityIcons
              name={verificationIcon}
              size={16}
              color={isVerified ? '#10B981' : '#F97316'}
            />
            <Text
              style={[
                styles.verificationText,
                isVerified ? styles.verificationSuccessText : styles.verificationWarningText,
              ]}
            >
              {verificationLabel}
            </Text>
          </View>
        </View>

        {loading && !profile ? (
          <View style={styles.loaderWrapper}>
            <ActivityIndicator size="small" color="#4F46E5" />
            <Text style={styles.loaderText}>Fetching profile...</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Account Information</Text>
                {!isEditing ? (
                  <TouchableOpacity style={styles.editLink} onPress={handleEditToggle} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="pencil-outline" size={16} color="#6366F1" />
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={handleEditToggle}
                      activeOpacity={0.7}
                      disabled={saving}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                      onPress={handleSaveProfile}
                      activeOpacity={0.7}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.saveText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={styles.infoGrid}>{accountDetails.map(renderAccountDetail)}</View>
            </View>

            <View style={styles.cardGrid}>
              <View style={[styles.card, styles.quickActionsCard]}>
                <Text style={styles.cardTitle}>Quick Actions</Text>
                <View style={styles.quickActionDivider} />
                {quickActions.map(renderQuickAction)}
              </View>

              <View style={[styles.card, styles.statusCard]}>
                <Text style={[styles.cardTitle, styles.statusCardTitle]}>Account Status</Text>
                <View style={styles.statusBadge}>
                  <MaterialCommunityIcons
                    name={verificationIcon}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.statusBadgeText}>{verificationLabel}</Text>
                </View>
                <View style={styles.statusMetaRow}>
                  <Text style={styles.statusLabel}>Account Type</Text>
                  <Text style={styles.statusValue}>Traveler</Text>
                </View>
                <View style={styles.statusMetaRow}>
                  <Text style={styles.statusLabel}>Member Since</Text>
                  <Text style={styles.statusValue}>{formatDate(profile?.createdAt)}</Text>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statsChip}>
                    <Text style={styles.statsChipNumber}>{stats.totalBookings}</Text>
                    <Text style={styles.statsChipLabel}>Total Bookings</Text>
                  </View>
                  <View style={styles.statsChip}>
                    <Text style={styles.statsChipNumber}>{formatCurrency(stats.totalSpent)}</Text>
                    <Text style={styles.statsChipLabel}>Total Spent</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  heroSection: {
    paddingBottom: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroBackground: {
    width: '100%',
    paddingBottom: 24,
  },
  heroBackgroundImage: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    opacity: 0.85,
  },
  heroInner: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  heroBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  brandTagline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 18,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    navLabelActive: {
      color: '#FFFFFF',
      fontWeight: '500',
    },
  },
  errorText: {
    flex: 1,
    color: '#7F1D1D',
    fontSize: 13,
  },
  retryButton: {
    backgroundColor: '#B91C1C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarLetter: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4F46E5',
  },
  avatarMeta: {
    flex: 1,
    gap: 2,
  },
  avatarName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  avatarEmail: {
    color: '#64748B',
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  verificationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  verificationPillSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  verificationPillWarning: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  verificationText: {
    fontWeight: '600',
    fontSize: 12,
  },
  verificationSuccessText: {
    color: '#047857',
  },
  verificationWarningText: {
    color: '#C2410C',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusCardTitle: {
    color: '#FFFFFF',
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    minWidth: 60,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  infoInput: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
  },
  infoGrid: {
    gap: 16,
  },
  infoRow: {
    paddingVertical: 4,
  },
  infoLabelGroup: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  infoLabel: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
  cardGrid: {
    flexDirection: SCREEN_WIDTH > 700 ? 'row' : 'column',
    gap: 16,
  },
  quickActionsCard: {
    flex: 1,
  },
  quickActionDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  quickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  quickActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIconDanger: {
    backgroundColor: '#FCA5A5',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  quickActionDangerText: {
    color: '#B91C1C',
  },
  statusCard: {
    flex: SCREEN_WIDTH > 700 ? 0.8 : 1,
    backgroundColor: '#1E1B4B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4338CA',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginVertical: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statusMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statusLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  statusValue: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  statsChip: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    padding: 12,
    borderRadius: 16,
  },
  statsChipNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statsChipLabel: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    fontSize: 12,
  },
  loaderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  loaderText: {
    color: '#475569',
  },
});

export default ProfileScreen;
