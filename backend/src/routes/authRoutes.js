const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-phone-otp', authController.sendPhoneOTP);
router.post('/send-email-otp', authController.sendEmailOTP);
router.post('/verify-phone-otp', authController.verifyPhoneOTP);
router.post('/verify-email-otp', authController.verifyEmailOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes (require authentication)
router.get('/me', protect, authController.getCurrentUser);
router.put('/update-profile', protect, authController.updateProfile);

module.exports = router; 