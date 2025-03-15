const axios = require('axios');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendSMS } = require('../services/smsService');
const { sendEmail, sendOTPEmail, sendPasswordResetEmail } = require('../services/emailService');
const { generateOTP, validateEmail, validatePhone, formatPhoneNumber } = require('../utils/helpers');

// Fast2SMS API key from environment variables
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

// Email configuration
const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@rentonway.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'RentOnWay';

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} - JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role = 'customer' } = req.body;
    
    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(phone);
    if (!validatePhone(formattedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone: formattedPhone }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      phone: formattedPhone,
      password,
      role,
      isPhoneVerified: false,
      isEmailVerified: false
    });
    
    // Save user to database
    await user.save();
    
    // Generate OTP for phone verification
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000);
    
    // Save OTP to database
    const otpRecord = new OTP({
      otp,
      phone: formattedPhone,
      type: 'phone',
      purpose: 'register',
      expiresAt: otpExpire
    });
    
    await otpRecord.save();
    
    // Send OTP via SMS
    const message = `Your OTP for RentOnWay registration is: ${otp}`;
    await sendSMS(formattedPhone, message);
    
    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your phone number.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified
      },
      otpId: otpRecord._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    
    // Check if email or phone is provided
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number'
      });
    }
    
    // Check if password is provided
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide password'
      });
    }
    
    // Format phone number if provided
    const formattedPhone = phone ? formatPhoneNumber(phone) : '';
    
    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email },
        { phone: formattedPhone }
      ]
    }).select('+password');
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user is verified
    if (!user.isPhoneVerified) {
      // Generate OTP for phone verification
      const otp = generateOTP();
      const otpExpire = new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000);
      
      // Save OTP to database
      const otpRecord = new OTP({
        otp,
        phone: user.phone,
        type: 'phone',
        purpose: 'verification',
        expiresAt: otpExpire
      });
      
      await otpRecord.save();
      
      // Send OTP via SMS
      const message = `Your OTP for RentOnWay verification is: ${otp}`;
      await sendSMS(user.phone, message);
      
      return res.status(200).json({
        success: false,
        message: 'Phone verification required',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        otpId: otpRecord._id,
        requiresVerification: true
      });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

/**
 * Send OTP to phone
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.sendPhoneOTP = async (req, res) => {
  try {
    const { phone, purpose = 'verification' } = req.body;
    
    // Validate phone number
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a phone number'
      });
    }
    
    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone || !validatePhone(formattedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number'
      });
    }
    
    // Check if user exists for verification purpose
    if (purpose === 'verification' || purpose === 'login') {
      const user = await User.findOne({ phone: formattedPhone });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with this phone number'
        });
      }
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000);
    
    // Save OTP to database
    const otpRecord = new OTP({
      otp,
      phone: formattedPhone,
      type: 'phone',
      purpose,
      expiresAt: otpExpire
    });
    
    await otpRecord.save();
    
    // Send OTP via SMS
    const message = `Your OTP for RentOnWay ${purpose} is: ${otp}`;
    await sendSMS(formattedPhone, message);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'OTP sent to your phone',
      otpId: otpRecord._id
    });
  } catch (error) {
    console.error('Send phone OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending OTP',
      error: error.message
    });
  }
};

/**
 * Send OTP to email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.sendEmailOTP = async (req, res) => {
  try {
    const { email, purpose = 'verification' } = req.body;
    
    // Validate email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Check if user exists for verification purpose
    if (purpose === 'verification' || purpose === 'login') {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with this email address'
        });
      }
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000);
    
    // Save OTP to database
    const otpRecord = new OTP({
      otp,
      email,
      type: 'email',
      purpose,
      expiresAt: otpExpire
    });
    
    await otpRecord.save();
    
    // Send OTP via email
    await sendOTPEmail(email, otp);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      otpId: otpRecord._id
    });
  } catch (error) {
    console.error('Send email OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending email OTP',
      error: error.message
    });
  }
};

/**
 * Verify phone OTP
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    // Validate input
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }
    
    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    // Find OTP record
    const otpRecord = await OTP.findOne({
      phone: formattedPhone,
      otp,
      type: 'phone',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();
    
    // Find user
    const user = await User.findOne({ phone: formattedPhone });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user verification status
    user.isPhoneVerified = true;
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Verify phone OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying OTP',
      error: error.message
    });
  }
};

/**
 * Verify email OTP
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }
    
    // Find OTP record
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'email',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user verification status
    user.isEmailVerified = true;
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Verify email OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying email OTP',
      error: error.message
    });
  }
};

/**
 * Forgot password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save();
    
    // Send email with reset token
    await sendPasswordResetEmail(email, resetToken);
    
    return res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing forgot password request',
      error: error.message
    });
  }
};

/**
 * Reset password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Validate input
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }
    
    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with token and valid expire time
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while resetting password',
      error: error.message
    });
  }
};

/**
 * Get current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        address: user.address,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting user profile',
      error: error.message
    });
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, address } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields
    if (name) user.name = name;
    if (address) user.address = address;
    
    // Save user
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        address: user.address,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message
    });
  }
}; 