import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Retailer from '../models/Retailer.js';
import DeliveryPartner from '../models/DeliveryPartner.js';

// Middleware to protect routes
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
        error: error.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Authorize roles middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
};

// Middleware to check if user is admin
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authorized as an admin'
    });
  }
};

// Middleware to check if user is a retailer
export const retailer = (req, res, next) => {
  if (req.user && req.user.role === 'retailer') {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authorized as a retailer'
    });
  }
};

// Middleware to check if user is a delivery partner
export const deliveryPartner = (req, res, next) => {
  if (req.user && req.user.role === 'deliveryPartner') {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authorized as a delivery partner'
    });
  }
};

// Middleware to verify Clerk token
export const verifyClerkToken = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // For Clerk tokens, we'll need to verify with their API
      // This is a simplified version - in production, you'd use Clerk's SDK
      // to verify the token properly
      
      // For now, we'll just set the clerkId in the request
      req.clerkId = token;
      
      // Find user by clerkId or create a new one
      let user = await User.findOne({ clerkId: token });
      
      if (!user) {
        // Create a new user with Clerk ID
        user = await User.create({
          clerkId: token,
          name: req.body.name || 'Clerk User',
          email: req.body.email || '',
          isVerified: true
        });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error('Clerk auth error:', error);
      res.status(401).json({
        success: false,
        message: 'Not authorized, Clerk token failed'
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
}; 