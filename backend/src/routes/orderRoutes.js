import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Basic route for testing
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes working' });
});

export default router;
