import express from 'express'; 
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  verifyPhoneOTP,
  verifyUserEmailOTP,
  handleClerkAuth,
  handleAppwriteAuth,
  handleFirebaseAuth
} from '../controllers/userController.js'; 
import { protect } from '../middlewares/auth.js'; 
 
const router = express.Router(); 
 
// Public routes 
router.post('/register', registerUser); 
router.post('/login', loginUser); 
router.post('/verify-phone-otp', verifyPhoneOTP);
router.post('/verify-email-otp', verifyUserEmailOTP);
router.post('/clerk-auth', handleClerkAuth);
router.post('/appwrite-auth', handleAppwriteAuth);
router.post('/firebase-auth', handleFirebaseAuth);
 
// Protected routes 
router.get('/profile', protect, getUserProfile); 
 
// Basic route for testing 
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working' }); 
}); 
 
export default router; 
