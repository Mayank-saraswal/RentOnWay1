import { createOrder, verifyPaymentSignature, fetchPayment, createRefund } from '../utils/razorpayUtils.js';
import { Order } from '../models/index.js';

/**
 * Create a Razorpay order
 * @route POST /api/payments/create-order
 * @access Private
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    // Amount should be in paise (e.g., Rs. 100 = 10000 paise)
    const amountInPaise = Math.round(amount * 100);
    
    const result = await createOrder(amountInPaise, currency || 'INR', receipt, notes);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        orderId: result.orderId,
        amount: result.amount,
        currency: result.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Verify Razorpay payment
 * @route POST /api/payments/verify
 * @access Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, orderId: orderDbId } = req.body;
    
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Missing required parameters'
      });
    }
    
    // Verify signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid signature'
      });
    }
    
    // Fetch payment details
    const paymentResult = await fetchPayment(paymentId);
    
    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Could not fetch payment details'
      });
    }
    
    // Update order if orderDbId is provided
    if (orderDbId) {
      const order = await Order.findById(orderDbId);
      
      if (order) {
        order.paymentStatus = 'paid';
        order.paymentId = paymentId;
        await order.save();
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId,
        status: paymentResult.payment.status
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Process refund
 * @route POST /api/payments/refund
 * @access Private
 */
export const processRefund = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;
    
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }
    
    const result = await createRefund(paymentId, amount);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: result.refundId,
        status: result.status
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 