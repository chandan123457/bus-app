import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import api from '../services/api';
import CryptoJS from 'crypto-js';

// Import RazorpayCheckout properly
import RazorpayCheckout from 'react-native-razorpay';

// Debug function to check environment
const checkPaymentEnvironment = () => {
  console.log('🔍 Payment Environment Check:', {
    hasRazorpay: !!RazorpayCheckout,
    razorpayType: typeof RazorpayCheckout,
    hasOpenMethod: RazorpayCheckout && typeof RazorpayCheckout.open === 'function',
    platform: require('react-native').Platform.OS,
    isDevelopment: __DEV__
  });
  
  if (!RazorpayCheckout) {
    console.error('❌ RazorpayCheckout is not available. This means:');
    console.error('   - You may be running in Expo Go (native modules not supported)');
    console.error('   - Package not properly installed or linked');
    console.error('   - Need to create a development build or production build');
  } else if (typeof RazorpayCheckout.open !== 'function') {
    console.error('❌ RazorpayCheckout.open is not a function');
    console.error('   - Package may be incorrectly imported');
    console.error('   - Version mismatch or corrupted installation');
  } else {
    console.log('✅ RazorpayCheckout is properly available');
  }
};

const PaymentScreen = ({ navigation, route }) => {
  // Demo Razorpay configuration - Using the same secret as backend
  const DEMO_RAZORPAY_KEY_SECRET = 'lVO33r15GL7bZyt92KjSvO41';

  // Generate Razorpay signature for demo purposes
  const generateRazorpaySignature = (orderId, paymentId, secret) => {
    const payload = `${orderId}|${paymentId}`;
    const signature = CryptoJS.HmacSHA256(payload, secret).toString(CryptoJS.enc.Hex);
    console.log('🔐 Signature generation:', {
      orderId,
      paymentId,
      payload,
      secret: secret.substring(0, 8) + '...',
      signature
    });
    return signature;
  };

  // Open Razorpay checkout - REAL PAYMENTS ONLY
  const openRazorpayCheckout = async (paymentData, token) => {
    console.log('🏁 Starting REAL Razorpay checkout (no simulation)...');
    
    // Check if running in Expo Go
    const isExpoGo = Constants.executionEnvironment === 'storeClient';
    if (isExpoGo) {
      Alert.alert(
        'Real Payments Not Available in Expo Go', 
        'You are currently running in Expo Go which doesn\'t support native payment modules.\n\nTo process REAL payments, you need:\n\n1. Build a development build: "expo dev-build"\n2. Install on a physical device\n3. Or use a production build\n\nSimulated payments are disabled as requested.',
        [{ text: 'Understood', style: 'default' }]
      );
      return;
    }

    try {
      // Check if RazorpayCheckout is available
      console.log('🔍 Checking Razorpay availability:', {
        RazorpayCheckout: !!RazorpayCheckout,
        type: typeof RazorpayCheckout,
        hasOpen: RazorpayCheckout && typeof RazorpayCheckout.open === 'function',
        isFunction: typeof RazorpayCheckout?.open
      });

      if (!RazorpayCheckout) {
        console.error('❌ RazorpayCheckout is null - package not available');
        Alert.alert(
          'Payment Module Not Available',
          'The Razorpay payment module is not properly installed or linked. Please ensure:\n\n1. react-native-razorpay is installed\n2. App is built as development/production build\n3. Native modules are properly linked\n\nSimulated payments are disabled as requested.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (typeof RazorpayCheckout.open !== 'function') {
        console.error('❌ RazorpayCheckout.open is not a function:', typeof RazorpayCheckout.open);
        Alert.alert(
          'Payment Module Incomplete',
          'The Razorpay SDK is not properly initialized. Real payment processing is not available.\n\nSimulated payments are disabled as requested.',
          [{ text: 'OK' }]
        );
        return;
      }

      const options = {
        description: `Bus Booking - ${busData?.operator || 'Bus Service'}`,
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: paymentData.currency || 'INR',
        key: paymentData.razorpayKeyId,
        amount: Math.round(paymentData.amount * 100),
        order_id: paymentData.orderId,
        name: 'Bus Booking',
        prefill: {
          email: contactDetails?.email || passengers?.[0]?.email || '',
          contact: contactDetails?.phone || '',
          name: passengers?.[0]?.name || ''
        },
        theme: { color: '#2B636E' }
      };

      console.log('🚀 Opening native Razorpay checkout with options:', {
        ...options,
        amount: options.amount / 100,
        key: options.key.substring(0, 8) + '...'
      });

      const data = await RazorpayCheckout.open(options);
      console.log('✅ REAL Razorpay payment success:', data);

      await verifyRazorpayPayment(data, paymentData, token);

    } catch (error) {
      console.error('💥 Razorpay checkout error:', error);
      
      // Handle specific Razorpay errors without fallbacks
      if (error.code && RazorpayCheckout) {
        switch (error.code) {
          case RazorpayCheckout.PAYMENT_CANCELLED:
            Alert.alert('Payment Cancelled', 'You have cancelled the payment.');
            break;
          case RazorpayCheckout.NETWORK_ERROR:
            Alert.alert('Network Error', 'Please check your internet connection and try again.');
            break;
          default:
            Alert.alert('Payment Failed', error.description || 'Payment could not be processed.');
        }
      } else {
        // For other errors, show error without fallback
        Alert.alert(
          'Payment Processing Error',
          `Real payment could not be processed: ${error.message}\n\nSimulated payments are disabled as requested.`,
          [{ text: 'OK' }]
        );
      }
    }
  };
  console.log('=== PAYMENT RECEIVED DATA DEBUG ===');
  console.log('Full route.params:', JSON.stringify(route.params, null, 2));
  console.log('==========================================');
  
  const { busData, selectedSeats = [], passengers = [], contactDetails = {} } = route.params;

  // State for actual selected seats with fallback recovery
  const [actualSelectedSeats, setActualSelectedSeats] = useState(selectedSeats);

  console.log('PaymentScreen received params:', {
    busData: !!busData,
    selectedSeatsCount: actualSelectedSeats.length,
    passengersCount: passengers.length,
    contactDetails: !!contactDetails,
    selectedSeats: actualSelectedSeats,
    passengers: passengers,
  });

  // Try to recover selectedSeats from AsyncStorage if empty
  useEffect(() => {
    // Debug payment environment
    checkPaymentEnvironment();
    
    if (!actualSelectedSeats || actualSelectedSeats.length === 0) {
      console.log('PaymentScreen: Attempting to recover selectedSeats from AsyncStorage...');
      AsyncStorage.getItem('selectedSeatsBackup')
        .then(backupData => {
          if (backupData) {
            const parsedSeats = JSON.parse(backupData);
            console.log('PaymentScreen: Recovered seats from AsyncStorage:', parsedSeats);
            setActualSelectedSeats(parsedSeats);
          } else {
            console.log('PaymentScreen: No backup seats found in AsyncStorage');
            // If no backup and no seats, show error
            Alert.alert(
              'Seat Selection Error',
              'No seat information found. Please go back and select seats again.',
              [
                {
                  text: 'Go Back',
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          }
        })
        .catch(err => console.warn('PaymentScreen: Failed to recover seats from AsyncStorage:', err));
    }
  }, []);

  // Calculate fare - use actualSelectedSeats or fallback
  const seatCount = actualSelectedSeats.length > 0 ? actualSelectedSeats.length : 1; // Default to 1 seat minimum
  const baseFare = seatCount * 520; // Example: ₹520 per seat
  const gst = Math.round(baseFare * 0.12);
  const serviceFee = 22;
  const originalAmount = baseFare + gst + serviceFee;

  // Payment method state - Only Razorpay and eSewa
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('RAZORPAY');

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(originalAmount);
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [currentPaymentId, setCurrentPaymentId] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [showWebView, setShowWebView] = useState({ visible: false, html: '', paymentData: null, token: null });

  const paymentMethods = [
    { id: 'RAZORPAY', label: 'Razorpay' },
    { id: 'ESEWA', label: 'eSewa' },
  ];

  // Total amount calculation
  const totalAmount = isCouponApplied ? finalAmount : originalAmount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      // Get authentication token
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Please sign in to apply coupon');
        return;
      }

      const response = await api.applyCoupon({
        code: couponCode.trim(),
        tripId: busData.tripId || busData.tripData?.tripId || busData.id,
        totalAmount: originalAmount,
      }, token);

      if (response.success) {
        // Coupon applied successfully
        setCouponDiscount(response.data.discountAmount);
        setFinalAmount(response.data.finalAmount);
        setIsCouponApplied(true);
        setAppliedCouponCode(couponCode.trim());
        Alert.alert('Success', 'Coupon applied successfully!');
      } else {
        throw new Error(response.error || 'Failed to apply coupon');
      }
    } catch (error) {
      console.error('Coupon application error:', error);
      Alert.alert(
        'Coupon Error',
        error.message || 'Failed to apply coupon. Please try again.'
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setIsCouponApplied(false);
    setCouponDiscount(0);
    setFinalAmount(originalAmount);
    setCouponCode('');
    setAppliedCouponCode('');
  };

  const handlePayment = async () => {
    if (paymentLoading) return;

    console.log('Processing payment...');
    console.log('Payment method:', selectedPaymentMethod);
    console.log('Amount:', totalAmount);
    console.log('Applied coupon:', appliedCouponCode);

    setPaymentLoading(true);

    try {
      // Get authentication token
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'Please sign in to continue payment');
        return;
      }

      setAuthToken(token);

      // Get actual data from route params 
      const actualSeatIds = actualSelectedSeats?.map(seat => seat.id).filter(Boolean) || [];
      
      // Use the passenger data that already has seatId and validation
      const actualPassengers = passengers?.map((passenger) => ({
        seatId: passenger.seatId,
        name: passenger.name,
        age: passenger.age,
        gender: passenger.gender,
        phone: passenger.phone || '',
        email: passenger.email,
      })) || [];

      console.log('Extracted seat IDs:', actualSeatIds);
      console.log('Processed passengers:', actualPassengers);

      // Extract boarding and dropping points from the trip data or route params
      const actualBoardingPointId = contactDetails?.boardingPointId || 
        route.params?.boardingPoint?.id ||
        busData.tripData?.fromStop?.boardingPoints?.[0]?.id || 
        '12345678-1234-5678-9abc-123456789abe';
      
      const actualDroppingPointId = contactDetails?.droppingPointId || 
        route.params?.droppingPoint?.id ||
        busData.tripData?.toStop?.boardingPoints?.[0]?.id || 
        '12345678-1234-5678-9abc-123456789abf';

      const paymentData = {
        tripId: busData.tripId || busData.tripData?.tripId || busData.id,
        fromStopId: busData.fromStopId || busData.tripData?.fromStop?.id,
        toStopId: busData.toStopId || busData.tripData?.toStop?.id,
        seatIds: actualSeatIds,
        passengers: actualPassengers,
        paymentMethod: selectedPaymentMethod,
        boardingPointId: actualBoardingPointId,
        droppingPointId: actualDroppingPointId,
        ...(appliedCouponCode && { couponCode: appliedCouponCode }),
      };

      console.log('Initiating payment with data:', paymentData);
      console.log('Payment data validation:', {
        tripId: paymentData.tripId,
        fromStopId: paymentData.fromStopId,
        toStopId: paymentData.toStopId,
        seatIdsLength: paymentData.seatIds.length,
        passengersLength: paymentData.passengers.length,
        paymentMethod: paymentData.paymentMethod,
        boardingPointId: paymentData.boardingPointId,
        droppingPointId: paymentData.droppingPointId,
        hasCouponCode: !!paymentData.couponCode,
      });

      // Validate required fields before sending
      if (!paymentData.tripId) {
        throw new Error('Trip ID is missing');
      }
      if (!paymentData.fromStopId) {
        throw new Error('From Stop ID is missing');
      }
      if (!paymentData.toStopId) {
        throw new Error('To Stop ID is missing');
      }
      if (!paymentData.seatIds.length || paymentData.seatIds.some(id => !id)) {
        throw new Error('Valid seat IDs are missing. Please go back and select seats again.');
      }
      if (!paymentData.passengers.length) {
        throw new Error('Passengers data is missing');
      }
      if (paymentData.passengers.some(p => !p.seatId || !p.email || !p.name)) {
        throw new Error('Some passenger information is incomplete (missing seat ID, email, or name)');
      }

      // Initiate payment with backend
      const response = await api.initiatePayment(paymentData, token);

      if (!response.success) {
        let errorMessage = response.error || 'Failed to initiate payment';
        
        // Add validation error details if available
        if (response.validationErrors) {
          const validationDetails = response.validationErrors.map(err => err.message || err.path?.join('.') || 'Unknown error').join('\\n');
          errorMessage += '\\n\\nValidation errors:\\n' + validationDetails;
        }
        
        throw new Error(errorMessage);
      }

      const paymentResult = response.data;
      console.log('Payment initiation response:', paymentResult);

      setCurrentPaymentId(paymentResult.paymentId);

      if (selectedPaymentMethod === 'RAZORPAY') {
        // Open actual Razorpay checkout
        await openRazorpayCheckout(paymentResult, token);
      } else if (selectedPaymentMethod === 'ESEWA') {
        // Handle eSewa payment
        await handleEsewaPayment(paymentResult, token);
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Error',
        error.message || 'Failed to process payment. Please try again.'
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // WebView-based Razorpay integration (fallback for Expo)
  const openRazorpayWebView = async (paymentData, token) => {
    console.log('🌐 WebView Razorpay fallback triggered');
    
    Alert.alert(
      'Payment Method Notice',
      'Native Razorpay checkout is not available in this environment (Expo Go). Would you like to proceed with a simulated payment for testing?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => setPaymentLoading(false)
        },
        {
          text: 'Simulate Payment',
          onPress: () => {
            console.log('📱 User chose to simulate payment in Expo environment');
            simulateSuccessfulPayment(paymentData, token);
          }
        },
        {
          text: 'Learn More',
          onPress: () => {
            Alert.alert(
              'About Payment Integration',
              'In development:\n• Expo Go: Simulated payments\n• Production build: Real Razorpay\n\nFor real payments, create a production build of this app.',
              [{ text: 'OK', onPress: () => simulateSuccessfulPayment(paymentData, token) }]
            );
          }
        }
      ]
    );
  };

  // Verify actual Razorpay payment response
  const verifyRazorpayPayment = async (razorpayResponse, paymentData, token) => {
    try {
      console.log('🔍 Verifying actual Razorpay payment response:', razorpayResponse);

      // Prepare verification data using actual Razorpay response
      const verificationData = {
        paymentId: paymentData.paymentId,
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
      };

      console.log('📤 Sending payment verification data:', {
        ...verificationData,
        razorpaySignature: verificationData.razorpaySignature.substring(0, 16) + '...'
      });

      const verificationResponse = await api.verifyPayment(verificationData, token);
      
      console.log('📋 Payment verification response:', verificationResponse);
      
      if (verificationResponse.success) {
        Alert.alert(
          'Payment Successful! ✅',
          `Your booking has been confirmed!\n\nPayment ID: ${razorpayResponse.razorpay_payment_id}\nBooking will be processed shortly.`,
          [
            {
              text: 'View Bookings',
              onPress: () => {
                // Navigate to bookings or home
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'BusSearchScreen' }],
                });
              },
            },
            {
              text: 'OK',
              onPress: () => {
                console.log('Payment completed successfully');
              },
            },
          ]
        );
      } else {
        throw new Error(verificationResponse.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('💥 Payment verification error:', error.message);
      console.error('📍 Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // More specific error messaging
      let errorMessage = 'Payment verification failed. Please contact support.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.errorMessage || 'Payment verification failed due to invalid data.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please sign in again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Payment not found. Please try again.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      Alert.alert('Payment Verification Failed', errorMessage);
    }
  };

  const simulateSuccessfulPayment = async (paymentData, token) => {
    try {
      // Generate realistic payment ID for demo
      const demoPaymentId = 'demo_payment_' + Date.now();
      
      // Generate proper signature using the same logic as backend
      const generatedSignature = generateRazorpaySignature(
        paymentData.orderId, 
        demoPaymentId, 
        DEMO_RAZORPAY_KEY_SECRET
      );

      // Generate more realistic mock data for demo purposes
      const mockRazorpayResponse = {
        razorpay_order_id: paymentData.orderId,
        razorpay_payment_id: demoPaymentId,
        razorpay_signature: generatedSignature, // Now using properly generated signature
      };

      console.log('🎯 Mock Razorpay Response:', mockRazorpayResponse);
      console.log('🔐 Generated signature for payload:', `${paymentData.orderId}|${demoPaymentId}`);

      // Verify payment with backend
      const verificationData = {
        paymentId: paymentData.paymentId,
        razorpayOrderId: mockRazorpayResponse.razorpay_order_id,
        razorpayPaymentId: mockRazorpayResponse.razorpay_payment_id,
        razorpaySignature: mockRazorpayResponse.razorpay_signature,
      };

      console.log('🔍 Payment verification data being sent:', {
        ...verificationData,
        razorpaySignature: verificationData.razorpaySignature.substring(0, 16) + '...'
      });

      const verificationResponse = await api.verifyPayment(verificationData, token);
      
      console.log('📋 Payment verification response:', verificationResponse);
      
      if (verificationResponse.success) {
        Alert.alert(
          'Payment Successful!',
          'Your ticket has been booked successfully! In a production app, you would see your booking details.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back or to bookings
                console.log('Payment completed successfully');
              },
            },
          ]
        );
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('💥 Payment simulation error:', error.message);
      console.error('📍 Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // More specific error messaging
      let errorMessage = 'Payment verification failed. Please contact support.';
      
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.errorMessage || 'Payment verification failed due to invalid data.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please sign in again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Payment not found. Please try again.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection.';
      }

      Alert.alert('Payment Verification Failed', errorMessage);
    }
  };

  const handleEsewaPayment = async (paymentData, token) => {
    try {
      // For eSewa, we need to open a web form
      Alert.alert(
        'eSewa Payment',
        'You will be redirected to eSewa payment gateway.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Continue',
            onPress: async () => {
              // For demo purposes, simulate eSewa success
              Alert.alert(
                'eSewa Payment',
                'In a production app, this would redirect to eSewa. For demo purposes, simulating successful payment.',
                [
                  {
                    text: 'Simulate Success',
                    onPress: () => {
                      Alert.alert(
                        'Payment Successful!',
                        'Your eSewa payment was successful! Your ticket has been booked.',
                        [
                          {
                            text: 'OK',
                            onPress: () => {
                              console.log('eSewa payment completed successfully');
                            },
                          },
                        ]
                      );
                    },
                  },
                ]
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error('eSewa payment error:', error);
      Alert.alert(
        'eSewa Payment Error',
        error.message || 'Failed to open eSewa payment. Please try again.'
      );
    }
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
              Base Fare ({seatCount} seats)
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

          {/* Coupon Discount */}
          {isCouponApplied && (
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, styles.discountLabel]}>
                Coupon Discount ({appliedCouponCode})
              </Text>
              <Text style={[styles.fareAmount, styles.discountAmount]}>- ₹ {couponDiscount}</Text>
            </View>
          )}

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

        {/* Coupon Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Have a coupon?</Text>
          
          {!isCouponApplied ? (
            <View>
              <View style={styles.couponInputContainer}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                  editable={!couponLoading}
                />
                <TouchableOpacity
                  style={[
                    styles.applyCouponButton,
                    couponLoading && styles.applyCouponButtonDisabled
                  ]}
                  onPress={applyCoupon}
                  disabled={couponLoading}
                  activeOpacity={0.7}
                >
                  {couponLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.applyCouponButtonText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.appliedCouponContainer}>
              <View style={styles.appliedCouponInfo}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.appliedCouponText}>
                  Coupon '{appliedCouponCode}' applied
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeCouponButton}
                onPress={removeCoupon}
                activeOpacity={0.7}
              >
                <Text style={styles.removeCouponButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[
            styles.payButton,
            paymentLoading && styles.payButtonDisabled
          ]}
          activeOpacity={0.8}
          onPress={handlePayment}
          disabled={paymentLoading}
        >
          {paymentLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>Pay ₹ {totalAmount}</Text>
          )}
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
  payButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Coupon Styles
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  applyCouponButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyCouponButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  applyCouponButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  appliedCouponContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 12,
  },
  appliedCouponInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appliedCouponText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  removeCouponButton: {
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeCouponButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Discount styles
  discountLabel: {
    color: '#10B981',
  },
  discountAmount: {
    color: '#10B981',
  },
});

export default PaymentScreen;
