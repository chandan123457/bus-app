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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
      <StatusBar hidden />

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
    height: SCREEN_HEIGHT * 0.25,
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
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Offers List Area
  offersListArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    overflow: 'visible',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    marginTop: -SCREEN_HEIGHT * 0.06,
  },

  // Offer Card
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Top Row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 8,
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
    marginTop: 8,
  },
  useCodeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OffersScreen;
