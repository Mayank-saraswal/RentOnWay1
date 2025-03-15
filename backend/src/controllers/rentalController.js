import Rental from '../models/Rental.js';
import Product from '../models/Product.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new rental
export const createRental = async (req, res) => {
  try {
    const { 
      productId, 
      startDate, 
      endDate, 
      totalDays, 
      rentalPrice, 
      securityDeposit, 
      totalAmount, 
      paymentId 
    } = req.body;
    
    const userId = req.user.id;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Generate a unique rental ID
    const rentalId = `RENT-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Create a new rental
    const rental = new Rental({
      user: userId,
      product: productId,
      startDate,
      endDate,
      totalDays,
      rentalPrice,
      securityDeposit,
      totalAmount,
      paymentId,
      rentalId
    });
    
    await rental.save();
    
    res.status(201).json({
      success: true,
      message: 'Rental created successfully',
      data: rental
    });
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all rentals for a user
export const getUserRentals = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const rentals = await Rental.find({ user: userId })
      .populate('product')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    console.error('Error getting user rentals:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get a single rental by ID
export const getRentalById = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const userId = req.user.id;
    
    const rental = await Rental.findById(rentalId).populate('product');
    
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }
    
    // Check if rental belongs to the user
    if (rental.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    res.status(200).json({
      success: true,
      data: rental
    });
  } catch (error) {
    console.error('Error getting rental:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Cancel a rental
export const cancelRental = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const userId = req.user.id;
    
    const rental = await Rental.findById(rentalId);
    
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }
    
    // Check if rental belongs to the user
    if (rental.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Check if rental can be cancelled
    if (rental.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Rental cannot be cancelled' });
    }
    
    // Update rental status
    rental.status = 'cancelled';
    await rental.save();
    
    res.status(200).json({
      success: true,
      message: 'Rental cancelled successfully',
      data: rental
    });
  } catch (error) {
    console.error('Error cancelling rental:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get active rentals for a user
export const getActiveRentals = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const rentals = await Rental.find({ 
      user: userId,
      status: { $in: ['active', 'return_scheduled'] }
    })
      .populate('product')
      .sort({ endDate: 1 });
    
    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    console.error('Error getting active rentals:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get completed rentals for a user
export const getCompletedRentals = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const rentals = await Rental.find({ 
      user: userId,
      status: { $in: ['completed', 'returned'] }
    })
      .populate('product')
      .sort({ endDate: -1 });
    
    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    console.error('Error getting completed rentals:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 