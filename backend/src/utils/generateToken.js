import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for authentication
 * @param {string} id - User ID
 * @param {string} type - User type (user, retailer, deliveryPartner)
 * @param {string} clerkId - Clerk user ID (optional)
 * @returns {string} JWT token
 */
const generateToken = (id, type = 'user', clerkId = null) => {
  const payload = { id, type };
  
  // Add Clerk ID to payload if provided
  if (clerkId) {
    payload.clerkId = clerkId;
  }
  
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET || 'your_jwt_secret_key_here', 
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

export default generateToken; 