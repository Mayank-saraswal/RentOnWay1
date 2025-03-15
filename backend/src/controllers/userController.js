import User from '../models/User.js';
import { generateOTP, sendOTP, verifyOTP } from '../utils/otpUtils.js';
import { generateEmailOTP, sendEmailOTP, verifyEmailOTP } from '../utils/emailUtils.js';
import generateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Temporary storage for user registration data
const pendingRegistrations = new Map();

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    console.log(`Attempting to register user with phone: ${phone} and email: ${email}`);

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { phone }]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone'
      });
    }

    // Generate OTP for phone verification
    const phoneOtp = generateOTP();
    console.log(`Phone OTP for ${phone}: ${phoneOtp}`);
    
    // Generate OTP for email verification
    const emailOtp = generateEmailOTP();
    console.log(`Email OTP for ${email}: ${emailOtp}`);
    
    // Store registration data temporarily
    pendingRegistrations.set(phone, {
      name,
      email,
      phone,
      password,
      phoneOtp,
      emailOtp,
      phoneVerified: false,
      emailVerified: false,
      expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes
    });
    
    // Send OTP via Fast2SMS
    const phoneOtpResult = await sendOTP(phone, phoneOtp);
    
    if (!phoneOtpResult.success) {
      console.error(`Failed to send phone OTP: ${phoneOtpResult.message}`);
    }
    
    // Send OTP via Email
    const emailOtpResult = await sendEmailOTP(email, emailOtp);
    
    if (!emailOtpResult.success) {
      console.error(`Failed to send email OTP: ${emailOtpResult.message}`);
    }
    
    res.status(200).json({
      success: true,
      message: 'OTPs sent successfully. Please verify your phone and email to complete registration.',
      data: {
        phone,
        email,
        phoneOtp: process.env.NODE_ENV === 'development' ? phoneOtp : undefined, // Only in development
        emailOtp: process.env.NODE_ENV === 'development' ? emailOtp : undefined  // Only in development
      }
    });
  } catch (error) {
    console.error('Error initiating registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify user phone with OTP
// @route   POST /api/users/verify-phone-otp
// @access  Public
export const verifyPhoneOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Check if there's a pending registration
    const pendingData = pendingRegistrations.get(phone);
    
    if (!pendingData) {
      // Check if this is for an existing user
      const existingUser = await User.findOne({ phone });
      
      if (existingUser) {
        // Verify OTP using the utility function
        const isValid = verifyOTP(phone, otp);
        
        if (isValid) {
          // Update user's phone verification status
          existingUser.isPhoneVerified = true;
          await existingUser.save();
          
          // Generate token
          const token = generateToken(existingUser._id);
          
          return res.status(200).json({
            success: true,
            message: 'Phone verified successfully',
            data: {
              id: existingUser._id,
              name: existingUser.name,
              email: existingUser.email,
              phone: existingUser.phone,
              token
            }
          });
        } else {
          return res.status(400).json({
            success: false,
            message: 'Invalid or expired OTP'
          });
        }
      }
      
      return res.status(404).json({
        success: false,
        message: 'No pending registration found for this phone number'
      });
    }
    
    // Check if OTP has expired
    if (Date.now() > pendingData.expiresAt) {
      pendingRegistrations.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'Registration session has expired. Please register again.'
      });
    }
    
    // Verify OTP
    if (otp !== pendingData.phoneOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }
    
    // Mark phone as verified
    pendingData.phoneVerified = true;
    pendingRegistrations.set(phone, pendingData);
    
    // Check if both phone and email are verified
    if (pendingData.phoneVerified && pendingData.emailVerified) {
      // Create user after successful verification
      const user = await User.create({
        name: pendingData.name,
        email: pendingData.email,
        phone: pendingData.phone,
        password: pendingData.password,
        isPhoneVerified: true,
        isEmailVerified: true,
        isVerified: true
      });
      
      // Remove from pending registrations
      pendingRegistrations.delete(phone);
      
      if (user) {
        // Generate token
        const token = generateToken(user._id);
        
        return res.status(201).json({
          success: true,
          message: 'Registration completed successfully',
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            token
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Failed to create user'
        });
      }
    }
    
    // If only phone is verified but not email
    return res.status(200).json({
      success: true,
      message: 'Phone verified successfully. Please verify your email to complete registration.',
      data: {
        phone,
        email: pendingData.email,
        phoneVerified: true,
        emailVerified: pendingData.emailVerified
      }
    });
  } catch (error) {
    console.error('Error verifying phone OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify user email with OTP
// @route   POST /api/users/verify-email-otp
// @access  Public
export const verifyUserEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find the pending registration by email
    let pendingData = null;
    let phoneKey = null;
    
    for (const [key, value] of pendingRegistrations.entries()) {
      if (value.email === email) {
        pendingData = value;
        phoneKey = key;
        break;
      }
    }
    
    if (!pendingData) {
      // Check if this is for an existing user
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        // Verify OTP using the utility function
        const isValid = verifyEmailOTP(email, otp);
        
        if (isValid) {
          // Update user's email verification status
          existingUser.isEmailVerified = true;
          await existingUser.save();
          
          // Generate token
          const token = generateToken(existingUser._id);
          
          return res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: {
              id: existingUser._id,
              name: existingUser.name,
              email: existingUser.email,
              phone: existingUser.phone,
              token
            }
          });
        } else {
          return res.status(400).json({
            success: false,
            message: 'Invalid or expired OTP'
          });
        }
      }
      
      return res.status(404).json({
        success: false,
        message: 'No pending registration found for this email'
      });
    }
    
    // Check if OTP has expired
    if (Date.now() > pendingData.expiresAt) {
      pendingRegistrations.delete(phoneKey);
      return res.status(400).json({
        success: false,
        message: 'Registration session has expired. Please register again.'
      });
    }
    
    // Verify OTP
    if (otp !== pendingData.emailOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }
    
    // Mark email as verified
    pendingData.emailVerified = true;
    pendingRegistrations.set(phoneKey, pendingData);
    
    // Check if both phone and email are verified
    if (pendingData.phoneVerified && pendingData.emailVerified) {
      // Create user after successful verification
      const user = await User.create({
        name: pendingData.name,
        email: pendingData.email,
        phone: pendingData.phone,
        password: pendingData.password,
        isPhoneVerified: true,
        isEmailVerified: true,
        isVerified: true
      });
      
      // Remove from pending registrations
      pendingRegistrations.delete(phoneKey);
      
      if (user) {
        // Generate token
        const token = generateToken(user._id);
        
        return res.status(201).json({
          success: true,
          message: 'Registration completed successfully',
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            token
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Failed to create user'
        });
      }
    }
    
    // If only email is verified but not phone
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. Please verify your phone to complete registration.',
      data: {
        phone: pendingData.phone,
        email,
        phoneVerified: pendingData.phoneVerified,
        emailVerified: true
      }
    });
  } catch (error) {
    console.error('Error verifying email OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
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

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.city = req.body.city || user.city;
      user.state = req.body.state || user.state;
      user.pincode = req.body.pincode || user.pincode;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        data: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          city: updatedUser.city,
          state: updatedUser.state,
          pincode: updatedUser.pincode,
          token: generateToken(updatedUser._id)
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user membership details
// @route   GET /api/users/membership
// @access  Private
export const getUserMembership = async (req, res) => {
  try {
    const userMembership = await UserMembership.findOne({
      where: { 
        userId: req.user.id,
        isActive: true
      },
      include: [
        {
          model: MembershipPlan,
          attributes: ['id', 'name', 'description', 'price', 'features', 'discountPercentage']
        }
      ]
    });

    if (userMembership) {
      res.status(200).json({
        success: true,
        data: userMembership
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'No active membership found',
        data: null
      });
    }
  } catch (error) {
    console.error('Error getting user membership:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send OTP to user's phone
// @route   POST /api/users/send-otp
// @access  Public
export const sendUserOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    // Check if user exists with this phone
    const user = await User.findOne({ phone });
    
    // Generate OTP
    const otp = generateOTP();
    
    console.log(`OTP for ${phone}: ${otp}`);
    
    // Send OTP via Fast2SMS
    const otpResult = await sendOTP(phone, otp);
    
    if (!otpResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP',
        error: otpResult.message
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phone,
        // Don't send OTP in response in production
        otp: otp, // Remove this in production
        requestId: otpResult.requestId
      }
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Handle Clerk user authentication
// @route   POST /api/users/clerk-auth
// @access  Public
export const handleClerkAuth = async (req, res) => {
  try {
    const { clerkId, name, email, phone, role } = req.body;

    if (!clerkId) {
      return res.status(400).json({
        success: false,
        message: 'Clerk ID is required'
      });
    }

    // Check if user exists
    let user = await User.findOne({ clerkId });

    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      
      // Only update role if it's provided and different
      if (role && user.role !== role) {
        user.role = role;
      }
      
      await user.save();
    } else {
      // Create new user
      user = new User({
        clerkId,
        name,
        email,
        phone,
        role: role || 'customer',
        isVerified: true // Clerk handles verification
      });
      
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Clerk auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message
    });
  }
};

// Handle Appwrite authentication
export const handleAppwriteAuth = async (req, res) => {
  try {
    const { appwriteId, name, email, role } = req.body;
    
    if (!appwriteId) {
      return res.status(400).json({
        success: false,
        message: 'Appwrite ID is required'
      });
    }
    
    // Check if user exists
    let user = await User.findOne({ appwriteId });
    
    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.email = email || user.email;
      
      // Only update role if it's provided and different
      if (role && user.role !== role) {
        user.role = role;
      }
      
      await user.save();
    } else {
      // Create new user
      user = new User({
        appwriteId,
        name,
        email,
        role: role || 'customer',
        isVerified: true // Appwrite handles verification
      });
      
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Appwrite auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message
    });
  }
};

// Handle Firebase authentication
export const handleFirebaseAuth = async (req, res) => {
  try {
    const { firebaseId, name, email, phone, role, photoURL } = req.body;
    
    if (!firebaseId) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID is required'
      });
    }
    
    // Check if user exists
    let user = await User.findOne({ firebaseId });
    
    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      user.profileImage = photoURL || user.profileImage;
      
      // Only update role if it's provided and different
      if (role && user.role !== role) {
        user.role = role;
      }
      
      await user.save();
    } else {
      // Create new user
      user = new User({
        firebaseId,
        name: name || 'User',
        email: email,
        phone: phone,
        role: role || 'customer',
        isVerified: true, // Firebase handles verification
        isEmailVerified: email ? true : false,
        isPhoneVerified: phone ? true : false,
        profileImage: photoURL
      });
      
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message
    });
  }
};
