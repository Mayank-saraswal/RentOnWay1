const axios = require('axios');

/**
 * Send SMS using Fast2SMS API
 * @param {string} phone - Phone number to send SMS to (E.164 format)
 * @param {string} message - Message to send
 * @returns {Promise<Object>} - Response from Fast2SMS API
 */
exports.sendSMS = async (phone, message) => {
  try {
    // Remove the '+' and country code from the phone number
    // Fast2SMS requires 10-digit Indian mobile numbers without country code
    const mobileNumber = phone.replace(/^\+91/, '');
    
    // Fast2SMS API endpoint
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    
    // Request headers
    const headers = {
      'authorization': process.env.FAST2SMS_API_KEY,
      'Content-Type': 'application/json'
    };
    
    // Request body
    const data = {
      route: 'otp',
      variables_values: message,
      numbers: mobileNumber
    };
    
    // Make API request
    const response = await axios.post(url, data, { headers });
    
    // Log response for debugging
    console.log('Fast2SMS API response:', response.data);
    
    // Check if SMS was sent successfully
    if (response.data.return === true) {
      return {
        success: true,
        message: 'SMS sent successfully',
        data: response.data
      };
    } else {
      throw new Error(response.data.message || 'Failed to send SMS');
    }
  } catch (error) {
    console.error('SMS service error:', error);
    
    // For development/testing, log success even if API fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Simulating SMS success');
      return {
        success: true,
        message: 'SMS sent successfully (simulated in development)',
        data: { request_id: 'dev-' + Date.now() }
      };
    }
    
    throw new Error(error.message || 'Failed to send SMS');
  }
}; 