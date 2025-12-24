import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PassengerInformation = ({ navigation, route }) => {
  const { busData, selectedSeats } = route.params;

  // Passenger information state
  const [passengers, setPassengers] = useState(
    selectedSeats.map(() => ({
      name: '',
      age: '',
      gender: 'Male',
    }))
  );

  const [contactDetails, setContactDetails] = useState({
    phone: '',
    email: '',
  });

  const updatePassenger = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  const handleProceed = () => {
    console.log('Passengers:', passengers);
    console.log('Contact:', contactDetails);
    // Navigate to payment or next screen
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Full-screen background image */}
      <ImageBackground
        source={require('../../assets/landing-background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

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
              <Text style={styles.operatorName}>{busData.operator}</Text>
              <Text style={styles.busDetails}>
                {busData.type} | {busData.departureTime}
              </Text>
              <Text style={styles.seatsSelected}>
                Seats: {selectedSeats.join(', ')}
              </Text>
            </View>
            
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Passenger Information Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Passenger Information</Text>
              
              {selectedSeats.map((seat, index) => (
                <View key={index} style={styles.passengerSection}>
                  <Text style={styles.passengerLabel}>
                    Passenger {index + 1}
                  </Text>
                  
                  {/* Full Name Input */}
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#9CA3AF"
                    value={passengers[index].name}
                    onChangeText={(text) => updatePassenger(index, 'name', text)}
                  />
                  
                  {/* Age and Gender Row */}
                  <View style={styles.rowInputs}>
                    <TextInput
                      style={[styles.input, styles.ageInput]}
                      placeholder="Age"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={passengers[index].age}
                      onChangeText={(text) => updatePassenger(index, 'age', text)}
                    />
                    
                    {/* Gender Selection */}
                    <View style={styles.genderContainer}>
                      <TouchableOpacity
                        style={styles.radioButton}
                        onPress={() => updatePassenger(index, 'gender', 'Male')}
                        activeOpacity={0.7}
                      >
                        <View style={styles.radioCircle}>
                          {passengers[index].gender === 'Male' && (
                            <View style={styles.radioCircleFilled} />
                          )}
                        </View>
                        <Text style={styles.radioText}>Male</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.radioButton}
                        onPress={() => updatePassenger(index, 'gender', 'Female')}
                        activeOpacity={0.7}
                      >
                        <View style={styles.radioCircle}>
                          {passengers[index].gender === 'Female' && (
                            <View style={styles.radioCircleFilled} />
                          )}
                        </View>
                        <Text style={styles.radioText}>Female</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Contact Details Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Contact Details</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={contactDetails.phone}
                onChangeText={(text) =>
                  setContactDetails({ ...contactDetails, phone: text })
                }
              />
              
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={contactDetails.email}
                onChangeText={(text) =>
                  setContactDetails({ ...contactDetails, email: text })
                }
              />
            </View>

            {/* Bottom spacing */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Proceed Button */}
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.proceedButton}
              activeOpacity={0.8}
              onPress={handleProceed}
            >
              <Text style={styles.proceedButtonText}>Proceed to Book</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
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
  operatorName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  busDetails: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginTop: 2,
  },
  seatsSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },

  // Passenger Section
  passengerSection: {
    marginBottom: 20,
  },
  passengerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },

  // Input Styles
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ageInput: {
    flex: 1,
    marginBottom: 0,
  },

  // Gender Selection
  genderContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  radioText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  // Proceed Button
  buttonWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  proceedButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default PassengerInformation;
