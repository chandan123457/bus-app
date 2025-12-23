/**
 * Sign Up Screen - Premium iOS-Style Design
 * 
 * Features:
 * - Strong blur background with dark overlay
 * - Single large card with curved bottom
 * - Logo circle overlapping card top
 * - Four input fields (Name, Email, Password, Confirm Password)
 * - Terms & policy checkbox
 * - Blue SIGN UP button
 * - Social login icons
 * - Sign in footer link
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Custom SVG Icons for guaranteed rendering
const GoogleIcon = () => (
  <Svg width="26" height="26" viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </Svg>
);

const FacebookIcon = () => (
  <Svg width="26" height="26" viewBox="0 0 24 24">
    <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </Svg>
);

const TwitterIcon = () => (
  <Svg width="26" height="26" viewBox="0 0 24 24">
    <Path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" fill="#1DA1F2"/>
  </Svg>
);

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignUp = () => {
    console.log('Sign up:', { name, email, password, confirmPassword, agreedToTerms });
  };

  const handleSocialLogin = (provider) => {
    console.log('Social login:', provider);
  };

  const handleSignIn = () => {
    navigation.goBack();
  };

  const handleTermsPress = () => {
    console.log('Open terms & policy');
  };

  return (
    <>
      {/* Status bar visible */}
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      
      {/* Full-screen background - strong blur with soft dark overlay */}
      <ImageBackground
        source={require('../../assets/landing-background.jpg')}
        style={styles.background}
        resizeMode="cover"
        blurRadius={20}
      >
        {/* Soft dark overlay for readability */}
        <View style={styles.overlay} />
        
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.container}>
            {/* Logo Circle - overlapping card top */}
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Main White Card */}
              <View style={styles.card}>
                {/* Title */}
                <Text style={styles.heading}>Create your account</Text>

                {/* Name Field */}
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ex: lakshay"
                  placeholderTextColor="#A8A8A8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />

                {/* Email Field */}
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ex: lakshay@gmail.com"
                  placeholderTextColor="#A8A8A8"
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
                  placeholderTextColor="#A8A8A8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />

                {/* Confirm Password Field */}
                <Text style={styles.label}>Confirm password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#A8A8A8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />

                {/* Terms & Policy Checkbox */}
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                    {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxText}>
                    I understood the{' '}
                    <Text style={styles.linkText} onPress={handleTermsPress}>
                      terms & policy
                    </Text>
                    .
                  </Text>
                </TouchableOpacity>

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={handleSignUp}
                  activeOpacity={0.85}
                >
                  <Text style={styles.signUpButtonText}>SIGN UP</Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or sign up with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login Icons */}
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

                {/* Footer */}
                <View style={styles.signInContainer}>
                  <Text style={styles.signInText}>Have an account? </Text>
                  <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
                    <Text style={styles.signInLink}>SIGN IN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
};

// Design constants - compact for no-scroll layout
const LOGO_CIRCLE_SIZE = 75;
const CARD_TOP_RADIUS = 32;
const CARD_BOTTOM_RADIUS = 45;
const INPUT_HEIGHT = 44;
const BUTTON_HEIGHT = 46;
const SOCIAL_BUTTON_SIZE = 50;
const PRIMARY_BLUE = '#4B7BF5';

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
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },

  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Logo positioned to overlap card top
  logoContainer: {
    alignItems: 'center',
    marginBottom: -(LOGO_CIRCLE_SIZE / 2),
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },

  logo: {
    width: LOGO_CIRCLE_SIZE * 0.6,
    height: LOGO_CIRCLE_SIZE * 0.6,
  },

  // Main white card with curved bottom
  card: {
    width: width * 0.94,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: CARD_TOP_RADIUS,
    borderTopRightRadius: CARD_TOP_RADIUS,
    borderBottomLeftRadius: CARD_BOTTOM_RADIUS,
    borderBottomRightRadius: CARD_BOTTOM_RADIUS,
    paddingTop: (LOGO_CIRCLE_SIZE / 2) + 14,
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },

  // Title
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'left',
    marginBottom: 10,
  },

  // Input label
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 5,
    textAlign: 'left',
  },

  // Input field
  input: {
    height: INPUT_HEIGHT,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#000000',
    marginBottom: 8,
  },

  // Checkbox container
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 10,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  checkboxText: {
    fontSize: 13,
    color: '#000000',
    flex: 1,
  },

  linkText: {
    color: PRIMARY_BLUE,
    fontWeight: '600',
  },

  // Sign Up Button
  signUpButton: {
    height: BUTTON_HEIGHT,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },

  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D9D9D9',
  },

  dividerText: {
    color: '#9E9E9E',
    fontSize: 13,
    fontWeight: '400',
    marginHorizontal: 12,
  },

  // Social buttons container
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 30,
  },

  // Social button
  socialButton: {
    width: SOCIAL_BUTTON_SIZE,
    height: SOCIAL_BUTTON_SIZE,
    borderRadius: 12,
    backgroundColor: '#F1F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Footer
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },

  signInText: {
    color: '#000000',
    fontSize: 13,
  },

  signInLink: {
    color: PRIMARY_BLUE,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default SignUpScreen;
