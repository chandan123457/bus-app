/**
 * Home / Dashboard Screen - Post Login
 * 
 * Features:
 * - Header with dark map background, app name, subtitle, profile image
 * - Main booking card with From/To inputs, swap icon, date selector
 * - Quick action cards (My Bookings, Offers, Support)
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Custom SVG Icons
const BusIcon = ({ color = '#666' }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" fill={color}/>
  </Svg>
);

const SwapIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" fill="#4A90E2"/>
  </Svg>
);

const CalendarIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" fill="#4A90E2"/>
  </Svg>
);

const BookingIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 24 24">
    <Path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54zM9 8h2v8H9zm4 0h2v8h-2z" fill="#4A90E2"/>
  </Svg>
);

const OfferIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 24 24">
    <Path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" fill="#4A90E2"/>
  </Svg>
);

const SupportIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 24 24">
    <Path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z" fill="#4A90E2"/>
  </Svg>
);

const PercentIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24">
    <Circle cx="6.5" cy="6.5" r="2" fill="#4A90E2"/>
    <Circle cx="17.5" cy="17.5" r="2" fill="#4A90E2"/>
    <Path d="M19 5L5 19" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const BellIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" fill="#FFFFFF"/>
  </Svg>
);

const PersonIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#FFFFFF"/>
  </Svg>
);

const MenuIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="#FFFFFF"/>
  </Svg>
);

const HomeIconNav = ({ active = false }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill={active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}/>
  </Svg>
);

const BookingsIconNav = ({ active = false }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" fill={active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}/>
  </Svg>
);

const OffersIconNav = ({ active = false }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" fill={active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}/>
  </Svg>
);

const SupportIconNav = ({ active = false }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill={active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}/>
  </Svg>
);

const ProfileIconNav = ({ active = false }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill={active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}/>
  </Svg>
);

const HomeScreen = ({ navigation }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('Select Date');
  const [activeTab, setActiveTab] = useState('Home');

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = () => {
    console.log('Search buses:', { from, to, date });
  };

  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
    setActiveTab(action);
  };

  const handleBottomNav = (tab) => {
    console.log('Navigate to:', tab);
    setActiveTab(tab);
  };

  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      <View style={styles.container}>
        {/* Header with background image and dark teal overlay */}
        <ImageBackground
          source={require('../../assets/landing-background.jpg')}
          style={styles.header}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />
          <SafeAreaView edges={['top']} style={styles.headerContent}>
            {/* Top Navigation Icons */}
            <View style={styles.headerTopIcons}>
              <TouchableOpacity style={styles.headerIcon}>
                <BellIcon />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}>
                <PersonIcon />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon}>
                <MenuIcon />
              </TouchableOpacity>
            </View>
            
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoCircleLarge}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.logoLarge}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.logoTextContainer}>
                <Text style={styles.appName}>GO GANTABYA</Text>
                <Text style={styles.appSubtitle}>Best and cheapest</Text>
              </View>
              <View style={styles.logoCircleLarge}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.logoLarge}
                  resizeMode="cover"
                />
              </View>
            </View>
          </SafeAreaView>
        </ImageBackground>

        {/* Main Content - Fixed Layout */}
        <View style={styles.mainContent}>
          {/* Main Booking Card */}
          <View style={styles.bookingCard}>
            <Text style={styles.bookingTitle}>Book Your Journey</Text>
            <Text style={styles.bookingSubtitle}>Find and book bus tickets across India.</Text>

            {/* From Input */}
            <View style={styles.inputContainer}>
              <BusIcon color="#4B7BF5" />
              <TextInput
                style={styles.input}
                placeholder="From"
                placeholderTextColor="#95A5A6"
                value={from}
                onChangeText={setFrom}
              />
            </View>

            {/* Swap Icon */}
            <TouchableOpacity 
              style={styles.swapButton}
              onPress={handleSwap}
              activeOpacity={0.7}
            >
              <SwapIcon />
            </TouchableOpacity>

            {/* To Input */}
            <View style={styles.inputContainer}>
              <BusIcon color="#4B7BF5" />
              <TextInput
                style={styles.input}
                placeholder="To"
                placeholderTextColor="#95A5A6"
                value={to}
                onChangeText={setTo}
              />
            </View>

            {/* Date Selector */}
            <TouchableOpacity style={styles.dateContainer} activeOpacity={0.7}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <CalendarIcon />
                <Text style={styles.dateText}>23-01-2002</Text>
              </View>
              <Text style={styles.addReturnText}>+ Add return</Text>
            </TouchableOpacity>

            {/* Search Button */}
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              activeOpacity={0.85}
            >
              <Text style={styles.searchButtonText}>Search</Text>
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
              <Text style={styles.quickActionLabel}>My Bookings</Text>
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

            <View style={styles.quickActionWrapper}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => handleQuickAction('Support')}
                activeOpacity={0.7}
              >
                <SupportIcon />
              </TouchableOpacity>
              <Text style={styles.quickActionLabel}>Support</Text>
            </View>
          </View>

          {/* Offer Banner */}
          <View style={styles.offerBanner}>
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>Save upto 25%</Text>
              <Text style={styles.offerSubtitle}>On your first booking</Text>
              <View style={styles.couponContainer}>
                <Text style={styles.couponLabel}>Use Code: </Text>
                <Text style={styles.couponCode}>FIRST25</Text>
              </View>
            </View>
            <View style={styles.offerIconContainer}>
              <PercentIcon />
            </View>
          </View>
        </View>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleBottomNav('Home')}
            activeOpacity={0.7}
          >
            <HomeIconNav active={activeTab === 'Home'} />
            <Text style={[styles.navLabel, activeTab === 'Home' && styles.navLabelActive]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleBottomNav('Bookings')}
            activeOpacity={0.7}
          >
            <BookingsIconNav active={activeTab === 'Bookings'} />
            <Text style={[styles.navLabel, activeTab === 'Bookings' && styles.navLabelActive]}>
              Bookings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleBottomNav('Offers')}
            activeOpacity={0.7}
          >
            <OffersIconNav active={activeTab === 'Offers'} />
            <Text style={[styles.navLabel, activeTab === 'Offers' && styles.navLabelActive]}>
              Offers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleBottomNav('Support')}
            activeOpacity={0.7}
          >
            <SupportIconNav active={activeTab === 'Support'} />
            <Text style={[styles.navLabel, activeTab === 'Support' && styles.navLabelActive]}>
              Support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleBottomNav('Profile')}
            activeOpacity={0.7}
          >
            <ProfileIconNav active={activeTab === 'Profile'} />
            <Text style={[styles.navLabel, activeTab === 'Profile' && styles.navLabelActive]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // Header styles with background image and dark teal overlay
  header: {
    height: 140,
    width: width,
  },

  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 95, 111, 0.85)',
  },

  headerContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  headerTopIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },

  headerIcon: {
    padding: 8,
  },

  logoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  logoCircleLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoLarge: {
    width: 36,
    height: 36,
  },

  logoTextContainer: {
    alignItems: 'center',
    flex: 1,
  },

  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  appSubtitle: {
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 2,
  },

  // Main content
  mainContent: {
    paddingBottom: 80,
  },

  // Booking card
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: -30,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  bookingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },

  bookingSubtitle: {
    fontSize: 15,
    color: '#636E72',
    fontWeight: '400',
    marginBottom: 16,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    height: 56,
  },

  input: {
    flex: 1,
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '500',
    color: '#2D3436',
  },

  swapButton: {
    alignSelf: 'center',
    marginVertical: -10,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
    height: 56,
  },

  dateText: {
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '500',
    color: '#2D3436',
    flex: 1,
  },

  addReturnText: {
    fontSize: 13,
    color: '#95A5A6',
    fontWeight: '400',
  },

  searchButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    height: 56,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },

  // Quick actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 12,
  },

  quickActionWrapper: {
    alignItems: 'center',
  },

  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  quickActionLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: '#2D2D2D',
    marginTop: 6,
    textAlign: 'center',
  },

  // Offer banner
  offerBanner: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  offerContent: {
    flex: 1,
  },

  offerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C5F6F',
    marginBottom: 4,
  },

  offerSubtitle: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '400',
    marginBottom: 6,
  },

  couponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  couponLabel: {
    fontSize: 13,
    color: '#636E72',
    fontWeight: '400',
  },

  couponCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C5F6F',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },

  offerIconContainer: {
    marginLeft: 10,
  },

  // Bottom navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#2C5F6F',
    paddingVertical: 10,
    paddingBottom: 20,
    height: 65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
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

export default HomeScreen;
