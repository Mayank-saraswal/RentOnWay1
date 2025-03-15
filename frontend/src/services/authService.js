import axios from 'axios';
import { toast } from 'react-toastify';

// Base API URL
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const AUTH_ENDPOINT = `${API_URL}/api/auth`;
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Create axios instance with auth header
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests if available
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage on auth error
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication Service
 * Handles user authentication, registration, and verification
 * Uses Fast2SMS for mobile OTP and custom email service for email OTP
 */
class AuthService {
  /**
   * Register a new user with email and password
   * @param {Object} userData - User data including name, email, phone, password, role
   * @returns {Promise} - Promise with registration result
   */
  async register(userData) {
    try {
      const { name, email, phone, password, role = 'customer' } = userData;
      
      // Validate input
      if (!name || !email || !phone || !password) {
        toast.error('Please fill in all required fields');
        return { success: false, message: 'Missing required fields' };
      }
      
      // Send registration request to backend
      const response = await axios.post(`${AUTH_ENDPOINT}/register`, {
        name,
        email,
        phone,
        password,
        role
      });
      
      if (response.data.success) {
        toast.success('Registration initiated! Please verify your phone number.');
        return { 
          success: true, 
          user: response.data.user,
          message: response.data.message
        };
      } else {
        toast.error(response.data.message || 'Registration failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Login with email/phone and password
   * @param {string} identifier - Email or phone number
   * @param {string} password - User password
   * @returns {Promise} - Promise with login result
   */
  async login(identifier, password) {
    try {
      // Validate input
      if (!identifier || !password) {
        toast.error('Please enter your email/phone and password');
        return { success: false, message: 'Missing credentials' };
      }
      
      // Determine if identifier is email or phone
      const isEmail = identifier.includes('@');
      const loginData = {
        password,
        [isEmail ? 'email' : 'phone']: identifier
      };
      
      // Send login request to backend
      const response = await axios.post(`${AUTH_ENDPOINT}/login`, loginData);
      
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        
        toast.success('Login successful!');
        return { 
          success: true, 
          user: response.data.user,
          token: response.data.token
        };
      } else {
        toast.error(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Send OTP to phone number using Fast2SMS
   * @param {string} phone - Phone number to send OTP
   * @param {string} purpose - Purpose of OTP (login, register, verification)
   * @returns {Promise} - Promise with OTP sending result
   */
  async sendPhoneOTP(phone, purpose = 'verification') {
    try {
      // Validate phone number
      if (!phone) {
        toast.error('Please enter a valid phone number');
        return { success: false, message: 'Invalid phone number' };
      }
      
      // Format phone number (remove +91 if present)
      const formattedPhone = phone.replace(/^\+91/, '');
      
      // Send OTP request to backend
      const response = await axios.post(`${AUTH_ENDPOINT}/send-phone-otp`, {
        phone: formattedPhone,
        purpose
      });
      
      if (response.data.success) {
        toast.success('OTP sent to your phone!');
        return { 
          success: true, 
          message: response.data.message,
          requestId: response.data.otpId
        };
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Send OTP to email
   * @param {string} email - Email to send OTP
   * @param {string} purpose - Purpose of OTP (login, register, verification)
   * @returns {Promise} - Promise with OTP sending result
   */
  async sendEmailOTP(email, purpose = 'verification') {
    try {
      // Validate email
      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address');
        return { success: false, message: 'Invalid email address' };
      }
      
      // Send OTP request to backend
      const response = await axios.post(`${AUTH_ENDPOINT}/send-email-otp`, {
        email,
        purpose
      });
      
      if (response.data.success) {
        toast.success('OTP sent to your email!');
        return { 
          success: true, 
          message: response.data.message,
          requestId: response.data.otpId
        };
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Send email OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send email OTP. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Verify phone OTP
   * @param {string} phone - Phone number
   * @param {string} otp - OTP entered by user
   * @returns {Promise} - Promise with verification result
   */
  async verifyPhoneOTP(phone, otp) {
    try {
      // Validate OTP
      if (!otp || !phone) {
        toast.error('Invalid OTP or phone number');
        return { success: false, message: 'Invalid OTP or phone number' };
      }
      
      // Format phone number (remove +91 if present)
      const formattedPhone = phone.replace(/^\+91/, '');
      
      // Send verification request to backend
      const response = await axios.post(`${AUTH_ENDPOINT}/verify-phone-otp`, {
        phone: formattedPhone,
        otp
      });
      
      if (response.data.success) {
        toast.success('Phone verification successful!');
        
        // If token is provided, store it
        if (response.data.token) {
          localStorage.setItem(TOKEN_KEY, response.data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        }
        
        return { 
          success: true, 
          message: response.data.message,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        toast.error(response.data.message || 'OTP verification failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Verify email OTP
   * @param {string} email - Email address
   * @param {string} otp - OTP entered by user
   * @returns {Promise} - Promise with verification result
   */
  async verifyEmailOTP(email, otp) {
    try {
      // Validate OTP
      if (!otp || !email) {
        toast.error('Invalid OTP or email');
        return { success: false, message: 'Invalid OTP or email' };
      }
      
      // Send verification request to backend
      const response = await axios.post(`${AUTH_ENDPOINT}/verify-email-otp`, {
        email,
        otp
      });
      
      if (response.data.success) {
        toast.success('Email verification successful!');
        
        // If token is provided, store it
        if (response.data.token) {
          localStorage.setItem(TOKEN_KEY, response.data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        }
        
        return { 
          success: true, 
          message: response.data.message,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        toast.error(response.data.message || 'OTP verification failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} - Promise with password reset request result
   */
  async forgotPassword(email) {
    try {
      // Validate email
      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address');
        return { success: false, message: 'Invalid email address' };
      }
      
      // Send password reset request to backend
      const response = await axios.post(`${AUTH_ENDPOINT}/forgot-password`, { email });
      
      if (response.data.success) {
        toast.success('Password reset email sent. Please check your inbox.');
        return { 
          success: true, 
          message: response.data.message,
          resetToken: response.data.resetToken
        };
      } else {
        toast.error(response.data.message || 'Failed to send password reset email');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send password reset email. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise} - Promise with password reset result
   */
  async resetPassword(token, password) {
    try {
      // Validate input
      if (!token || !password) {
        toast.error('Invalid token or password');
        return { success: false, message: 'Invalid token or password' };
      }
      
      // Send password reset request to backend
      const response = await axios.post(`${AUTH_ENDPOINT}/reset-password`, { 
        token, 
        password 
      });
      
      if (response.data.success) {
        toast.success('Password reset successful! You can now login with your new password.');
        return { success: true, message: response.data.message };
      } else {
        toast.error(response.data.message || 'Failed to reset password');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Get current user profile
   * @returns {Promise} - Promise with user profile
   */
  async getProfile() {
    try {
      const response = await authAxios.get(`${AUTH_ENDPOINT}/me`);
      
      if (response.data.success) {
        // Update stored user data
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        
        return { 
          success: true, 
          user: response.data.user
        };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to get profile. Please try again.';
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise} - Promise with update result
   */
  async updateProfile(userData) {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        toast.error('You must be logged in to update your profile');
        return { success: false, message: 'Authentication required' };
      }
      
      // Send update request to backend
      const response = await authAxios.put(`${AUTH_ENDPOINT}/update-profile`, userData);
      
      if (response.data.success) {
        // Update stored user data
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        
        toast.success('Profile updated successfully!');
        return { 
          success: true, 
          user: response.data.user,
          message: response.data.message
        };
      } else {
        toast.error(response.data.message || 'Profile update failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'Profile update failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }
  
  /**
   * Logout user
   * @returns {Object} - Logout result
   */
  logout() {
    try {
      // Remove token and user data from localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      toast.success('Logged out successfully!');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
      return { success: false, message: 'Logout failed' };
    }
  }
  
  /**
   * Get current user
   * @returns {Object|null} - Current user or null if not logged in
   */
  getCurrentUser() {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
  
  /**
   * Check if user is logged in
   * @returns {boolean} - True if logged in, false otherwise
   */
  isLoggedIn() {
    return !!this.getCurrentUser();
  }
  
  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean} - True if user has role, false otherwise
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }
}

const authService = new AuthService();
export default authService; 