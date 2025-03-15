import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Basic route for testing
router.get('/test', (req, res) => {
  res.json({ message: 'Product routes working' });
});

export default router;