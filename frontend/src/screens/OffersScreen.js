import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

const OffersScreen = ({ navigation }) => {
  const offers = [
    {
      id: 1,
      code: 'FIRST25',
      description: 'Get 25% off on your first booking',
      validity: 'Valid until Dec 31, 2025',
      conditions: ['Min Booking ₹500', 'Max discount ₹200'],
      badge: 'New',
      badgeType: 'new',
    },
    {
      id: 2,
      code: 'WEEKEND50',
      description: 'Flat ₹50 off on weekend bookings',
      validity: 'Valid on Fri–Sun bookings',
      conditions: ['Min Booking ₹300'],
      icon: 'tag',
      badgeType: 'icon',
    },
    {
      id: 3,
      code: 'STUDENT10',
      description: '10% off for students with ID',
      validity: 'Valid student ID required',
      conditions: ['Max discount ₹150'],
      icon: 'school',
      badgeType: 'icon',
    },
  ];

  const handleBottomNav = (tab) => {
    if (tab === 'Home') {
      navigation.navigate('Home');
    } else if (tab === 'Bookings') {
      navigation.navigate('Bookings');
    } else if (tab === 'Offers') {
      // Already on Offers screen
    } else if (tab === 'Support') {
      navigation.navigate('HelpSupport');
    } else if (tab === 'Profile') {
      navigation.navigate('Profile');
    }
  };

  const renderOfferCard = (offer) => (
    <View key={offer.id} style={styles.offerCard}>
      {/* Top Row - Code and Badge/Icon */}
      <View style={styles.topRow}>
        <Text style={styles.offerCode}>{offer.code}</Text>
        {offer.badgeType === 'new' ? (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{offer.badge}</Text>
          </View>
        ) : (
          <MaterialCommunityIcons name={offer.icon} size={20} color="#3B82F6" />
        )}
      </View>

      {/* Description */}
      <Text style={styles.description}>{offer.description}</Text>

      {/* Validity */}
      <Text style={styles.validity}>{offer.validity}</Text>

      {/* Conditions */}
      {offer.conditions.map((condition, index) => (
        <Text key={index} style={styles.condition}>
          {condition}
        </Text>
      ))}

      {/* Action Button */}
      <TouchableOpacity style={styles.useCodeButton} activeOpacity={0.8}>
        <Text style={styles.useCodeButtonText}>Use Code</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Top Background Image Section */}
      <View style={styles.topImageSection}>
        <ImageBackground
          source={require('../../assets/landing-background.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />

          <SafeAreaView edges={['top']} style={styles.safeHeader}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Offers & Deals</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      {/* Offers List Area */}
      <View style={styles.offersListArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {offers.map((offer) => renderOfferCard(offer))}
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
          <OffersIconNav active={true} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Offers</Text>
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
          <ProfileIconNav active={false} />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light off-white background
    overflow: 'visible',
  },

  // Top Image Section
  topImageSection: {
    height: SCREEN_HEIGHT * 0.18,
    width: '100%',
    overflow: 'visible',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43, 99, 110, 0.85)', // Soft teal overlay - background image clearly visible
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

  // Offers List Area
  offersListArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    marginTop: -10, // Start slightly lower for layered/floating effect
    overflow: 'visible',
  },
  scrollView: {
    flex: 1,
    overflow: 'visible',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 10, // Cards overlap the background image
    paddingBottom: 100, // Space for bottom navigation
  },

  // Offer Card - Compact with reduced padding
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10, // Reduced from 12 for more compact cards
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'visible', // Ensure shadows are visible
  },

  // Top Row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6, // Reduced spacing
  },
  offerCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  newBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Description
  description: {
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 6, // Reduced spacing
    lineHeight: 20,
  },

  // Validity & Conditions
  validity: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  condition: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },

  // Action Button
  useCodeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 6, // Reduced spacing
  },
  useCodeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
});

export default OffersScreen;
