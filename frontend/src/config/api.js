/**
 * API Configuration
 * Base URL and API endpoints configuration
 * 
 * IMPORTANT FOR MOBILE TESTING:
 * - localhost won't work on mobile devices
 * - Use your computer's local IP address instead
 * - Find your IP: 
 *   - Mac/Linux: run `ifconfig` or `ip addr`
 *   - Windows: run `ipconfig`
 *   - Look for IPv4 address (e.g., 192.168.1.100)
 * - Example: 'http://192.168.1.100:3000'
 * - Make sure phone and computer are on the same WiFi network
 */

// TODO: Replace with your actual backend URL
// For development with mobile device, use your local IP address
// For production, use your deployed backend URL
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.23.32:3000'  // Updated for mobile testing: use your computer's IP
  : 'https://your-production-api.com';  // ⚠️ Replace with your production backend URL

// Log API URL in development for debugging
if (__DEV__) {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('💡 Network troubleshooting:');
  console.log('   - Ensure backend server is running');
  console.log('   - Check IP address matches your current network IP');
  console.log('   - Mobile device must be on same WiFi network');
}

export const API_ENDPOINTS = {
  // User endpoints
  SIGNUP: '/user/signup',
  SIGNIN: '/user/signin',
  VERIFY_EMAIL: '/user/verifyEmail',
  FORGOT_PASSWORD: '/user/forgot-password',
  RESET_PASSWORD: '/user/reset-password',
  
  // Booking endpoints
  SHOW_BUS: '/user/showbus',
  BUS_INFO: '/user/showbusinfo',
  MY_BOOKINGS: '/user/mybookings',
  
  // Payment endpoints
  PAYMENT_INITIATE: '/user/payments/initiate',
  PAYMENT_VERIFY: '/user/payments/verify',
  
  // Coupon endpoints
  APPLY_COUPON: '/user/booking/apply-coupon',
  
  // Other endpoints
  PROFILE: '/user/profile',
  OFFERS: '/user/offers',
};

export default API_BASE_URL;

