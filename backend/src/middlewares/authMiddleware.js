import jwt from 'jsonwebtoken';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');

      // Set user type based on token
      req.userType = decoded.type || 'user';

      // For now, just set a basic user object
      req.user = { id: decoded.id, type: req.userType };

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
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

// Admin middleware
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

// Seller middleware
export const seller = (req, res, next) => {
  if (req.userType === 'seller') {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authorized as a seller'
    });
  }
};

// Retailer middleware
export const retailer = (req, res, next) => {
  if (req.userType === 'retailer') {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authorized as a retailer'
    });
  }
};

// Delivery partner middleware
export const deliveryPartner = (req, res, next) => {
  if (req.userType === 'deliveryPartner') {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authorized as a delivery partner'
    });
  }
};

export default { protect, admin, seller, retailer, deliveryPartner };