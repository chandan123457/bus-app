/**
 * Home / Dashboard Screen - Post Login
 * 
 * Features:
 * - Header with dark map background, app name, subtitle
 * - Main booking card with From/To inputs, swap icon, date selector
 * - Quick action cards (My Bookings, Offers)
 * - Offer banner with coupon code
 * - Bottom navigation bar
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { busAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

// Custom SVG Icons
const BusIcon = ({ color = '#666' }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" fill={color}/>
  </Svg>
);

const SwapIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" fill="#4A90E2"/>
  </Svg>
);

const CalendarIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" fill="#4A90E2"/>
  </Svg>
);

const BookingIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24">
    <Path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54zM9 8h2v8H9zm4 0h2v8h-2z" fill="#4A90E2"/>
  </Svg>
);

const OfferIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24">
    <Path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" fill="#4A90E2"/>
  </Svg>
);

const PercentIcon = () => (
  <Svg width="38" height="38" viewBox="0 0 24 24">
    <Circle cx="6.5" cy="6.5" r="2.5" fill="#4A90E2"/>
    <Circle cx="17.5" cy="17.5" r="2.5" fill="#4A90E2"/>
    <Path d="M19 5L5 19" stroke="#4A90E2" strokeWidth="2.5" strokeLinecap="round"/>
  </Svg>
);

const BellIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" fill="#FFFFFF"/>
  </Svg>
);

const PersonIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#FFFFFF"/>
  </Svg>
);

const MenuIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="#FFFFFF"/>
  </Svg>
);

const HomeScreen = ({ navigation }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date());
  const [isSearching, setIsSearching] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // DateTimePicker handlers
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDateForAPI = (selectedDate) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSearch = async () => {
    // Validate inputs
    if (!from || !to) {
      Alert.alert('Missing Information', 'Please select both departure and destination locations.');
      return;
    }

    if (from === to) {
      Alert.alert('Invalid Route', 'Departure and destination locations cannot be the same.');
      return;
    }

    if (!date || isNaN(date.getTime())) {
      Alert.alert('Missing Information', 'Please select a travel date.');
      return;
    }

    // Check if selected date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      Alert.alert('Invalid Date', 'Please select a future date.');
      return;
    }

    setIsSearching(true);

    try {
      // Format date for API call
      const formattedDateForAPI = formatDateForAPI(date);
      
      // Prepare search data
      const searchData = {
        startLocation: from.trim(),
        endLocation: to.trim(),
        date: formattedDateForAPI
      };

      console.log('Searching buses with data:', searchData);

      // Call the bus search API
      const response = await busAPI.searchBuses(searchData);
      
      console.log('API Response:', response);
      console.log('API Response Data:', response.data);

      if (response.success) {
        // Format date for display
        const displayDate = formatDisplayDate(date);

        // Navigate to search results with real data
        navigation.navigate('BusSearchResults', {
          from: from,
          to: to,
          date: displayDate,
          searchData: searchData,
          busData: response.data,
        });
      } else {
        Alert.alert('Search Failed', response.error || 'Unable to search buses. Please try again.');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
    // Navigate to respective screens
    if (action === 'Bookings') {
      navigation.navigate('Bookings');
    } else if (action === 'Offers') {
      navigation.navigate('Offers');
    }
  };

  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      <View style={styles.container}>
        {/* Main Content - Scrollable Layout */}
        <ScrollView 
          style={styles.mainContent}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header with background image and dark teal overlay */}
          <ImageBackground
            source={require('../../assets/landing-background.jpg')}
            style={styles.header}
            resizeMode="cover"
          >
            <View style={styles.headerOverlay} />
            <SafeAreaView edges={['top']} style={styles.headerContent}>
              {/* Header Layout */}
              <View style={styles.headerRow}>
                {/* Left: Logo Circle */}
                <View style={styles.logoCircle}>
                  <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                
                {/* Center: App Name and Subtitle */}
                <View style={styles.headerTextContainer}>
                  <Text 
                    style={styles.appName} 
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    GO GANTABYA
                  </Text>
                  <Text style={styles.appSubtitle}>Best and cheapest</Text>
                </View>
                
              </View>
            </SafeAreaView>
          </ImageBackground>

          {/* Main Booking Card */}
          <View style={styles.bookingCard}>
              <Text style={styles.bookingTitle}>Book Your Journey</Text>
              <Text style={styles.bookingSubtitle}>Find and book bus tickets across India.</Text>

            {/* Input Fields Container with Swap Button */}
            <View style={{ position: 'relative' }}>
              {/* From Input */}
              <View style={styles.inputContainer}>
                <BusIcon color="#2C5F6F" />
                <TextInput
                  style={styles.input}
                  placeholder="From"
                  placeholderTextColor="#9CA3AF"
                  value={from}
                  onChangeText={setFrom}
                />
              </View>

              {/* To Input */}
              <View style={styles.inputContainer}>
                <BusIcon color="#2C5F6F" />
                <TextInput
                  style={styles.input}
                  placeholder="To"
                  placeholderTextColor="#9CA3AF"
                  value={to}
                  onChangeText={setTo}
                />
              </View>

              {/* Swap Icon - Absolutely Positioned */}
              <TouchableOpacity 
                style={styles.swapButton}
                onPress={handleSwap}
                activeOpacity={0.7}
              >
                <SwapIcon />
              </TouchableOpacity>
            </View>

            {/* Date Selector */}
            <TouchableOpacity 
              style={styles.dateContainer} 
              activeOpacity={0.7}
              onPress={showDatepicker}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <CalendarIcon />
                <Text style={styles.dateText}>{formatDisplayDate(date)}</Text>
              </View>
              <Text style={styles.addReturnText}>+ Add return</Text>
            </TouchableOpacity>

            {/* DateTimePicker */}
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )}

            {/* Search Button */}
            <TouchableOpacity
              style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
              onPress={handleSearch}
              activeOpacity={0.85}
              disabled={isSearching}
            >
              {isSearching ? (
                <View style={styles.searchButtonContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={styles.loadingIndicator} />
                  <Text style={styles.searchButtonText}>Searching...</Text>
                </View>
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Action Cards */}
          <View style={styles.quickActionsContainer}>
            <View style={styles.quickActionWrapper}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => handleQuickAction('Bookings')}
                activeOpacity={0.7}
              >
                <BookingIcon />
              </TouchableOpacity>
              <Text style={styles.quickActionLabel}>My{"\n"}Bookings</Text>
            </View>

            <View style={styles.quickActionWrapper}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => handleQuickAction('Offers')}
                activeOpacity={0.7}
              >
                <OfferIcon />
              </TouchableOpacity>
              <Text style={styles.quickActionLabel}>Offers</Text>
            </View>

          </View>

          {/* Offer Banner */}
          <View style={styles.offerBanner}>
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>Save upto 25%</Text>
              <Text style={styles.offerSubtitle}>On your first booking</Text>
              <View style={styles.couponContainer}>
                <Text style={styles.couponLabel}>Use Code : </Text>
                <Text style={styles.couponCode}>FIRST25</Text>
              </View>
            </View>
            <View style={styles.offerIconContainer}>
              <PercentIcon />
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9',
  },

  // Header styles with background image and dark teal overlay
  header: {
    height: 160,
    width: width,
    paddingBottom: 20,
  },

  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 95, 111, 0.80)',
  },

  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoImage: {
    width: 36,
    height: 36,
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 0,
    justifyContent: 'center',
  },

  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },

  // Main content
  mainContent: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 90, // Extra padding for bottom navigation
  },

  // Booking card
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginHorizontal: 18,
    marginTop: -25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  bookingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },

  bookingSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
    marginBottom: 10,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 7,
    height: 46,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '400',
    color: '#1A1A1A',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },

  swapButton: {
    position: 'absolute',
    alignSelf: 'center',
    left: '50%',
    marginLeft: -22,
    marginTop: 26.5,
    zIndex: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F7F8FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 10,
    height: 46,
  },

  dateText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
    flex: 1,
  },

  addReturnText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
  },

  searchButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 24,
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginTop: 8,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  searchButtonDisabled: {
    backgroundColor: '#87CEEB',
    opacity: 0.8,
  },

  searchButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingIndicator: {
    marginRight: 8,
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },

  // Quick actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'flex-start',
    gap: 14,
  },

  quickActionWrapper: {
    alignItems: 'center',
    maxWidth: 72,
  },

  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Offer banner
  offerBanner: {
    backgroundColor: '#E6F3F8',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  offerContent: {
    flex: 1,
  },

  offerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C5F6F',
    marginBottom: 3,
  },

  offerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '400',
    marginBottom: 3,
  },

  couponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  couponLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '400',
  },

  couponCode: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2C5F6F',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  offerIconContainer: {
    marginLeft: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '12deg' }],
  },
});

export default HomeScreen;
