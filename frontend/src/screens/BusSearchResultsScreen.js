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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// Mock bus data - exact specifications
const BUS_DATA = [
  {
    id: '1',
    operator: 'VLR Travels',
    busType: 'A/C Sleeper (2+1)',
    departureTime: '6:15 AM',
    departureCity: 'Kathmandu',
    arrivalTime: '2:15 PM',
    arrivalCity: 'Pokhara',
    rating: 4.4,
    seatsAvailable: 22,
    price: 680,
    duration: '8 Hours',
    tag: 'Fastest',
  },
  {
    id: '2',
    operator: 'Sunrise Travels',
    busType: 'A/C Seater (2+2)',
    departureTime: '7:30 AM',
    departureCity: 'Kathmandu',
    arrivalTime: '4:45 PM',
    arrivalCity: 'Pokhara',
    rating: 4.2,
    seatsAvailable: 15,
    price: 550,
    duration: '9 Hours 15 Minutes',
    tag: 'Cheapest',
  },
  {
    id: '3',
    operator: 'Royal Express',
    busType: 'A/C Sleeper (2+1)',
    departureTime: '9:00 AM',
    departureCity: 'Kathmandu',
    arrivalTime: '5:30 PM',
    arrivalCity: 'Pokhara',
    rating: 4.5,
    seatsAvailable: 8,
    price: 850,
    duration: '8 Hours 30 Minutes',
    tag: null,
  },
  {
    id: '4',
    operator: 'Green Line',
    busType: 'A/C Sleeper (2+1)',
    departureTime: '10:15 AM',
    departureCity: 'Kathmandu',
    arrivalTime: '6:00 PM',
    arrivalCity: 'Pokhara',
    rating: 4.6,
    seatsAvailable: 12,
    price: 780,
    duration: '7 Hours 45 Minutes',
    tag: null,
  },
];

const BusSearchResultsScreen = ({ navigation, route }) => {
  const [selectedTab, setSelectedTab] = useState('Fastest');

  // Get route params or use defaults
  const from = route?.params?.from || 'Jaipur';
  const to = route?.params?.to || 'Jodhpur';
  const date = route?.params?.date || '27 Sept 2025';
  const stops = route?.params?.stops || 'Poornawatar → Vulagar pakkam';

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChange = () => {
    console.log('Change search criteria');
  };

  const handleTabPress = (tab) => {
    setSelectedTab(tab);
  };

  const handleBusCardPress = (bus) => {
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
      }
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
          <Text style={styles.journeyTime}>{item.departureTime}</Text>
          <Text style={styles.journeyCity} numberOfLines={1}>{item.departureCity}</Text>
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
          <Text style={styles.journeyTimeRight}>{item.arrivalTime}</Text>
          <Text style={styles.journeyCityRight} numberOfLines={1}>{item.arrivalCity}</Text>
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
          <Text style={styles.seats}>{item.seatsAvailable}</Text>
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

          {/* Breadcrumb/Stops Info */}
          <View style={styles.breadcrumbContainer}>
            <Text style={styles.breadcrumbText}>{stops}</Text>
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
            data={BUS_DATA}
            renderItem={renderBusCard}
            keyExtractor={(item) => item.id}
            style={styles.busList}
            contentContainerStyle={styles.busListContent}
            showsVerticalScrollIndicator={false}
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
});

export default BusSearchResultsScreen;
