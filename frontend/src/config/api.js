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

// Backend URL configuration
// Use the same IP that Metro/Expo shows (your computer's IP on WiFi)
// Currently using: 192.168.22.4 (from Metro: exp://192.168.22.4:8081)
// If your IP changes, update only this line.
const API_BASE_URL = 'https://gantabya-44tr.onrender.com';  // Development: local IP for testing

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
  BOOKING_DETAILS: '/user/bookingdetails', // :groupId
  CANCEL_TICKET: '/user/cancelticket',
  DOWNLOAD_TICKET: '/user/booking/download-ticket', // :groupId
  
  // Payment endpoints
  PAYMENT_INITIATE: '/user/payments/initiate',
  PAYMENT_VERIFY: '/user/payments/verify',
  PAYMENT_CONFIRM: '/user/payments/confirm',
  
  // Coupon endpoints
  APPLY_COUPON: '/user/booking/apply-coupon',
  TRIP_COUPONS: '/user/trip', // :tripId/coupons
  
  // Notification endpoints
  NOTIFICATIONS: '/user/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/user/notifications/unread-count',
  NOTIFICATION_READ: '/user/notifications', // :id/read (PATCH)
  NOTIFICATION_READ_ALL: '/user/notifications/read-all', // (PATCH)
  
  // Other endpoints
  PROFILE: '/user/profile',
  OFFERS: '/user/offers',
  TRIP_SEATS: '/user/trip', // :tripId/seats
};

export default API_BASE_URL;

