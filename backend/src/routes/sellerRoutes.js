import express from 'express'; 
import { protect, seller } from '../middlewares/authMiddleware.js'; 
 
const router = express.Router(); 
 
// Basic route for testing 
 
router.get('/test', (req, res) => {
  res.json({ message: 'Seller routes working' });
}); 

export default router; 
