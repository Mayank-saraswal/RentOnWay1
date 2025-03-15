import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [otpRequestId, setOtpRequestId] = useState(null);
  const [otpDestination, setOtpDestination] = useState(null);
  const [otpType, setOtpType] = useState('phone');
  const [otpPurpose, setOtpPurpose] = useState('verification');

  // Register a new user
  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        // Store OTP request info for verification
        if (result.requestId) {
          setOtpRequestId(result.requestId);
          setOtpDestination(userData.phone);
          setOtpType('phone');
          setOtpPurpose('register');
        }
        
        return { success: true, user: result.user, message: result.message };
      } else {
        toast.error(result.message || 'Registration failed');
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login with email/phone and password
  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const result = await authService.login(identifier, password);
      
      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      } else {
        toast.error(result.message || 'Login failed');
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Send OTP to phone
  const sendPhoneOTP = async (phone, purpose = 'verification') => {
    setLoading(true);
    try {
      const result = await authService.sendPhoneOTP(phone, purpose);
      
      if (result.success) {
        setOtpRequestId(result.requestId);
        setOtpDestination(phone);
        setOtpType('phone');
        setOtpPurpose(purpose);
        return { success: true };
      } else {
        toast.error(result.message || 'Failed to send OTP');
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error(error.message || 'Failed to send OTP');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Send OTP to email
  const sendEmailOTP = async (email, purpose = 'verification') => {
    setLoading(true);
    try {
      const result = await authService.sendEmailOTP(email, purpose);
      
      if (result.success) {
        setOtpRequestId(result.requestId);
        setOtpDestination(email);
        setOtpType('email');
        setOtpPurpose(purpose);
        return { success: true };
      } else {
        toast.error(result.message || 'Failed to send email OTP');
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Send email OTP error:', error);
      toast.error(error.message || 'Failed to send email OTP');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (otp, requestId = otpRequestId, type = otpType) => {
    setLoading(true);
    try {
      const result = await authService.verifyOTP(otp, requestId, type);
      
      if (result.success) {
        // If verification includes user data and token, update auth state
        if (result.user && result.token) {
          setCurrentUser(result.user);
          setIsAuthenticated(true);
        }
        
        // Reset OTP state
        setOtpRequestId(null);
        setOtpDestination(null);
        
        return { success: true, user: result.user };
      } else {
        toast.error(result.message || 'OTP verification failed');
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error(error.message || 'OTP verification failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setLoading(true);
    try {
      const result = await authService.resetPassword(email);
      
      if (result.success) {
        toast.success('Password reset email sent. Please check your inbox.');
        return { success: true };
      } else {
        toast.error(result.message || 'Failed to send password reset email');
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to send password reset email');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.updateProfile(userData);
      
      if (result.success) {
        setCurrentUser(prevUser => ({
          ...prevUser,
          ...result.user
        }));
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        toast.error(result.message || 'Profile update failed');
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Profile update failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    try {
      const result = authService.logout();
      
      if (result.success) {
        setCurrentUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully!');
        return { success: true };
      } else {
        toast.error(result.message || 'Logout failed');
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Logout failed');
      return { success: false, error: error.message };
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };

  // Check if user is seller
  const isSeller = () => {
    return currentUser?.role === 'seller';
  };

  // Check if user is delivery partner
  const isDeliveryPartner = () => {
    return currentUser?.role === 'delivery';
  };

  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = () => {
      const user = authService.getCurrentUser();
      
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    otpRequestId,
    otpDestination,
    otpType,
    otpPurpose,
    register,
    login,
    sendPhoneOTP,
    sendEmailOTP,
    verifyOTP,
    resetPassword,
    updateProfile,
    logout,
    isAdmin,
    isSeller,
    isDeliveryPartner
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 