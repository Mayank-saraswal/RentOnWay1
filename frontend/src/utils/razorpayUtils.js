/**
 * Load Razorpay script dynamically
 * @returns {Promise} Promise that resolves when script is loaded
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Open Razorpay payment modal
 * @param {Object} options - Razorpay options
 * @returns {Promise} Promise that resolves with payment details on success
 */
export const openRazorpayCheckout = (options) => {
  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay(options);
    
    razorpay.on('payment.success', (response) => {
      resolve(response);
    });
    
    razorpay.on('payment.error', (error) => {
      reject(error);
    });
    
    razorpay.open();
  });
};

/**
 * Create Razorpay payment options
 * @param {Object} data - Payment data
 * @param {Object} user - User data
 * @returns {Object} Razorpay options
 */
export const createRazorpayOptions = (data, user) => {
  return {
    key: data.keyId,
    amount: data.amount,
    currency: data.currency,
    name: 'RentOnWay',
    description: 'Payment for your order',
    order_id: data.orderId,
    prefill: {
      name: user?.name || '',
      email: user?.email || '',
      contact: user?.phone || ''
    },
    notes: {
      address: 'RentOnWay Corporate Office'
    },
    theme: {
      color: '#3399cc'
    }
  };
}; 