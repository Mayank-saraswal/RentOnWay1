import jwt from 'jsonwebtoken';
import { Retailer, Product, Order } from '../models/index.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id, type: 'retailer' }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new retailer
// @route   POST /api/retailers/register
// @access  Public
export const registerRetailer = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      email,
      phone,
      password,
      businessAddress,
      city,
      state,
      pincode,
      gstNumber,
      panNumber
    } = req.body;

    // Check if retailer already exists
    const retailerExists = await Retailer.findOne({ where: { email } });
    if (retailerExists) {
      return res.status(400).json({
        success: false,
        message: 'Retailer with this email already exists'
      });
    }

    // Create retailer
    const retailer = await Retailer.create({
      businessName,
      ownerName,
      email,
      phone,
      password,
      businessAddress,
      city,
      state,
      pincode,
      gstNumber,
      panNumber
    });

    if (retailer) {
      res.status(201).json({
        success: true,
        message: 'Retailer registered successfully',
        data: {
          id: retailer.id,
          businessName: retailer.businessName,
          email: retailer.email,
          token: generateToken(retailer.id)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid retailer data'
      });
    }
  } catch (error) {
    console.error('Error registering retailer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login retailer
// @route   POST /api/retailers/login
// @access  Public
export const loginRetailer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find retailer by email
    const retailer = await Retailer.findOne({ where: { email } });

    // Check if retailer exists and password matches
    if (retailer && (await retailer.matchPassword(password))) {
      // Update last login
      retailer.lastLogin = new Date();
      await retailer.save();

      res.status(200).json({
        success: true,
        data: {
          id: retailer.id,
          businessName: retailer.businessName,
          email: retailer.email,
          isVerified: retailer.isVerified,
          isActive: retailer.isActive
        },
        token: generateToken(retailer.id)
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Error logging in retailer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get retailer profile
// @route   GET /api/retailers/profile
// @access  Private/Retailer
export const getRetailerProfile = async (req, res) => {
  try {
    const retailer = await Retailer.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (retailer) {
      res.status(200).json({
        success: true,
        data: retailer
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Retailer not found'
      });
    }
  } catch (error) {
    console.error('Error getting retailer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update retailer profile
// @route   PUT /api/retailers/profile
// @access  Private/Retailer
export const updateRetailerProfile = async (req, res) => {
  try {
    const retailer = await Retailer.findByPk(req.user.id);

    if (!retailer) {
      return res.status(404).json({
        success: false,
        message: 'Retailer not found'
      });
    }

    // Update fields
    const {
      businessName,
      ownerName,
      phone,
      businessAddress,
      city,
      state,
      pincode,
      gstNumber,
      panNumber,
      bankAccountNumber,
      bankName,
      ifscCode
    } = req.body;

    if (businessName) retailer.businessName = businessName;
    if (ownerName) retailer.ownerName = ownerName;
    if (phone) retailer.phone = phone;
    if (businessAddress) retailer.businessAddress = businessAddress;
    if (city) retailer.city = city;
    if (state) retailer.state = state;
    if (pincode) retailer.pincode = pincode;
    if (gstNumber) retailer.gstNumber = gstNumber;
    if (panNumber) retailer.panNumber = panNumber;
    if (bankAccountNumber) retailer.bankAccountNumber = bankAccountNumber;
    if (bankName) retailer.bankName = bankName;
    if (ifscCode) retailer.ifscCode = ifscCode;

    // Save updated retailer
    await retailer.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: retailer.id,
        businessName: retailer.businessName,
        email: retailer.email,
        phone: retailer.phone
      }
    });
  } catch (error) {
    console.error('Error updating retailer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get retailer stats
// @route   GET /api/retailers/stats
// @access  Private/Retailer
export const getRetailerStats = async (req, res) => {
  try {
    // Get total products
    const totalProducts = await Product.count({
      where: { retailerId: req.user.id }
    });

    // Get approved products
    const approvedProducts = await Product.count({
      where: { retailerId: req.user.id, isApproved: true }
    });

    // Get pending products
    const pendingProducts = await Product.count({
      where: { retailerId: req.user.id, isApproved: false }
    });

    // Get total orders
    const totalOrders = await Order.count({
      include: [
        {
          model: Product,
          where: { retailerId: req.user.id }
        }
      ]
    });

    // Get total revenue
    const revenue = await Order.sum('totalAmount', {
      include: [
        {
          model: Product,
          where: { retailerId: req.user.id }
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        approvedProducts,
        pendingProducts,
        totalOrders,
        revenue: revenue || 0
      }
    });
  } catch (error) {
    console.error('Error getting retailer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 