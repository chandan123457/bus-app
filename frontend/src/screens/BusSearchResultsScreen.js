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
    tag: null,
  },
];

const BusSearchResultsScreen = ({ navigation, route }) => {
  const [selectedTab, setSelectedTab] = useState('Fastest');

  // Get route params or use defaults
  const fromCity = route?.params?.from || 'Jaipur';
  const toCity = route?.params?.to || 'Jodhpur';
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
    console.log('Bus selected:', bus);
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
        <View style={styles.journeyPoint}>
          <Text style={styles.journeyTime}>{item.departureTime}</Text>
          <Text style={styles.journeyCity}>{item.departureCity}</Text>
        </View>

        <View style={styles.journeyLine}>
          <View style={styles.dottedLine} />
          <View style={styles.busIconContainer}>
            <Text style={styles.busIcon}>🚌</Text>
          </View>
          <View style={styles.dottedLine} />
        </View>

        <View style={styles.journeyPoint}>
          <Text style={styles.journeyTime}>{item.arrivalTime}</Text>
          <Text style={styles.journeyCity}>{item.arrivalCity}</Text>
        </View>
      </View>

      {/* Bottom Metadata Row */}
      <View style={styles.metadataRow}>
        <View style={styles.metadataLeft}>
          <Text style={styles.starIcon}>★</Text>
          <Text style={styles.rating}>{item.rating}</Text>

          <View style={styles.seatsContainer}>
            <Text style={styles.seatIcon}>👤</Text>
            <Text style={styles.seats}>{item.seatsAvailable}</Text>
          </View>
        </View>

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
                {fromCity} To {toCity}
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
    backgroundColor: 'rgba(0, 128, 128, 0.75)', // Semi-transparent teal/blue overlay 75%
  },

  safeArea: {
    flex: 1,
  },

  // Header Bar ~60-70px height
  header: {
    height: 70,
    backgroundColor: 'rgba(0, 64, 64, 0.6)', // Semi-transparent dark teal
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
  },

  headerDate: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
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
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 64, 64, 0.4)',
  },

  breadcrumbText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    textAlign: 'center',
  },

  // Filter Tabs - 12px from header
  tabsScrollView: {
    maxHeight: 60,
    backgroundColor: 'transparent',
    marginTop: 12,
  },

  tabsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },

  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },

  tabSelected: {
    backgroundColor: '#4A7EFF',
  },

  tabText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },

  tabTextSelected: {
    color: '#FFFFFF',
  },

  tabBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },

  tabBadgeText: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '600',
  },

  tabTiming: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 6,
  },

  tabTimingSelected: {
    color: '#FFFFFF',
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    marginBottom: 12,
  },

  journeyPoint: {
    flex: 1,
  },

  journeyTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  journeyCity: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },

  journeyLine: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },

  dottedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },

  busIconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  busIcon: {
    fontSize: 14,
    color: '#999999',
  },

  // Bottom Metadata Row
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  metadataLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  starIcon: {
    color: '#FFC107',
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
    marginLeft: 16,
  },

  seatIcon: {
    fontSize: 14,
    marginRight: 4,
    color: '#4A90E2',
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
  },
});

export default BusSearchResultsScreen;
