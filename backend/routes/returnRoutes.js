const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const {
  scheduleReturn,
  getUserReturns,
  getPendingReturns,
  getCompletedReturns,
  assignReturn,
  updateReturnStatus,
  submitInspection,
  completeReturn
} = require('../controllers/returnController');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `return_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Customer routes
router.post('/schedule', protect, scheduleReturn);
router.get('/user', protect, getUserReturns);

// Delivery partner routes
router.get('/pending', protect, authorize('deliveryPartner'), getPendingReturns);
router.get('/completed', protect, authorize('deliveryPartner'), getCompletedReturns);
router.put('/:returnId/assign', protect, authorize('deliveryPartner'), assignReturn);
router.put('/:returnId/status', protect, authorize('deliveryPartner'), updateReturnStatus);
router.post('/:returnId/inspection', protect, authorize('deliveryPartner'), upload.array('images', 5), submitInspection);
router.put('/:returnId/complete', protect, authorize('deliveryPartner'), completeReturn);

module.exports = router; 