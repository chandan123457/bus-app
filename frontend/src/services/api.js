/**
 * API Service
 * Centralized API calls using axios
 */

import axios from 'axios';
import API_BASE_URL, { API_ENDPOINTS } from '../config/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (optional - for adding auth tokens, etc.)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (optional - for handling common errors)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      return Promise.reject(error);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error details:', {
        message: error.message,
        code: error.code,
        baseURL: API_BASE_URL,
        endpoint: error.config?.url,
      });
      
      // Provide more specific error messages
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error('Request timeout. Please check your connection and try again.'));
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return Promise.reject(new Error('Cannot connect to server. Please check your network connection.'));
      } else {
        return Promise.reject(new Error('Network error. Please check your connection and ensure the server is running.'));
      }
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
);

/**
 * User API functions
 */
export const userAPI = {
  /**
   * Sign up a new user
   * @param {Object} userData - { name, email, password }
   * @returns {Promise} API response
   */
  signup: async (userData) => {
    try {
      console.log('Sending signup request to:', API_BASE_URL + API_ENDPOINTS.SIGNUP);
      console.log('Signup data:', { name: userData.name, email: userData.email, password: '***' });
      
      const response = await api.post(API_ENDPOINTS.SIGNUP, userData);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Sign up successful',
      };
    } catch (error) {
      console.error('Signup error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
      });
      
      // Handle network errors specifically
      if (!error.response && error.message) {
        return {
          success: false,
          error: error.message || 'Network error. Please check your connection and ensure the server is running.',
          status: null,
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.errorMessage || error.message || 'Sign up failed',
        status: error.response?.status,
      };
    }
  },

  /**
   * Sign in user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} API response
   */
  signin: async (credentials) => {
    try {
      const signinUrl = API_BASE_URL + API_ENDPOINTS.SIGNIN;
      console.log('Sending signin request to:', signinUrl);
      console.log('Signin data:', { 
        email: credentials.email, 
        password: '***',
        emailLength: credentials.email?.length,
        passwordLength: credentials.password?.length,
      });
      
      const response = await api.post(API_ENDPOINTS.SIGNIN, credentials);
      console.log('Signin success:', {
        status: response.status,
        message: response.data?.message,
        hasToken: !!response.data?.token,
        user: response.data?.user?.email,
      });
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Sign in successful',
      };
    } catch (error) {
      console.error('Signin error details:', {
        message: error.message,
        status: error.response?.status,
        errorMessage: error.response?.data?.errorMessage,
        code: error.code,
        requestUrl: error.config?.url,
        baseURL: API_BASE_URL,
        requestData: {
          email: credentials.email,
          passwordLength: credentials.password?.length,
        },
      });
      
      // Handle network errors specifically (no response from server)
      if (!error.response) {
        console.error('Network error - Server may not be accessible:', {
          apiUrl: API_BASE_URL,
          errorCode: error.code,
          errorMessage: error.message,
          endpoint: API_ENDPOINTS.SIGNIN,
        });
        
        return {
          success: false,
          error: `Cannot connect to server.\n\nServer: ${API_BASE_URL}\n\nPlease check:\n✓ Backend server is running\n✓ Device is on the same network\n✓ Firewall allows connections\n✓ IP address is correct`,
          status: null,
        };
      }
      
      // Extract error message - backend returns "Invalid credentials" for wrong email/password
      const errorMessage = error.response?.data?.errorMessage || error.message || 'Sign in failed';
      
      return {
        success: false,
        error: errorMessage,
        status: error.response?.status,
      };
    }
  },

  /**
   * Verify email with OTP
   * @param {Object} data - { email, otp }
   * @returns {Promise} API response
   */
  verifyEmail: async (data) => {
    try {
      const response = await api.post(API_ENDPOINTS.VERIFY_EMAIL, data);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Email verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Email verification failed',
        status: error.response?.status,
      };
    }
  },
};

export default api;

