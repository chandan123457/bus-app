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

const SeatSelectionScreen = ({ navigation, route }) => {
  const { busData } = route.params;
  
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
      
      // Get auth token
      const token = await AsyncStorage.getItem('token');
      
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
        
        // Get route fare for pricing
        const routeFare = response.data.route?.fare || 0;
        
        // Process lower deck seats
        if (response.data.seats?.lowerDeck) {
          response.data.seats.lowerDeck.forEach(seat => {
            const seatNumber = seat.seatNumber;
            newSeatStates[seatNumber] = seat.isAvailable ? 'available' : 'booked';
            newSeatMapping[seatNumber] = {
              id: seat.id,
              seatNumber: seat.seatNumber,
              type: seat.type,
              level: seat.level,
              row: seat.row,
              column: seat.column,
              isAvailable: seat.isAvailable,
              fare: routeFare // Use route-level fare
            };
          });
        }
        
        // Process upper deck seats if available
        if (response.data.seats?.upperDeck) {
          response.data.seats.upperDeck.forEach(seat => {
            const seatNumber = seat.seatNumber;
            newSeatStates[seatNumber] = seat.isAvailable ? 'available' : 'booked';
            newSeatMapping[seatNumber] = {
              id: seat.id,
              seatNumber: seat.seatNumber,
              type: seat.type,
              level: seat.level,
              row: seat.row,
              column: seat.column,
              isAvailable: seat.isAvailable,
              fare: routeFare // Use route-level fare
            };
          });
        }
        
        setSeatStates(newSeatStates);
        setSeatMapping(newSeatMapping);
        console.log('🎯 Seat states loaded:', newSeatStates);
        console.log('🎯 Seat mapping loaded:', newSeatMapping);
        console.log('🎯 Available seats count:', response.data.seats?.availableCount || 0);
        console.log('🎯 Lower deck seats from backend:', response.data.seats?.lowerDeck || []);
        console.log('🎯 Upper deck seats from backend:', response.data.seats?.upperDeck || []);
        console.log('🎯 Backend seat numbers:', (response.data.seats?.lowerDeck || []).map(s => s.seatNumber));
        
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

  const renderSeat = (seatNumber, state, seatData) => (
    <TouchableOpacity
      key={seatNumber}
      style={[styles.seat, getSeatStyle(state)]}
      onPress={() => handleSeatPress(seatNumber)}
      disabled={state === 'booked'}
      activeOpacity={0.7}
    >
      <Text style={[styles.seatText, getSeatTextStyle(state)]}>
        {seatNumber}
      </Text>
    </TouchableOpacity>
  );

  // Dynamic seat layout rendering based on actual backend data
  const renderDynamicSeatLayout = () => {
    if (!busInfo?.seats) {
      return (
        <View style={styles.seatsGrid}>
          <Text style={{ textAlign: 'center', padding: 20, color: '#666' }}>
            Loading seat layout...
          </Text>
        </View>
      );
    }

    const lowerDeckSeats = busInfo.seats.lowerDeck || [];
    const upperDeckSeats = busInfo.seats.upperDeck || [];
    
    // Group seats by row and column for grid layout
    const createSeatGrid = (seats) => {
      if (seats.length === 0) return [];
      
      // Group seats by row
      const seatsByRow = {};
      seats.forEach(seat => {
        const row = seat.row || 0;
        if (!seatsByRow[row]) {
          seatsByRow[row] = [];
        }
        seatsByRow[row].push(seat);
      });
      
      // Sort rows and seats within rows
      return Object.keys(seatsByRow)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(rowKey => {
          const rowSeats = seatsByRow[rowKey].sort((a, b) => 
            (a.column || 0) - (b.column || 0)
          );
          return { row: rowKey, seats: rowSeats };
        });
    };
    
    const lowerGrid = createSeatGrid(lowerDeckSeats);
    const upperGrid = createSeatGrid(upperDeckSeats);
    
    return (
      <View style={styles.seatsGrid}>
        {/* Lower Deck */}
        {lowerGrid.map((rowData, index) => (
          <View key={`lower-row-${rowData.row}`} style={styles.seatRow}>
            <View style={styles.seatGroup}>
              {rowData.seats.slice(0, 2).map(seat => {
                const seatNumber = seat.seatNumber;
                const state = seatStates[seatNumber] || 'available';
                return renderSeat(seatNumber, state, seat);
              })}
            </View>
            <View style={styles.aisle} />
            <View style={styles.seatGroup}>
              {rowData.seats.slice(2, 4).map(seat => {
                const seatNumber = seat.seatNumber;
                const state = seatStates[seatNumber] || 'available';
                return renderSeat(seatNumber, state, seat);
              })}
            </View>
          </View>
        ))}
        
        {/* Upper Deck (if available) */}
        {upperGrid.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', marginBottom: 10, fontWeight: 'bold' }}>Upper Deck</Text>
            {upperGrid.map((rowData, index) => (
              <View key={`upper-row-${rowData.row}`} style={styles.seatRow}>
                <View style={styles.seatGroup}>
                  {rowData.seats.slice(0, 2).map(seat => {
                    const seatNumber = seat.seatNumber;
                    const state = seatStates[seatNumber] || 'available';
                    return renderSeat(seatNumber, state, seat);
                  })}
                </View>
                <View style={styles.aisle} />
                <View style={styles.seatGroup}>
                  {rowData.seats.slice(2, 4).map(seat => {
                    const seatNumber = seat.seatNumber;
                    const state = seatStates[seatNumber] || 'available';
                    return renderSeat(seatNumber, state, seat);
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
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
                <Text style={styles.priceText}>₹ {busData.price}</Text>
                <Text style={styles.durationText}>{busData.duration}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Seat Status Legend - Direct on white background */}
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
          {/* Steering Wheel / Driver Icon - Plain with transparent background */}
          <MaterialCommunityIcons name="steering" size={28} color="#2C2C2C" style={styles.steeringIcon} />

          {/* Dynamic Seats Grid based on backend data */}
          {renderDynamicSeatLayout()}
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
                // Check if seatMapping is properly loaded
                if (!seatMapping || Object.keys(seatMapping).length === 0) {
                  console.error('Seat mapping not loaded yet');
                  Alert.alert('Loading Error', 'Seat data is still loading. Please wait and try again.');
                  return;
                }
                
                // Navigate to boarding points with API data
                const selectedSeatNumbers = Object.keys(seatStates).filter(key => seatStates[key] === 'selected');
                
                // Validate that all selected seat numbers exist in mapping
                const missingSeats = selectedSeatNumbers.filter(seatNumber => !seatMapping[seatNumber]);
                if (missingSeats.length > 0) {
                  console.error('Missing seats in mapping:', missingSeats);
                  Alert.alert('Data Error', 'Some selected seats are not found in seat mapping. Please refresh and try again.');
                  return;
                }
                
                const selectedSeatObjects = selectedSeatNumbers.map(seatNumber => seatMapping[seatNumber]).filter(Boolean);
                
                // Double-check that we have the right number of selected seats
                if (selectedSeatObjects.length !== selectedSeatNumbers.length) {
                  console.error('Seat count mismatch:', {
                    selectedNumbers: selectedSeatNumbers.length,
                    selectedObjects: selectedSeatObjects.length
                  });
                  Alert.alert('Data Mismatch', 'Selected seat count does not match. Please try again.');
                  return;
                }
                
                console.log('Selected seat numbers:', selectedSeatNumbers);
                console.log('Selected seat objects:', selectedSeatObjects);
                console.log('Seat mapping:', seatMapping);
                console.log('Seat states:', seatStates);
                
                // Validate selection before navigation
                if (selectedSeatObjects.length === 0) {
                  Alert.alert('No Seats Selected', 'Please select at least one seat before continuing.');
                  return;
                }

                // Ensure seat objects have required properties
                const invalidSeats = selectedSeatObjects.filter(seat => !seat || !seat.id);
                if (invalidSeats.length > 0) {
                  console.error('Invalid seat objects found:', invalidSeats);
                  Alert.alert('Seat Selection Error', 'Some seat data is invalid. Please try selecting seats again.');
                  return;
                }
                
                console.log('=== SEATSELECTION NAVIGATION DEBUG ===');
                console.log('selectedSeatNumbers:', selectedSeatNumbers);
                console.log('seatMapping keys:', Object.keys(seatMapping));
                console.log('selectedSeatObjects:', selectedSeatObjects);
                console.log('busData exists:', !!busData);
                console.log('busInfo exists:', !!busInfo);
                console.log('Navigation params being passed:', {
                  busData: !!busData,
                  selectedSeats: selectedSeatObjects,
                  busInfo: !!busInfo,
                  boardingPoints: busInfo?.route?.boardingPoints || [],
                  droppingPoints: busInfo?.route?.droppingPoints || [],
                });
                console.log('==========================================');
                
                // Store selectedSeats in AsyncStorage as backup
                AsyncStorage.setItem('selectedSeatsBackup', JSON.stringify(selectedSeatObjects))
                  .then(() => console.log('Seat data backed up to AsyncStorage'))
                  .catch(err => console.warn('Failed to backup seat data:', err));
                
                navigation.navigate('BoardingPoints', {
                  busData,
                  selectedSeats: selectedSeatObjects, // Now contains full seat objects with IDs
                  busInfo: busInfo,
                  boardingPoints: busInfo?.route?.boardingPoints || [],
                  droppingPoints: busInfo?.route?.droppingPoints || [],
                });
              }}
            >
              <Text style={[styles.continueButtonText, isDisabled && styles.continueButtonTextDisabled]}>
                {selectedSeatCount > 0 
                  ? `Continue (${selectedSeatCount} seat${selectedSeatCount !== 1 ? 's' : ''} selected)`
                  : 'Select Seats to Continue'
                }
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
  steeringIcon: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    marginRight: 12,
    backgroundColor: 'transparent',
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
