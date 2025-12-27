/**
 * Bus Search Results Screen - Pixel Perfect Match
 * Exact implementation as per specifications
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { busAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

const BusSearchResultsScreen = ({ navigation, route }) => {
  const [selectedTab, setSelectedTab] = useState('Fastest');
  const [busData, setBusData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get route params or use defaults
  const from = route?.params?.from || 'Jaipur';
  const to = route?.params?.to || 'Jodhpur';
  const date = route?.params?.date || '27 Sept 2025';
  const apiData = route?.params?.busData;
  const searchData = route?.params?.searchData;

  // Process API data into display format
  const processApiData = (apiResponse) => {
    console.log('Processing API response:', apiResponse);
    
    if (!apiResponse) {
      console.log('No API response data');
      return [];
    }
    
    if (!apiResponse.trips || !Array.isArray(apiResponse.trips)) {
      console.log('No trips array in API response');
      return [];
    }
    
    if (apiResponse.trips.length === 0) {
      console.log('Empty trips array - no buses found');
      return [];
    }

    return apiResponse.trips.map((trip, index) => {
      console.log('Processing trip:', trip);
      
      const bus = trip?.bus || {};
      const route = trip?.route || {};
      const stops = Array.isArray(route?.stops) ? route.stops : [];
      
      // Safety check for searchData
      const startLocation = searchData?.startLocation || from || '';
      const endLocation = searchData?.endLocation || to || '';
      
      // Find departure and arrival times from stops with better error handling
      const fromStop = stops.length > 0 ? stops.find(stop => 
        stop?.location && typeof stop.location === 'string' && 
        stop.location.toLowerCase().includes(startLocation.toLowerCase())
      ) : null;
      
      const toStop = stops.length > 0 ? stops.find(stop => 
        stop?.location && typeof stop.location === 'string' &&
        stop.location.toLowerCase().includes(endLocation.toLowerCase())
      ) : null;

      // Calculate duration with safety checks
      let duration = '8h 0m'; // Default duration
      if (fromStop?.departureTime && toStop?.arrivalTime) {
        try {
          const depTime = new Date(`1970-01-01T${fromStop.departureTime}`);
          const arrTime = new Date(`1970-01-01T${toStop.arrivalTime}`);
          
          if (!isNaN(depTime.getTime()) && !isNaN(arrTime.getTime())) {
            let diffMs = arrTime.getTime() - depTime.getTime();
            
            // Handle next day arrivals
            if (diffMs < 0) {
              diffMs += 24 * 60 * 60 * 1000;
            }
            
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            duration = `${diffHours}h ${diffMinutes}m`;
          }
        } catch (error) {
          console.log('Error calculating duration:', error);
        }
      }

      // Calculate base price from stops with safety checks
      let basePrice = 500; // Default base price
      if (fromStop && toStop && stops.length > 0) {
        try {
          const fromIndex = stops.findIndex(stop => stop.id === fromStop.id);
          const toIndex = stops.findIndex(stop => stop.id === toStop.id);
          
          if (fromIndex !== -1 && toIndex !== -1 && toIndex > fromIndex) {
            let calculatedPrice = 0;
            for (let i = fromIndex; i < toIndex; i++) {
              calculatedPrice += stops[i]?.price || 0;
            }
            if (calculatedPrice > 0) {
              basePrice = calculatedPrice;
            }
          }
        } catch (error) {
          console.log('Error calculating price:', error);
        }
      }

      return {
        id: trip.tripId || trip.id || `trip_${index}`,
        operator: bus.name || bus.operator || 'Bus Operator',
        busType: bus.type || 'A/C Sleeper (2+1)',
        departureTime: fromStop?.departureTime || '08:00',
        arrivalTime: toStop?.arrivalTime || '16:00',
        duration: duration,
        price: basePrice,
        rating: parseFloat(bus.rating) || (4.0 + Math.random() * 1),
        amenities: bus.amenities || ['WiFi', 'AC', 'Charging'],
        availableSeats: trip.availableSeats || Math.floor(Math.random() * 30) + 10,
        busNumber: bus.busNumber || `BUS${String(index + 1).padStart(3, '0')}`,
        tag: index === 0 ? 'Fastest' : index === 1 ? 'Cheapest' : null,
        tripData: trip, // Store original trip data for booking
        tripId: trip.tripId || trip.id, // Store tripId directly for easy access
      };
    }).filter(trip => trip !== null); // Filter out any null entries
  };

  React.useEffect(() => {
    console.log('BusSearchResultsScreen useEffect - API Data:', apiData);
    console.log('Search Data:', searchData);
    console.log('Route params:', { from, to, date });
    
    setLoading(false); // Ensure loading is false
    
    if (apiData) {
      try {
        const processedData = processApiData(apiData);
        console.log('Processed Data:', processedData);
        
        setBusData(processedData);
        
        if (processedData.length === 0) {
          console.log('No buses found - API returned empty results');
        } else {
          console.log(`Found ${processedData.length} buses`);
        }
      } catch (error) {
        console.error('Error processing API data:', error);
        setBusData([]);
      }
    } else {
      console.log('No API data provided - showing empty state');
      setBusData([]);
    }
  }, [apiData, searchData, from, to, date]);

  const getDisplayData = () => {
    if (busData.length === 0) {
      return [];
    }

    // Sort based on selected tab
    let sortedData = [...busData];
    switch (selectedTab) {
      case 'Fastest':
        sortedData.sort((a, b) => {
          const aDuration = parseFloat(a.duration) || 999;
          const bDuration = parseFloat(b.duration) || 999;
          return aDuration - bDuration;
        });
        break;
      case 'Cheapest':
        sortedData.sort((a, b) => a.price - b.price);
        break;
      case 'Departure':
        sortedData.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        break;
      default:
        // Keep original order
        break;
    }
    return sortedData;
  };

  // Helper function to format time to 12-hour format
  const formatTime = (time) => {
    if (!time) return '00:00 AM';
    
    // Handle both 'HH:mm' and 'HH:mm:ss' formats
    const [hours, minutes] = time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) return time;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const displayMinutes = String(minutes).padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChange = () => {
    console.log('Change search criteria');
    navigation.goBack(); // Navigate back to HomeScreen to modify search
  };

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };

  const handleBusCardPress = (bus) => {
    console.log('🚌 === BUS CARD PRESS DEBUG START ===');
    console.log('🚌 Full bus object:', JSON.stringify(bus, null, 2));
    console.log('🚌 Bus ID:', bus.id);
    console.log('🚌 Bus tripId direct:', bus.tripId);
    console.log('🚌 Trip data available:', bus.tripData);
    console.log('🚌 Trip data type:', typeof bus.tripData);
    
    if (bus.tripData) {
      console.log('🚌 Trip data keys:', Object.keys(bus.tripData));
      console.log('🚌 Trip data tripId:', bus.tripData.tripId);
      console.log('🚌 Trip data id:', bus.tripData.id);
    }
    
    console.log('🚌 Search data available:', searchData);
    
    // Extract trip data from the bus object
    const tripData = bus.tripData || {};
    const tripRoute = tripData.route || {};
    const stops = Array.isArray(tripRoute.stops) ? tripRoute.stops : [];
    
    // Try multiple ways to get the tripId
    let tripId = tripData.tripId || tripData.id || bus.id || bus.tripId;
    console.log('🚌 Extracted tripId:', tripId);
    
    // Find the from and to stops based on search criteria
    const startLocation = searchData?.startLocation || from || '';
    const endLocation = searchData?.endLocation || to || '';
    
    console.log('🚌 Looking for stops:', { startLocation, endLocation });
    console.log('🚌 Available stops:', stops);
    
    // Also try to get stop IDs directly from tripData if available
    let fromStopId = tripData.fromStop?.id;
    let toStopId = tripData.toStop?.id;
    
    // If not available in tripData, try to find from stops array
    if (!fromStopId || !toStopId) {
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
    }
    
    console.log('🚌 Final navigation data:', {
      tripId: tripId,
      fromStopId: fromStopId,
      toStopId: toStopId,
      tripData: tripData
    });
    
    navigation.navigate('SeatSelection', {
      busData: {
        from: from,
        to: to,
        date: date,
        operator: bus.operator,
        type: bus.busType,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        rating: bus.rating,
        price: bus.price,
        duration: bus.duration || '8 Hours',
        // Essential data for API calls
        tripId: tripId,
        fromStopId: fromStopId,
        toStopId: toStopId,
        tripData: tripData, // Full trip data for reference
      },
      // Also pass search context
      searchData: searchData,
      fromStop: tripData.fromStop,
      toStop: tripData.toStop,
    });
  };

  const renderBusCard = ({ item }) => (
    <TouchableOpacity
      style={styles.busCard}
      onPress={() => handleBusCardPress(item)}
      activeOpacity={0.8}
    >
      {/* Card Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.operatorInfo}>
          <View style={styles.operatorLogo}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.operatorLogoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.operatorDetails}>
            <Text style={styles.operatorName}>{item.operator}</Text>
            <Text style={styles.busType}>{item.busType}</Text>
          </View>
        </View>

        {item.tag && (
          <View style={[
            styles.tagContainer,
            item.tag === 'Fastest' ? styles.tagFastest : styles.tagCheapest
          ]}>
            <Text style={[
              styles.tagText,
              item.tag === 'Fastest' ? styles.tagTextFastest : styles.tagTextCheapest
            ]}>
              {item.tag}
            </Text>
          </View>
        )}
      </View>

      {/* Journey Timeline Row */}
      <View style={styles.journeyRow}>
        <View style={styles.journeyPointLeft}>
          <Text style={styles.journeyTime}>{formatTime(item.departureTime)}</Text>
          <Text style={styles.journeyCity} numberOfLines={1}>{from}</Text>
        </View>

        <View style={styles.journeyLine}>
          <View style={styles.dottedLineContainer}>
            <View style={styles.dottedLine} />
            <View style={styles.busIconContainer}>
              <Text style={styles.busIcon}>🚌</Text>
            </View>
          </View>
        </View>

        <View style={styles.journeyPointRight}>
          <Text style={styles.journeyTimeRight}>{formatTime(item.arrivalTime)}</Text>
          <Text style={styles.journeyCityRight} numberOfLines={1}>{to}</Text>
        </View>
      </View>

      {/* Divider Line */}
      <View style={styles.dividerLine} />

      {/* Bottom Metadata Row */}
      <View style={styles.metadataRow}>
        {/* Left: Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.starIcon}>★</Text>
          <Text style={styles.rating}>{item.rating}</Text>
        </View>

        {/* Center: Passenger Count */}
        <View style={styles.seatsContainer}>
          <Text style={styles.seatIcon}>👤</Text>
          <Text style={styles.seats}>{item.availableSeats || item.seatsAvailable || 0}</Text>
        </View>

        {/* Right: Price */}
        <Text style={styles.price}>₹ {item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar hidden />

      <ImageBackground
        source={require('../../assets/landing-background.jpg')}
        style={styles.background}
        resizeMode="cover"
        blurRadius={2}
      >
        {/* Semi-transparent teal/blue overlay (~75% opacity) */}
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Top Header Bar */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerRoute}>
                {from} To {to}
              </Text>
              <Text style={styles.headerDate}>{date}</Text>
            </View>

            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleChange}
              activeOpacity={0.7}
            >
              <Text style={styles.changeText}>CHG</Text>
            </TouchableOpacity>
          </View>

          {/* Breadcrumb/Route Info */}
          <View style={styles.breadcrumbContainer}>
            <Text style={styles.breadcrumbText}>{from} → {to}</Text>
          </View>

          {/* Filter Tabs Section */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScrollView}
            contentContainerStyle={styles.tabsContainer}
          >
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'Recommended' && styles.tabSelected
              ]}
              onPress={() => handleTabPress('Recommended')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                selectedTab === 'Recommended' && styles.tabTextSelected
              ]}>
                Recommended
              </Text>
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>8</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'Fastest' && styles.tabSelected
              ]}
              onPress={() => handleTabPress('Fastest')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                selectedTab === 'Fastest' && styles.tabTextSelected
              ]}>
                Fastest
              </Text>
              <Text style={[
                styles.tabTiming,
                selectedTab === 'Fastest' && styles.tabTimingSelected
              ]}>
                4h 20m
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'Cheapest' && styles.tabSelected
              ]}
              onPress={() => handleTabPress('Cheapest')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                selectedTab === 'Cheapest' && styles.tabTextSelected
              ]}>
                Cheapest
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Main Content Area - Bus Cards */}
          <FlatList
            data={getDisplayData()}
            renderItem={renderBusCard}
            keyExtractor={(item) => item.id}
            style={styles.busList}
            contentContainerStyle={styles.busListContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No buses available
                </Text>
                <Text style={styles.emptySubText}>
                  No buses found from {from} to {to} on {date}.{"\n"}Please try a different route or date.
                </Text>
              </View>
            )}
          />
        </SafeAreaView>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43, 99, 110, 0.85)', // Dark teal overlay matching reference
  },

  safeArea: {
    flex: 1,
  },

  // Header Bar ~60-70px height
  header: {
    height: 70,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backArrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '400',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerRoute: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  headerDate: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 3,
  },

  changeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  changeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // Breadcrumb/Stops
  breadcrumbContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },

  breadcrumbText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '400',
  },

  // Filter Tabs - spacing from breadcrumb
  tabsScrollView: {
    maxHeight: 60,
    backgroundColor: 'transparent',
    marginTop: 8,
  },

  tabsContainer: {
    paddingHorizontal: 16,
  },

  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    width: 135,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  tabSelected: {
    backgroundColor: '#5B7EFF',
    shadowColor: '#5B7EFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },

  tabText: {
    color: '#4A4A4A',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  tabTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  tabBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },

  tabBadgeText: {
    color: '#4A4A4A',
    fontSize: 11,
    fontWeight: '500',
  },

  tabTiming: {
    color: '#4A4A4A',
    fontSize: 13,
    fontWeight: '400',
    marginLeft: 5,
  },

  tabTimingSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Main Content Area
  busList: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light gray/off-white background
    marginTop: 16,
  },

  busListContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
  },

  // Bus Card Component
  busCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Card Header Row
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  operatorLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  operatorLogoImage: {
    width: 28,
    height: 28,
  },

  operatorDetails: {
    flex: 1,
  },

  operatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  busType: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },

  tagContainer: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  tagFastest: {
    backgroundColor: '#E3F2FF',
  },

  tagCheapest: {
    backgroundColor: '#E8F5E9',
  },

  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },

  tagTextFastest: {
    color: '#2196F3',
  },

  tagTextCheapest: {
    color: '#4CAF50',
  },

  // Journey Timeline Row
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  journeyPoint: {
    flexShrink: 0,
    minWidth: 80,
    maxWidth: 100,
  },

  journeyPointLeft: {
    flexShrink: 0,
    minWidth: 80,
    maxWidth: 100,
    alignItems: 'flex-start',
  },

  journeyPointRight: {
    flexShrink: 0,
    minWidth: 80,
    maxWidth: 100,
    alignItems: 'flex-end',
  },

  journeyTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  journeyTimeRight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'right',
  },

  journeyCity: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
    flexWrap: 'nowrap',
  },

  journeyCityRight: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
    flexWrap: 'nowrap',
    textAlign: 'right',
  },

  journeyLine: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },

  dottedLineContainer: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dottedLine: {
    width: '100%',
    height: 1,
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },

  busIconContainer: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    top: -11.5,
  },

  busIcon: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },

  // Divider Line
  dividerLine: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginBottom: 12,
  },

  // Bottom Metadata Row
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  // Left: Rating Container (33.333% width)
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '33.333%',
    justifyContent: 'flex-start',
  },

  starIcon: {
    color: '#FFB800',
    fontSize: 14,
    marginRight: 4,
  },

  rating: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
  },

  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '33.333%',
  },

  seatIcon: {
    fontSize: 14,
    marginRight: 4,
    color: '#5B7EFF',
  },

  seats: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
  },

  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    width: '33.333%',
    textAlign: 'right',
  },

  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },

  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Test mode indicator styles
  testModeIndicator: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },

  testModeText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default BusSearchResultsScreen;
