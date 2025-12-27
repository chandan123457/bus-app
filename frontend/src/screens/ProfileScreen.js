import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from '../services/api';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Bottom Navigation Icons
const HomeIconNav = ({ active = false }) => (
  <Svg width="26" height="26" viewBox="0 0 24 24">
    <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill={active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}/>
  </Svg>
);

const BookingsIconNav = ({ active = false }) => (
  <Svg width="26" height="26" viewBox="0 0 24 24">
    <Path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" fill={active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}/>
  </Svg>
);

const OffersIconNav = ({ active = false }) => (
  <Svg width="26" height="26" viewBox="0 0 24 24">
    <Path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" fill={active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}/>
  </Svg>
);

const SupportIconNav = ({ active = false }) => (
  <Svg width="26" height="26" viewBox="0 0 24 24">
    <Path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z" fill={active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}/>
  </Svg>
);

const ProfileIconNav = ({ active = false }) => (
  <Svg width="26" height="26" viewBox="0 0 24 24">
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill={active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}/>
  </Svg>
);

const ProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ totalBookings: 0, totalSpent: 0 });

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (!token) {
        Alert.alert('Not Logged In', 'Please sign in to view your profile', [
          { text: 'OK', onPress: () => navigation.navigate('SignIn') }
        ]);
        return;
      }

      // If we have cached user data, show it immediately
      if (userData) {
        const user = JSON.parse(userData);
        setName(user.name || '');
        setEmail(user.email || '');
        setMobileNumber(user.phone || '');
      }

      // Fetch fresh profile data from API
      const result = await userAPI.getProfile(token);
      
      if (result.success) {
        const profileData = result.data.user;
        const stats = result.data.statistics;
        
        // Update state with fresh data
        setName(profileData.name || '');
        setEmail(profileData.email || '');
        setMobileNumber(profileData.phone || '');
        setUserStats({
          totalBookings: stats?.totalBookings || 0,
          totalSpent: stats?.totalSpent || 0
        });
        
        // Update cached user data
        await AsyncStorage.setItem('userData', JSON.stringify(profileData));
      } else {
        // If API fails but we have cached data, show cached data
        if (!userData) {
          Alert.alert('Error', result.error || 'Failed to load profile data');
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleBottomNav = (tab) => {
    if (tab === 'Home') {
      navigation.navigate('Home');
    } else if (tab === 'Bookings') {
      navigation.navigate('Bookings');
    } else if (tab === 'Offers') {
      navigation.navigate('Offers');
    } else if (tab === 'Support') {
      navigation.navigate('HelpSupport');
    } else if (tab === 'Profile') {
      // Already on Profile screen
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Top Background & Header */}
      <View style={styles.topImageSection}>
        <ImageBackground
          source={require('../../assets/landing-background.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          
          <SafeAreaView edges={['top']} style={styles.safeHeader}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Profile</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      {/* Profile Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.avatar}
          />
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Loading State */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : (
            <>
              {/* User Statistics Card */}
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Your Travel Stats</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{userStats.totalBookings}</Text>
                    <Text style={styles.statLabel}>Total Bookings</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>₹{userStats.totalSpent.toFixed(0)}</Text>
                    <Text style={styles.statLabel}>Total Spent</Text>
                  </View>
                </View>
              </View>

              {/* Profile Section Header */}
              <View style={styles.profileSectionHeader}>
                <Text style={styles.profileSectionTitle}>Profile Section</Text>
                <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="account-edit" size={18} color="#FFFFFF" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>

              {/* Profile Details Form */}
              <View style={styles.formSection}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.inputField}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Mobile Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={styles.inputField}
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholder="Enter mobile number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.inputField}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Age & Gender Row */}
          <View style={styles.ageGenderRow}>
            {/* Age */}
            <View style={styles.ageContainer}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.ageInput}
                value={age}
                onChangeText={setAge}
                placeholder="Age"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            {/* Gender */}
            <View style={styles.genderContainer}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderOptions}>
                <TouchableOpacity
                  style={styles.genderOption}
                  onPress={() => setGender('male')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="gender-male"
                    size={24}
                    color={gender === 'male' ? '#3B82F6' : '#9CA3AF'}
                  />
                  <View style={[
                    styles.genderCircle,
                    gender === 'male' && styles.genderCircleSelected
                  ]}>
                    {gender === 'male' && <View style={styles.genderCircleInner} />}
                  </View>
                  <Text style={styles.genderText}>Male</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.genderOption}
                  onPress={() => setGender('female')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="gender-female"
                    size={24}
                    color={gender === 'female' ? '#3B82F6' : '#9CA3AF'}
                  />
                  <View style={[
                    styles.genderCircle,
                    gender === 'female' && styles.genderCircleSelected
                  ]}>
                    {gender === 'female' && <View style={styles.genderCircleInner} />}
                  </View>
                  <Text style={styles.genderText}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* General Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>General Settings</Text>
            
            {/* Notifications */}
            <View style={styles.settingCard}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="bell" size={24} color="#3B82F6" />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Language */}
            <TouchableOpacity style={styles.settingCard} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons name="web" size={24} color="#3B82F6" />
                <Text style={styles.settingText}>Language</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{language}</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Official Documents Section */}
          <View style={styles.documentsSection}>
            <Text style={styles.sectionTitle}>Official Documents</Text>
            
            {/* Terms & Conditions */}
            <TouchableOpacity style={styles.documentCard} activeOpacity={0.7}>
              <MaterialCommunityIcons name="file-document" size={24} color="#3B82F6" />
              <Text style={styles.documentText}>Terms & Conditions</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Privacy & Security */}
            <TouchableOpacity style={[styles.documentCard, styles.lastDocumentCard]} activeOpacity={0.7}>
              <MaterialCommunityIcons name="shield-lock" size={24} color="#3B82F6" />
              <Text style={styles.documentText}>Privacy & Security</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* About Us */}
          <View style={styles.aboutSection}>
            <TouchableOpacity style={styles.documentCard} activeOpacity={0.7}>
              <MaterialCommunityIcons name="information" size={24} color="#3B82F6" />
              <Text style={styles.documentText}>About Us</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
            </>
          )}
        </ScrollView>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleBottomNav('Home')}
          activeOpacity={0.7}
        >
          <HomeIconNav active={false} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleBottomNav('Bookings')}
          activeOpacity={0.7}
        >
          <BookingsIconNav active={false} />
          <Text style={styles.navLabel}>Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleBottomNav('Offers')}
          activeOpacity={0.7}
        >
          <OffersIconNav active={false} />
          <Text style={styles.navLabel}>Offers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleBottomNav('Support')}
          activeOpacity={0.7}
        >
          <SupportIconNav active={false} />
          <Text style={styles.navLabel}>Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleBottomNav('Profile')}
          activeOpacity={0.7}
        >
          <ProfileIconNav active={true} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light off-white background
  },
  
  // Top Image Section
  topImageSection: {
    height: SCREEN_HEIGHT * 0.18,
    width: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43, 99, 110, 0.85)', // Soft teal overlay
  },
  safeHeader: {
    flex: 1,
  },
  
  // Header
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600', // Semi-bold
    letterSpacing: 0.3,
  },

  // Profile Avatar
  avatarContainer: {
    alignItems: 'center',
    marginTop: -50, // Overlap with background
    zIndex: 10,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 46,
  },

  // Content Area
  contentArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60, // Space for avatar
    paddingBottom: 100, // Space for bottom navigation
  },

  // Profile Section Header
  profileSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // Form Section
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Age & Gender Row
  ageGenderRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  ageContainer: {
    flex: 1,
  },
  ageInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  genderContainer: {
    flex: 1,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  genderOption: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  genderCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderCircleSelected: {
    borderColor: '#3B82F6',
  },
  genderCircleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  genderText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '400',
  },

  // Settings Section
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
  },

  // Documents Section
  documentsSection: {
    marginBottom: 0,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lastDocumentCard: {
    marginBottom: 12, // Equal gap between Privacy & Security and About Us
  },
  documentText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
  },

  // About Section
  aboutSection: {
    marginBottom: 24,
  },

  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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

  // Loading State
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },

  // Statistics Card
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
});

export default ProfileScreen;

