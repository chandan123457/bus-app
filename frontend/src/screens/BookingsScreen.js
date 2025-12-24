import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BookingsScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('Active');

  // Sample booking data
  const bookings = {
    Active: [
      {
        id: 1,
        operator: 'VLR Travels',
        type: 'A/C Sleeper (2+1)',
        from: 'Jaipur',
        to: 'Jodhpur',
        departureDate: 'Sept 27',
        departureTime: '6:15 AM',
        arrivalDate: 'Sept 27',
        arrivalTime: '2:15 PM',
        passengers: 'Harsh, KP',
        seats: 'D1, D2',
        fare: '1160',
      },
    ],
    Completed: [],
    Cancelled: [],
  };

  const tabs = ['Active', 'Completed', 'Cancelled'];

  const renderBookingCard = (booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      {/* Top Row - Operator Info */}
      <View style={styles.operatorRow}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.operatorLogo}
        />
        <View style={styles.operatorInfo}>
          <Text style={styles.operatorName}>{booking.operator}</Text>
          <Text style={styles.busType}>{booking.type}</Text>
        </View>
      </View>

      {/* Middle Section - Journey Details */}
      <View style={styles.journeySection}>
        {/* From */}
        <View style={styles.locationContainer}>
          <Text style={styles.cityName}>{booking.from}</Text>
          <Text style={styles.dateTime}>
            {booking.departureDate}, {booking.departureTime}
          </Text>
        </View>

        {/* Route Line with Bus Icon */}
        <View style={styles.routeContainer}>
          <View style={styles.dottedLine} />
          <MaterialCommunityIcons
            name="bus"
            size={16}
            color="#3B82F6"
            style={styles.busIcon}
          />
          <View style={styles.dottedLine} />
        </View>

        {/* To */}
        <View style={styles.locationContainer}>
          <Text style={styles.cityName}>{booking.to}</Text>
          <Text style={styles.dateTime}>
            {booking.arrivalDate}, {booking.arrivalTime}
          </Text>
        </View>
      </View>

      {/* Bottom Row - Booking Meta Info */}
      <View style={styles.metaRow}>
        <View style={styles.metaColumn}>
          <Text style={styles.metaLabel}>Passenger Name</Text>
          <Text style={styles.metaValue}>{booking.passengers}</Text>
        </View>
        <View style={styles.metaColumn}>
          <Text style={styles.metaLabel}>Seat No.</Text>
          <Text style={styles.metaValue}>{booking.seats}</Text>
        </View>
        <View style={styles.metaColumn}>
          <Text style={styles.metaLabel}>Ticket Fare</Text>
          <Text style={styles.metaValue}>₹ {booking.fare}</Text>
        </View>
      </View>
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
              <Text style={styles.headerTitle}>Bookings</Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelectorContainer}>
        <View style={styles.tabSelector}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.tabActive,
              ]}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bookings List Area - White Background */}
      <View style={styles.bookingsListArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {bookings[selectedTab].length > 0 ? (
            bookings[selectedTab].map((booking) => renderBookingCard(booking))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No {selectedTab.toLowerCase()} bookings
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Top Image Section
  topImageSection: {
    height: SCREEN_HEIGHT * 0.18,
    width: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43, 99, 110, 0.25)', // Soft teal overlay
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

  // Tab Selector
  tabSelectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    padding: 4,
    gap: 4,
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
    minWidth: 100,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // Bookings List Area
  bookingsListArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  // Booking Card
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16, // Smooth rounded corners
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, // Subtle shadow
    shadowRadius: 8,
    elevation: 2,
  },

  // Operator Row
  operatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  operatorLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  operatorInfo: {
    flex: 1,
  },
  operatorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  busType: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Journey Section
  journeySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  locationContainer: {
    flex: 1,
  },
  cityName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3B82F6', // Blue color for city names
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 12,
    color: '#9CA3AF', // Gray color
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  dottedLine: {
    width: 30,
    height: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  busIcon: {
    marginHorizontal: 4,
  },

  // Meta Row
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    borderStyle: 'dashed', // Dashed divider
  },
  metaColumn: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#9CA3AF', // Light gray for labels
    marginBottom: 4,
    fontWeight: '400', // No bold
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937', // Dark text for values
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});

export default BookingsScreen;
