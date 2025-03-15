import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Create a payment order with Razorpay
 * @param {number} amount - Amount in smallest currency unit (e.g., paise for INR)
 * @param {string} currency - Currency code (e.g., 'INR')
 * @param {string} receipt - Receipt ID (optional)
 * @param {object} notes - Additional notes (optional)
 * @returns {Promise} Razorpay order
 */
const createOrder = async (amount, currency = 'INR', receipt = null, notes = {}) => {
  try {
    const options = {
      amount,
      currency,
      notes
    };
    
    if (receipt) {
      options.receipt = receipt;
    }
    
    const order = await razorpay.orders.create(options);
    
    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      order
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} Whether signature is valid
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    
    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
};

/**
 * Fetch payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise} Payment details
 */
const fetchPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    
    return {
      success: true,
      payment
    };
  } catch (error) {
    console.error('Error fetching payment:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Create a refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund (optional, defaults to full amount)
 * @returns {Promise} Refund result
 */
const createRefund = async (paymentId, amount = null) => {
  try {
    const refundParams = {};
    
    if (amount) {
      refundParams.amount = amount;
    }
    
    const refund = await razorpay.payments.refund(paymentId, refundParams);
    
    return {
      success: true,
      refundId: refund.id,
      status: refund.status
    };
  } catch (error) {
    console.error('Error creating refund:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

export {
  createOrder,
  verifyPaymentSignature,
  fetchPayment,
  createRefund
}; 