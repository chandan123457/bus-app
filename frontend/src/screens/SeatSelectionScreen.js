import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SeatSelectionScreen = ({ navigation, route }) => {
  const { busData } = route.params;

  // Initialize seat states: 'available', 'selected', 'booked'
  const [seatStates, setSeatStates] = useState({
    A1: 'available', A2: 'available', A3: 'booked', A4: 'available',
    B1: 'available', B2: 'selected', B3: 'available', B4: 'booked',
    C1: 'booked', C2: 'available', C3: 'available', C4: 'available',
    D1: 'available', D2: 'available', D3: 'selected', D4: 'available',
    E1: 'available', E2: 'booked', E3: 'available', E4: 'available',
    F1: 'available', F2: 'available', F3: 'available', F4: 'booked',
    G1: 'available', G2: 'available', G3: 'available', G4: 'available',
  });

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
        return { backgroundColor: '#2C2C2C', borderColor: '#2C2C2C' };
      default:
        return { backgroundColor: '#E8E8E8', borderColor: '#E8E8E8' };
    }
  };

  const getSeatTextStyle = (state) => {
    return state === 'available' 
      ? { color: '#2C2C2C' } 
      : { color: '#FFFFFF' };
  };

  const renderSeat = (seatId, state) => (
    <TouchableOpacity
      key={seatId}
      style={[styles.seat, getSeatStyle(state)]}
      onPress={() => handleSeatPress(seatId)}
      disabled={state === 'booked'}
      activeOpacity={0.7}
    >
      <Text style={[styles.seatText, getSeatTextStyle(state)]}>
        {seatId}
      </Text>
    </TouchableOpacity>
  );

  const renderSeatRow = (row) => {
    const seats = ['1', '2', '3', '4'];
    return (
      <View key={row} style={styles.seatRow}>
        <View style={styles.seatGroup}>
          {renderSeat(`${row}1`, seatStates[`${row}1`])}
          {renderSeat(`${row}2`, seatStates[`${row}2`])}
        </View>
        <View style={styles.aisle} />
        <View style={styles.seatGroup}>
          {renderSeat(`${row}3`, seatStates[`${row}3`])}
          {renderSeat(`${row}4`, seatStates[`${row}4`])}
        </View>
      </View>
    );
  };

  const selectedSeats = Object.keys(seatStates).filter(
    key => seatStates[key] === 'selected'
  );

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <StatusBar hidden />
      <View style={styles.mainContainer}>
        {/* Top 25% - Background Image with Header */}
        <ImageBackground
          source={require('../../assets/landing-background.jpg')}
          style={styles.topSection}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          
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
                <Text style={styles.priceText}>₹ {busData.price}</Text>
                <Text style={styles.durationText}>{busData.duration}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Seat Status Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#E8E8E8' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#2D9B9B' }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: '#2C2C2C' }]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
        </View>

        {/* Seat Layout */}
        <View style={styles.seatLayoutContainer}>
          {/* Steering Wheel */}
          <View style={styles.steeringContainer}>
            <Ionicons name="navigate-circle" size={32} color="#2C2C2C" />
          </View>

          {/* Seats Grid */}
          <View style={styles.seatsGrid}>
            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(row => renderSeatRow(row))}
          </View>
        </View>

        {/* Bottom spacing for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Continue Button - Fixed at bottom */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.8}
          onPress={() => {
            // Navigate to payment or next screen
            console.log('Selected seats:', selectedSeats);
          }}
        >
          <Text style={styles.continueButtonText}>
            Continue ({selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'})
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#2B636E',
  },
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
    top: SCREEN_HEIGHT * 0.15, // Start scrollable area at 15% to create overlap
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
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5B7EFF',
    marginBottom: 4,
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
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#2C2C2C',
    fontWeight: '500',
  },

  // Seat Layout Styles
  seatLayoutContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  steeringContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingRight: 8,
  },
  seatsGrid: {
    alignItems: 'center',
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  seatGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  aisle: {
    width: 24,
  },
  seat: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Bottom Button Styles
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  continueButton: {
    backgroundColor: '#5B7EFF',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B7EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default SeatSelectionScreen;
