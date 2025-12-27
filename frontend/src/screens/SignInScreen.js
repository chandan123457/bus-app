import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  BackHandler,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

// Custom SVG Icons
const GoogleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </Svg>
);

const FacebookIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </Svg>
);

const TwitterIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" fill="#1DA1F2"/>
  </Svg>
);

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lastBackPressTime = useRef(0);
  const backPressTimer = useRef(null);
  const EXIT_DELAY = 1000; // 1 second window for double press

  // Handle double back press to exit immediately
  useEffect(() => {
    const backAction = () => {
      const currentTime = Date.now();
      if (lastBackPressTime.current !== 0 && currentTime - lastBackPressTime.current < EXIT_DELAY) {
        // Second back press within 1 second - exit immediately
        if (backPressTimer.current) {
          clearTimeout(backPressTimer.current);
        }
        lastBackPressTime.current = 0;
        BackHandler.exitApp();
        return true;
      } else {
        // First back press
        lastBackPressTime.current = currentTime;
        if (navigation.canGoBack && navigation.canGoBack()) {
          navigation.goBack();
        } else {
          BackHandler.exitApp();
        }
        // Reset timer after delay
        if (backPressTimer.current) {
          clearTimeout(backPressTimer.current);
        }
        backPressTimer.current = setTimeout(() => {
          lastBackPressTime.current = 0;
        }, EXIT_DELAY);
        return true; // Prevent default behavior
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      backHandler.remove();
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current);
      }
    };
  }, [navigation]);

  const validateForm = () => {
    // Reset error
    setError('');

    // Check if email is empty
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }

    // Check if password is empty
    if (!password) {
      setError('Password is required');
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Set loading state
    setLoading(true);
    setError('');

    try {
      // Call API
      const result = await userAPI.signin({
        email: email.trim().toLowerCase(),
        password: password,
      });

      console.log('Signin result:', result);

      if (result.success) {
        // Safely extract token and user data
        const token = result.data?.token;
        const user = result.data?.user;
        
        if (!token || !user) {
          console.error('Invalid response structure:', result.data);
          setError('Invalid server response. Please try again.');
          return;
        }
        
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        
        console.log('Sign in successful, stored token and user data');
        
        // Sign in successful - navigate to Home
        navigation.navigate('Home');
      } else {
        // Show error message from API
        const errorMessage = result.error || 'Sign in failed. Please try again.';
        
        console.log('Signin failed:', errorMessage);
        
        // Provide helpful message for invalid credentials
        if (errorMessage.toLowerCase().includes('invalid credentials')) {
          setError('Invalid credentials. Please verify your email first before signing in. Check your email for the verification OTP sent during signup.');
        } else {
          setError(errorMessage);
          if (errorMessage.includes('Cannot connect to server')) {
            Alert.alert('Connection Error', errorMessage);
          } else {
            Alert.alert('Sign In Failed', errorMessage);
          }
        }
      }
    } catch (err) {
      // This should rarely happen since userAPI.signin doesn't throw
      console.error('Unexpected signin error:', err);
      const errorMessage = `Unexpected error: ${err.message}`;
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log('Social login:', provider);
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Full-screen background with soft teal overlay */}
      <ImageBackground
        source={require('../../assets/landing-background.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Soft teal overlay */}
        <View style={styles.overlay} />
        
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flex}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* Floating Logo - positioned above form card */}
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Sign In Card - logo bottom half overlaps it with visible gap */}
              <View style={styles.signInCard}>
                {/* Title */}
                <Text style={styles.heading}>Sign in your account</Text>

                {/* Email Field */}
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ex: lakshaybkl@gmail.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {/* Password Field */}
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />

                {/* Error Message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[styles.signInButton, (loading || !email.trim() || !password) && styles.signInButtonDisabled]}
                  onPress={handleSignIn}
                  activeOpacity={0.85}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.signInButtonText}>SIGN IN</Text>
                  )}
                </TouchableOpacity>

                {/* Social Sign-In Section */}
                <View style={styles.dividerContainer}>
                  <Text style={styles.dividerText}>or sign in with</Text>
                </View>

                {/* Social Login Buttons - Square */}
                <View style={styles.socialContainer}>
                  {/* Google */}
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('google')}
                    activeOpacity={0.7}
                  >
                    <GoogleIcon />
                  </TouchableOpacity>

                  {/* Facebook */}
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('facebook')}
                    activeOpacity={0.7}
                  >
                    <FacebookIcon />
                  </TouchableOpacity>

                  {/* Twitter */}
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('twitter')}
                    activeOpacity={0.7}
                  >
                    <TwitterIcon />
                  </TouchableOpacity>
                </View>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
                    <Text style={styles.signUpLink}>SIGN UP</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
};

const LOGO_CIRCLE_SIZE = 90;
const CARD_BORDER_RADIUS = 24;
const INPUT_HEIGHT = 48;
const BUTTON_HEIGHT = 50;
const SOCIAL_BUTTON_SIZE = 56;
const PRIMARY_BLUE = '#3B82F6';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  background: {
    flex: 1,
    width: width,
    height: height,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43, 99, 110, 0.85)', // Soft teal overlay
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },

  // Floating Logo - positioned above form card
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: -(LOGO_CIRCLE_SIZE / 2) + 15, // Bottom half overlaps form card, with small visible gap
    zIndex: 10,
  },

  logoCircle: {
    width: LOGO_CIRCLE_SIZE,
    height: LOGO_CIRCLE_SIZE,
    borderRadius: LOGO_CIRCLE_SIZE / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },

  logo: {
    width: LOGO_CIRCLE_SIZE * 0.6,
    height: LOGO_CIRCLE_SIZE * 0.6,
  },

  // Sign In Card (Second White Card) - SECOND CARD, logo bottom half overlaps it
  signInCard: {
    width: width * 0.9,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: CARD_BORDER_RADIUS,
    paddingTop: (LOGO_CIRCLE_SIZE / 2) + 20, // Space for logo bottom half overlap + visible gap
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginTop: 0, // Logo container marginBottom handles the overlap
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    zIndex: 2,
  },

  // Title
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'left',
    marginBottom: 24,
  },

  // Input label
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'left',
  },

  // Input field - light gray background, rounded corners, borderless
  input: {
    height: INPUT_HEIGHT,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 16,
    borderWidth: 0,
  },

  // Sign In Button - full width, blue background, white bold text
  signInButton: {
    height: BUTTON_HEIGHT,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Divider
  dividerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },

  dividerText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '400',
  },

  // Social buttons container - horizontal with equal spacing
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  // Social button - square, light background, rounded corners
  socialButton: {
    width: SOCIAL_BUTTON_SIZE,
    height: SOCIAL_BUTTON_SIZE,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Footer - Sign Up Link
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  signUpText: {
    color: '#1F2937',
    fontSize: 14,
  },

  signUpLink: {
    color: PRIMARY_BLUE,
    fontSize: 14,
    fontWeight: '700',
  },

  // Error container
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EF5350',
  },

  errorText: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  signInButtonDisabled: {
    opacity: 0.6,
  },
});

export default SignInScreen;
