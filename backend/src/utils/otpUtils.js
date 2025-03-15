import axios from 'axios';

// Store OTPs temporarily (in a real app, use Redis or database)
const otpStore = new Map();

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Format phone number for Fast2SMS
 * @param {string} phone - Phone number with or without country code
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (phone) => {
  // Remove any non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // Remove country code if present (e.g., +91, 91)
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.substring(2);
  } else if (digits.length > 10) {
    digits = digits.substring(digits.length - 10);
  }
  
  return digits;
};

/**
 * Send OTP via Fast2SMS
 * @param {string} phone - Phone number
 * @param {string} otp - OTP to send
 * @returns {Promise} Fast2SMS response
 */
const sendOTP = async (phone, otp) => {
  try {
    console.log(`Attempting to send OTP to ${phone}`);
    
    // Format phone number for Fast2SMS
    const formattedPhone = formatPhoneNumber(phone);
    
    // Store OTP with 10 minute expiry
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });
    
    // For testing in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV MODE] Simulating OTP send to ${formattedPhone}: ${otp}`);
      return {
        success: true,
        message: 'OTP logged (Development mode)',
        requestId: 'DEV_MODE'
      };
    }
    
    // Fast2SMS API configuration
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      console.error('Fast2SMS API key not configured');
      return {
        success: false,
        message: 'Fast2SMS API key not configured'
      };
    }
    
    // Send OTP via Fast2SMS API
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'otp',
        variables_values: otp,
        numbers: formattedPhone,
      },
      {
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Fast2SMS API Response:', response.data);
    
    if (response.data.return === true) {
      console.log(`OTP sent successfully to ${formattedPhone}`);
      return {
        success: true,
        message: 'OTP sent successfully',
        requestId: response.data.request_id
      };
    } else {
      console.error(`Failed to send OTP: ${response.data.message}`);
      return {
        success: false,
        message: response.data.message
      };
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Store OTP anyway for testing purposes
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });
    
    return {
      success: false,
      message: error.message || 'Failed to send OTP'
    };
  }
};

/**
 * Verify OTP against stored OTP
 * @param {string} phone - Phone number
 * @param {string} userOTP - OTP entered by user
 * @returns {boolean} Whether OTP is valid
 */
const verifyOTP = (phone, userOTP) => {
  console.log(`Verifying OTP for ${phone}. User entered: ${userOTP}`);
  
  const storedData = otpStore.get(phone);
  
  if (!storedData) {
    console.log(`No OTP found for ${phone}`);
    return false;
  }
  
  if (Date.now() > storedData.expiresAt) {
    console.log(`OTP expired for ${phone}`);
    otpStore.delete(phone);
    return false;
  }
  
  console.log(`Stored OTP for ${phone}: ${storedData.otp}`);
  
  // Check if OTP matches
  const isValid = userOTP === storedData.otp;
  
  // If valid, remove from store
  if (isValid) {
    console.log(`OTP verification successful for ${phone}`);
    otpStore.delete(phone);
  } else {
    console.log(`OTP verification failed for ${phone}`);
  }
  
  return isValid;
};

export {
  generateOTP,
  sendOTP,
  verifyOTP
}; 