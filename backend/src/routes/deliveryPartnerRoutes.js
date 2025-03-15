

import express from 'express';
import { protect, deliveryPartner } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Basic route for testing
router.get('/test', (req, res) => {
  res.json({ message: 'Delivery Partner routes working' });
});

// Add other routes here...

export default router;
