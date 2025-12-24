import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const PaymentScreen = ({ navigation, route }) => {
  const { busData, selectedSeats, passengers, contactDetails } = route.params;

  // Calculate fare
  const baseFare = selectedSeats.length * 520; // Example: ₹520 per seat
  const gst = Math.round(baseFare * 0.12);
  const serviceFee = 22;
  const totalAmount = baseFare + gst + serviceFee;

  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI');

  const paymentMethods = [
    { id: 'UPI', label: 'UPI' },
    { id: 'Card', label: 'Credit / Debit Card' },
    { id: 'NetBanking', label: 'Net Banking' },
    { id: 'Wallet', label: 'Digital Wallets' },
  ];

  const handlePayment = () => {
    console.log('Processing payment...');
    console.log('Payment method:', selectedPaymentMethod);
    console.log('Amount:', totalAmount);
    // Navigate to payment success or next screen
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Payment</Text>
        
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Details</Text>
          
          {/* Base Fare */}
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>
              Base Fare ({selectedSeats.length} seats)
            </Text>
            <Text style={styles.fareAmount}>₹ {baseFare}</Text>
          </View>

          {/* GST */}
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>GST (12%)</Text>
            <Text style={styles.fareAmount}>₹ {gst}</Text>
          </View>

          {/* Service Fee */}
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Service Fee</Text>
            <Text style={styles.fareAmount}>₹ {serviceFee}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Total */}
          <View style={styles.fareRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>₹ {totalAmount}</Text>
          </View>
        </View>

        {/* Pay With Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pay with :</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPaymentMethod === method.id && styles.paymentOptionSelected
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
              activeOpacity={0.7}
            >
              <View style={styles.radioButton}>
                <View style={styles.radioCircle}>
                  {selectedPaymentMethod === method.id && (
                    <View style={styles.radioCircleFilled} />
                  )}
                </View>
                <Text style={styles.paymentMethodText}>{method.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.payButton}
          activeOpacity={0.8}
          onPress={handlePayment}
        >
          <Text style={styles.payButtonText}>Pay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Very light off-white
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  headerPlaceholder: {
    width: 40,
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },

  // Fare Row Styles
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fareLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
  },
  fareAmount: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },

  // Total Row
  totalLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '700',
  },

  // Payment Option Styles
  paymentOption: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleFilled: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  paymentMethodText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },

  // Pay Button
  buttonWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    height: 44,
    width: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default PaymentScreen;
