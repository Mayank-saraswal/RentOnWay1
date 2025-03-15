const Return = require('../models/Return');
const Rental = require('../models/Rental');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('../utils/cloudinary');

// Schedule a return pickup
exports.scheduleReturn = async (req, res) => {
  try {
    const { rentalId, pickupDate, timeSlot, additionalNotes } = req.body;
    const userId = req.user.id;

    // Find the rental
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    // Check if rental belongs to the user
    if (rental.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Check if return already exists for this rental
    const existingReturn = await Return.findOne({ rental: rentalId });
    if (existingReturn) {
      return res.status(400).json({ success: false, message: 'Return already scheduled for this rental' });
    }

    // Generate a unique return ID
    const returnId = `RET-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create a new return
    const newReturn = new Return({
      rental: rentalId,
      user: userId,
      product: rental.product,
      pickupDate,
      timeSlot,
      additionalNotes,
      returnId
    });

    await newReturn.save();

    // Update rental status
    rental.status = 'return_scheduled';
    await rental.save();

    res.status(201).json({
      success: true,
      message: 'Return scheduled successfully',
      data: {
        returnId: newReturn.returnId,
        pickupDate: newReturn.pickupDate,
        timeSlot: newReturn.timeSlot
      }
    });
  } catch (error) {
    console.error('Error scheduling return:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get returns for a user
exports.getUserReturns = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const returns = await Return.find({ user: userId })
      .populate('product')
      .populate('rental')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: returns.length,
      data: returns
    });
  } catch (error) {
    console.error('Error getting user returns:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get pending returns for delivery partners
exports.getPendingReturns = async (req, res) => {
  try {
    // Get returns that are scheduled but not assigned or assigned to this delivery partner
    const returns = await Return.find({
      $or: [
        { deliveryPartner: { $exists: false } },
        { deliveryPartner: req.user.id }
      ],
      status: 'scheduled'
    })
      .populate('product')
      .populate('user', 'name email phone address')
      .populate('rental')
      .sort({ pickupDate: 1 });
    
    res.status(200).json({
      success: true,
      count: returns.length,
      data: returns
    });
  } catch (error) {
    console.error('Error getting pending returns:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get completed returns for delivery partners
exports.getCompletedReturns = async (req, res) => {
  try {
    const deliveryPartnerId = req.user.id;
    
    const returns = await Return.find({
      deliveryPartner: deliveryPartnerId,
      status: { $in: ['picked_up', 'inspected', 'completed'] }
    })
      .populate('product')
      .populate('user', 'name email phone address')
      .populate('rental')
      .sort({ updatedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: returns.length,
      data: returns
    });
  } catch (error) {
    console.error('Error getting completed returns:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Assign return to delivery partner
exports.assignReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const deliveryPartnerId = req.user.id;
    
    const returnItem = await Return.findById(returnId);
    if (!returnItem) {
      return res.status(404).json({ success: false, message: 'Return not found' });
    }
    
    // Check if return is already assigned
    if (returnItem.deliveryPartner && returnItem.deliveryPartner.toString() !== deliveryPartnerId) {
      return res.status(400).json({ success: false, message: 'Return already assigned to another delivery partner' });
    }
    
    returnItem.deliveryPartner = deliveryPartnerId;
    await returnItem.save();
    
    res.status(200).json({
      success: true,
      message: 'Return assigned successfully',
      data: returnItem
    });
  } catch (error) {
    console.error('Error assigning return:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update return status to picked up
exports.updateReturnStatus = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { status } = req.body;
    const deliveryPartnerId = req.user.id;
    
    const returnItem = await Return.findById(returnId);
    if (!returnItem) {
      return res.status(404).json({ success: false, message: 'Return not found' });
    }
    
    // Check if return is assigned to this delivery partner
    if (returnItem.deliveryPartner.toString() !== deliveryPartnerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Update status
    returnItem.status = status;
    await returnItem.save();
    
    // If status is picked_up, update rental status
    if (status === 'picked_up') {
      const rental = await Rental.findById(returnItem.rental);
      if (rental) {
        rental.status = 'returned';
        await rental.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Return status updated successfully',
      data: returnItem
    });
  } catch (error) {
    console.error('Error updating return status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Submit inspection for a return
exports.submitInspection = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { condition, qualityIssues, comments } = req.body;
    const deliveryPartnerId = req.user.id;
    
    const returnItem = await Return.findById(returnId);
    if (!returnItem) {
      return res.status(404).json({ success: false, message: 'Return not found' });
    }
    
    // Check if return is assigned to this delivery partner
    if (returnItem.deliveryPartner.toString() !== deliveryPartnerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Handle image uploads
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'returns',
          width: 800,
          crop: 'scale'
        });
        imageUrls.push(result.secure_url);
      }
    }
    
    // Update inspection details
    returnItem.inspection = {
      condition,
      qualityIssues,
      comments,
      images: imageUrls,
      inspectedAt: Date.now()
    };
    
    returnItem.status = 'inspected';
    await returnItem.save();
    
    res.status(200).json({
      success: true,
      message: 'Inspection submitted successfully',
      data: returnItem
    });
  } catch (error) {
    console.error('Error submitting inspection:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Complete a return
exports.completeReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const deliveryPartnerId = req.user.id;
    
    const returnItem = await Return.findById(returnId);
    if (!returnItem) {
      return res.status(404).json({ success: false, message: 'Return not found' });
    }
    
    // Check if return is assigned to this delivery partner
    if (returnItem.deliveryPartner.toString() !== deliveryPartnerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Check if inspection is completed
    if (!returnItem.inspection || !returnItem.inspection.condition) {
      return res.status(400).json({ success: false, message: 'Inspection must be completed before finalizing return' });
    }
    
    // Update status
    returnItem.status = 'completed';
    await returnItem.save();
    
    // Update rental status
    const rental = await Rental.findById(returnItem.rental);
    if (rental) {
      rental.status = 'completed';
      await rental.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Return completed successfully',
      data: returnItem
    });
  } catch (error) {
    console.error('Error completing return:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 