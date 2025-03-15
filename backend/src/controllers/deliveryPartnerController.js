import jwt from 'jsonwebtoken';
import { DeliveryPartner, Order, User, OrderItem, Product } from '../models/index.js';
import { Op } from 'sequelize';
// import DeliveryPartner from '../models/DeliveryPartner.js';
import { uploadToCloudinary } from '../utils/cloudinaryUtils.js';
import mongoose from 'mongoose';
import TempDeliveryPartner from '../models/TempDeliveryPartner.js';
import { generateOTP, generateEmailOTP, sendOTP, sendEmailOTP } from '../utils/otpUtils.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id, type: 'deliveryPartner' }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new delivery partner
// @route   POST /api/delivery-partners/register
// @access  Public
export const registerDeliveryPartner = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
      city,
      state,
      pincode,
      vehicleType,
      vehicleNumber
    } = req.body;

    // Check if delivery partner already exists
    const partnerExists = await DeliveryPartner.findOne({ email });
    if (partnerExists) {
      return res.status(400).json({
        success: false,
        message: 'Delivery partner with this email already exists'
      });
    }

    // Handle file uploads
    let drivingLicenseImageUrl = null;
    let vehicleImageUrl = null;

    if (req.files) {
      // Upload driving license image if provided
      if (req.files.drivingLicenseImage) {
        const drivingLicenseImageResult = await uploadToCloudinary(
          req.files.drivingLicenseImage[0].path,
          'delivery-partners/licenses'
        );
        
        if (drivingLicenseImageResult.success) {
          drivingLicenseImageUrl = drivingLicenseImageResult.url;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Failed to upload driving license image',
            error: drivingLicenseImageResult.error
          });
        }
      }
      
      // Upload vehicle image if provided
      if (req.files.vehicleImage) {
        const vehicleImageResult = await uploadToCloudinary(
          req.files.vehicleImage[0].path,
          'delivery-partners/vehicles'
        );
        
        if (vehicleImageResult.success) {
          vehicleImageUrl = vehicleImageResult.url;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Failed to upload vehicle image',
            error: vehicleImageResult.error
          });
        }
      }
    }

    // Create delivery partner
    const partner = await DeliveryPartner.create({
      name,
      email,
      phone,
      password,
      address,
      city,
      state,
      pincode,
      vehicleType,
      vehicleNumber,
      drivingLicenseImage: drivingLicenseImageUrl,
      vehicleImage: vehicleImageUrl
      // Bank and document fields are now optional with default values
    });

    if (partner) {
      res.status(201).json({
        success: true,
        message: 'Delivery partner registered successfully',
        data: {
          id: partner._id,
          name: partner.name,
          email: partner.email,
          phone: partner.phone,
          drivingLicenseImage: partner.drivingLicenseImage,
          vehicleImage: partner.vehicleImage,
          token: generateToken(partner._id)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid delivery partner data'
      });
    }
  } catch (error) {
    console.error('Error registering delivery partner:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login delivery partner
// @route   POST /api/delivery-partners/login
// @access  Public
export const loginDeliveryPartner = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find delivery partner by email
    const partner = await DeliveryPartner.findOne({ where: { email } });

    // Check if partner exists and password matches
    if (partner && (await partner.matchPassword(password))) {
      // Update last login
      partner.lastLogin = new Date();
      await partner.save();

      res.status(200).json({
        success: true,
        data: {
          id: partner.id,
          name: partner.name,
          email: partner.email,
          isVerified: partner.isVerified,
          isActive: partner.isActive
        },
        token: generateToken(partner.id)
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Error logging in delivery partner:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get delivery partner profile
// @route   GET /api/delivery-partners/profile
// @access  Private/DeliveryPartner
export const getDeliveryPartnerProfile = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (partner) {
      res.status(200).json({
        success: true,
        data: partner
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Delivery partner not found'
      });
    }
  } catch (error) {
    console.error('Error getting delivery partner profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update delivery partner profile
// @route   PUT /api/delivery-partners/profile
// @access  Private/DeliveryPartner
export const updateDeliveryPartnerProfile = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByPk(req.user.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner not found'
      });
    }

    // Update fields
    const {
      name,
      phone,
      address,
      city,
      state,
      pincode,
      vehicleType,
      vehicleNumber,
      drivingLicenseNumber,
      bankAccountNumber,
      bankName,
      ifscCode
    } = req.body;

    if (name) partner.name = name;
    if (phone) partner.phone = phone;
    if (address) partner.address = address;
    if (city) partner.city = city;
    if (state) partner.state = state;
    if (pincode) partner.pincode = pincode;
    if (vehicleType) partner.vehicleType = vehicleType;
    if (vehicleNumber) partner.vehicleNumber = vehicleNumber;
    if (drivingLicenseNumber) partner.drivingLicenseNumber = drivingLicenseNumber;
    if (bankAccountNumber) partner.bankAccountNumber = bankAccountNumber;
    if (bankName) partner.bankName = bankName;
    if (ifscCode) partner.ifscCode = ifscCode;

    // Save updated partner
    await partner.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone
      }
    });
  } catch (error) {
    console.error('Error updating delivery partner profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update delivery partner availability
// @route   PUT /api/delivery-partners/availability
// @access  Private/DeliveryPartner
export const updateAvailability = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByPk(req.user.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner not found'
      });
    }

    const { isAvailable } = req.body;

    if (isAvailable !== undefined) {
      partner.isAvailable = isAvailable;
      await partner.save();

      res.status(200).json({
        success: true,
        message: `You are now ${isAvailable ? 'available' : 'unavailable'} for deliveries`,
        data: {
          isAvailable: partner.isAvailable
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'isAvailable field is required'
      });
    }
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update delivery partner location
// @route   PUT /api/delivery-partners/location
// @access  Private/DeliveryPartner
export const updateLocation = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByPk(req.user.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Delivery partner not found'
      });
    }

    const { currentLocation } = req.body;

    if (currentLocation) {
      partner.currentLocation = currentLocation;
      await partner.save();

      res.status(200).json({
        success: true,
        message: 'Location updated successfully',
        data: {
          currentLocation: partner.currentLocation
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'currentLocation field is required'
      });
    }
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get delivery partner stats
// @route   GET /api/delivery-partners/stats
// @access  Private/DeliveryPartner
export const getDeliveryPartnerStats = async (req, res) => {
  try {
    // Get total deliveries
    const totalDeliveries = await Order.count({
      where: { deliveryPartnerId: req.user.id }
    });

    // Get pending deliveries
    const pendingDeliveries = await Order.count({
      where: {
        deliveryPartnerId: req.user.id,
        status: {
          [Op.in]: ['confirmed', 'out_for_delivery', 'return_initiated', 'return_in_transit']
        }
      }
    });

    // Get completed deliveries
    const completedDeliveries = await Order.count({
      where: {
        deliveryPartnerId: req.user.id,
        status: {
          [Op.in]: ['delivered', 'returned', 'completed']
        }
      }
    });

    // Calculate total earnings (assuming there's a delivery fee per order)
    const totalEarnings = await Order.sum('deliveryFee', {
      where: {
        deliveryPartnerId: req.user.id,
        status: {
          [Op.in]: ['delivered', 'returned', 'completed']
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalDeliveries,
        pendingDeliveries,
        completedDeliveries,
        totalEarnings: totalEarnings || 0
      }
    });
  } catch (error) {
    console.error('Error getting delivery partner stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get new orders available for delivery
// @route   GET /api/delivery-partners/orders/new
// @access  Private/DeliveryPartner
export const getNewOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        deliveryPartnerId: null,
        status: 'confirmed'
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error getting new orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get active orders assigned to delivery partner
// @route   GET /api/delivery-partners/orders/active
// @access  Private/DeliveryPartner
export const getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        deliveryPartnerId: req.user.id,
        status: {
          [Op.in]: ['confirmed', 'out_for_delivery']
        }
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error getting active orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get completed orders by delivery partner
// @route   GET /api/delivery-partners/orders/completed
// @access  Private/DeliveryPartner
export const getCompletedOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        deliveryPartnerId: req.user.id,
        status: {
          [Op.in]: ['delivered', 'completed']
        }
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'phone']
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit: 50
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error getting completed orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get return orders assigned to delivery partner
// @route   GET /api/delivery-partners/orders/returns
// @access  Private/DeliveryPartner
export const getReturnOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        deliveryPartnerId: req.user.id,
        status: {
          [Op.in]: ['return_initiated', 'return_in_transit']
        }
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'phone']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error getting return orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get order details
// @route   GET /api/delivery-partners/orders/:id
// @access  Private/DeliveryPartner
export const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'phone', 'email']
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'images']
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is assigned to this delivery partner or is available for pickup
    if (order.deliveryPartnerId !== req.user.id && order.status !== 'confirmed') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error getting order details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Accept an order for delivery
// @route   POST /api/delivery-partners/orders/:id/accept
// @access  Private/DeliveryPartner
export const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is available for pickup
    if (order.status !== 'confirmed' || order.deliveryPartnerId) {
      return res.status(400).json({
        success: false,
        message: 'Order is not available for pickup'
      });
    }

    // Check if delivery partner is available
    const partner = await DeliveryPartner.findByPk(req.user.id);
    if (!partner.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'You are currently marked as unavailable. Please update your availability status.'
      });
    }

    // Assign order to delivery partner
    order.deliveryPartnerId = req.user.id;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order accepted successfully',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber
      }
    });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/delivery-partners/orders/:id/status
// @access  Private/DeliveryPartner
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is assigned to this delivery partner
    if (order.deliveryPartnerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this order'
      });
    }

    // Validate status transition
    const validTransitions = {
      confirmed: ['out_for_delivery'],
      out_for_delivery: ['delivered'],
      return_initiated: ['return_in_transit'],
      return_in_transit: ['returned']
    };

    if (!validTransitions[order.status] || !validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.status} to ${status}`
      });
    }

    // Update order status
    order.status = status;

    // Set delivery date if delivered
    if (status === 'delivered') {
      order.deliveryDate = new Date();
    }

    // Set return date if returned
    if (status === 'returned') {
      order.returnDate = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Initiate delivery partner registration and send OTPs
// @route   POST /api/delivery-partners/initiate-register
// @access  Public
export const initiateDeliveryPartnerRegistration = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      address,
      city,
      state,
      pincode,
      vehicleType,
      vehicleNumber,
      drivingLicenseNumber
    } = req.body;

    // Check if delivery partner already exists
    const partnerExists = await DeliveryPartner.findOne({ email });
    if (partnerExists) {
      return res.status(400).json({
        success: false,
        message: 'Delivery partner with this email already exists'
      });
    }

    // Check if phone is already registered
    const phoneExists = await DeliveryPartner.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already registered'
      });
    }

    // Create temporary user record
    const tempUserId = new mongoose.Types.ObjectId();
    
    // Store registration data in temporary storage
    const registrationData = {
      _id: tempUserId,
      name,
      email,
      phone,
      password,
      address,
      city,
      state,
      pincode,
      vehicleType,
      vehicleNumber,
      drivingLicenseNumber,
      phoneVerified: false,
      emailVerified: false,
      createdAt: new Date()
    };
    
    // Store in temporary collection or cache
    await TempDeliveryPartner.create(registrationData);
    
    // Generate and send OTPs
    const phoneOTP = generateOTP();
    const emailOTP = generateEmailOTP();
    
    // Store OTPs with expiry
    await TempDeliveryPartner.findByIdAndUpdate(tempUserId, {
      phoneOTP,
      phoneOTPExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      emailOTP,
      emailOTPExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    
    // Send OTPs
    await sendOTP(phone, phoneOTP);
    await sendEmailOTP(email, emailOTP);
    
    res.status(200).json({
      success: true,
      message: 'OTPs sent successfully. Please verify your phone and email.',
      data: {
        tempUserId
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

// @desc    Verify phone OTP for delivery partner
// @route   POST /api/delivery-partners/verify-phone-otp
// @access  Public
export const verifyDeliveryPartnerPhoneOTP = async (req, res) => {
  try {
    const { phone, otp, tempUserId } = req.body;
    
    if (!phone || !otp || !tempUserId) {
      return res.status(400).json({
        success: false,
        message: 'Phone, OTP, and tempUserId are required'
      });
    }
    
    // Find temporary user record
    const tempUser = await TempDeliveryPartner.findById(tempUserId);
    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: 'Registration session expired or not found'
      });
    }
    
    // Verify OTP
    if (tempUser.phoneOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }
    
    // Check if OTP is expired
    if (new Date() > tempUser.phoneOTPExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }
    
    // Mark phone as verified
    await TempDeliveryPartner.findByIdAndUpdate(tempUserId, {
      phoneVerified: true
    });
    
    // Check if email is also verified
    const updatedUser = await TempDeliveryPartner.findById(tempUserId);
    
    res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
      data: {
        phoneVerified: true,
        emailVerified: updatedUser.emailVerified,
        tempUserId
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

// @desc    Verify email OTP for delivery partner
// @route   POST /api/delivery-partners/verify-email-otp
// @access  Public
export const verifyDeliveryPartnerEmailOTP = async (req, res) => {
  try {
    const { email, otp, tempUserId } = req.body;
    
    if (!email || !otp || !tempUserId) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and tempUserId are required'
      });
    }
    
    // Find temporary user record
    const tempUser = await TempDeliveryPartner.findById(tempUserId);
    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: 'Registration session expired or not found'
      });
    }
    
    // Verify OTP
    if (tempUser.emailOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }
    
    // Check if OTP is expired
    if (new Date() > tempUser.emailOTPExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }
    
    // Mark email as verified
    await TempDeliveryPartner.findByIdAndUpdate(tempUserId, {
      emailVerified: true
    });
    
    // Check if phone is also verified
    const updatedUser = await TempDeliveryPartner.findById(tempUserId);
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        phoneVerified: updatedUser.phoneVerified,
        emailVerified: true,
        tempUserId
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

// @desc    Complete delivery partner registration after verification
// @route   POST /api/delivery-partners/complete-register
// @access  Public
export const completeDeliveryPartnerRegistration = async (req, res) => {
  try {
    const { tempUserId } = req.body;
    
    if (!tempUserId) {
      return res.status(400).json({
        success: false,
        message: 'tempUserId is required'
      });
    }
    
    // Find temporary user record
    const tempUser = await TempDeliveryPartner.findById(tempUserId);
    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: 'Registration session expired or not found'
      });
    }
    
    // Check if both phone and email are verified
    if (!tempUser.phoneVerified || !tempUser.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Both phone and email must be verified to complete registration'
      });
    }
    
    // Handle file uploads
    let drivingLicenseImageUrl = null;
    let vehicleImageUrl = null;

    if (req.files) {
      // Upload driving license image if provided
      if (req.files.drivingLicenseImage) {
        const drivingLicenseImageResult = await uploadToCloudinary(
          req.files.drivingLicenseImage[0].path,
          'delivery-partners/licenses'
        );
        
        if (drivingLicenseImageResult.success) {
          drivingLicenseImageUrl = drivingLicenseImageResult.url;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Failed to upload driving license image',
            error: drivingLicenseImageResult.error
          });
        }
      }
      
      // Upload vehicle image if provided
      if (req.files.vehicleImage) {
        const vehicleImageResult = await uploadToCloudinary(
          req.files.vehicleImage[0].path,
          'delivery-partners/vehicles'
        );
        
        if (vehicleImageResult.success) {
          vehicleImageUrl = vehicleImageResult.url;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Failed to upload vehicle image',
            error: vehicleImageResult.error
          });
        }
      }
    }
    
    // Create delivery partner
    const partner = await DeliveryPartner.create({
      name: tempUser.name,
      email: tempUser.email,
      phone: tempUser.phone,
      password: tempUser.password,
      address: tempUser.address,
      city: tempUser.city,
      state: tempUser.state,
      pincode: tempUser.pincode,
      vehicleType: tempUser.vehicleType,
      vehicleNumber: tempUser.vehicleNumber,
      drivingLicenseNumber: tempUser.drivingLicenseNumber,
      drivingLicenseImage: drivingLicenseImageUrl,
      vehicleImage: vehicleImageUrl,
      isVerified: true // Both phone and email are verified
    });
    
    if (partner) {
      // Delete temporary user record
      await TempDeliveryPartner.findByIdAndDelete(tempUserId);
      
      res.status(201).json({
        success: true,
        message: 'Delivery partner registered successfully',
        data: {
          id: partner._id,
          name: partner.name,
          email: partner.email,
          phone: partner.phone
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid delivery partner data'
      });
    }
  } catch (error) {
    console.error('Error completing registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send OTP to phone for delivery partner
// @route   POST /api/delivery-partners/send-otp
// @access  Public
export const sendDeliveryPartnerOTP = async (req, res) => {
  try {
    const { phone, tempUserId } = req.body;
    
    if (!phone || !tempUserId) {
      return res.status(400).json({
        success: false,
        message: 'Phone and tempUserId are required'
      });
    }
    
    // Find temporary user record
    const tempUser = await TempDeliveryPartner.findById(tempUserId);
    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: 'Registration session expired or not found'
      });
    }
    
    // Generate new OTP
    const phoneOTP = generateOTP();
    
    // Update OTP and expiry
    await TempDeliveryPartner.findByIdAndUpdate(tempUserId, {
      phoneOTP,
      phoneOTPExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    
    // Send OTP
    await sendOTP(phone, phoneOTP);
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
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

// @desc    Send email OTP for delivery partner
// @route   POST /api/delivery-partners/send-email-otp
// @access  Public
export const sendDeliveryPartnerEmailOTP = async (req, res) => {
  try {
    const { email, tempUserId } = req.body;
    
    if (!email || !tempUserId) {
      return res.status(400).json({
        success: false,
        message: 'Email and tempUserId are required'
      });
    }
    
    // Find temporary user record
    const tempUser = await TempDeliveryPartner.findById(tempUserId);
    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: 'Registration session expired or not found'
      });
    }
    
    // Generate new OTP
    const emailOTP = generateEmailOTP();
    
    // Update OTP and expiry
    await TempDeliveryPartner.findByIdAndUpdate(tempUserId, {
      emailOTP,
      emailOTPExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    
    // Send OTP
    await sendEmailOTP(email, emailOTP);
    
    res.status(200).json({
      success: true,
      message: 'Email OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending email OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
