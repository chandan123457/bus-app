import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const OffersScreen = ({ navigation }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError('');
        const token = await AsyncStorage.getItem('authToken');
        const response = await api.getOffers(token);

        if (response.success) {
          const list = Array.isArray(response.data) ? response.data : response.data?.offers;
          setOffers(Array.isArray(list) ? list : []);
        } else {
          setError(response.error || 'Failed to load offers');
        }
      } catch (err) {
        console.error('Offers load error:', err);
        setError(err.message || 'Failed to load offers');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const renderOfferCard = (offer) => (
    <View key={offer.id || offer.code} style={styles.offerCard}>
      {/* Top Row - Code and Badge/Icon */}
      <View style={styles.topRow}>
        <Text style={styles.offerCode}>{offer.code || 'OFFER'}</Text>
        {offer.badgeType === 'new' && offer.badge ? (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{offer.badge}</Text>
          </View>
        ) : offer.icon ? (
          <MaterialCommunityIcons name={offer.icon} size={20} color="#3B82F6" />
        ) : null}
      </View>

      {/* Description */}
      <Text style={styles.description}>{offer.description || 'Special offer available'}</Text>

      {/* Validity */}
      {offer.validity && <Text style={styles.validity}>{offer.validity}</Text>}

      {/* Conditions */}
      {Array.isArray(offer.conditions) && offer.conditions.length > 0 &&
        offer.conditions.map((condition, index) => (
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
          {loading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color="#2C5F6F" />
              <Text style={styles.stateText}>Loading offers...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateContainer}>
              <Text style={styles.stateText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={async () => {
                  setLoading(true);
                  setError('');
                  try {
                    const token = await AsyncStorage.getItem('authToken');
                    const response = await api.getOffers(token);
                    if (response.success) {
                      const list = Array.isArray(response.data)
                        ? response.data
                        : response.data?.offers;
                      setOffers(Array.isArray(list) ? list : []);
                    } else {
                      setError(response.error || 'Failed to load offers');
                    }
                  } catch (err) {
                    setError(err.message || 'Failed to load offers');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : offers.length === 0 ? (
            <View style={styles.stateContainer}>
              <Text style={styles.stateText}>No offers available right now.</Text>
            </View>
          ) : (
            offers.map((offer) => renderOfferCard(offer))
          )}
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
    height: SCREEN_HEIGHT * 0.2,
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
    backgroundColor: 'rgba(44, 95, 111, 0.80)',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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

  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  stateText: {
    marginTop: 8,
    color: '#4B5563',
    fontSize: 14,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2C5F6F',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
});

export default OffersScreen;
