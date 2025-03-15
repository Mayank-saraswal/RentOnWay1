/**
 * Generate a random OTP of specified length
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Generated OTP
 */
exports.generateOTP = (length = 6) => {
  const digits = '0123456789';
  let OTP = '';
  
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  
  return OTP;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
exports.validateEmail = (email) => {
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (E.164 format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
exports.validatePhone = (phone) => {
  // Basic E.164 format validation (+ followed by 7-15 digits)
  const phoneRegex = /^\+[1-9]\d{7,14}$/;
  return phoneRegex.test(phone);
};

/**
 * Format phone number to E.164 format
 * @param {string} phone - Phone number to format
 * @param {string} countryCode - Country code (default: +91 for India)
 * @returns {string} - Formatted phone number
 */
exports.formatPhoneNumber = (phone, countryCode = '+91') => {
  // Handle undefined or null phone
  if (!phone) {
    return '';
  }
  
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Check if the number already has a country code
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Add country code if not present
  return `${countryCode}${digits}`;
};

/**
 * Mask sensitive information like email or phone
 * @param {string} value - Value to mask
 * @param {string} type - Type of value ('email' or 'phone')
 * @returns {string} - Masked value
 */
exports.maskSensitiveInfo = (value, type) => {
  if (!value) return '';
  
  if (type === 'email') {
    const [username, domain] = value.split('@');
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  }
  
  if (type === 'phone') {
    // Keep country code and last 4 digits visible
    const visibleDigits = 4;
    const countryCodeEnd = value.startsWith('+') ? value.indexOf(' ') : 0;
    const countryCode = countryCodeEnd > 0 ? value.substring(0, countryCodeEnd) : '';
    const restOfNumber = value.substring(countryCodeEnd).trim();
    
    if (restOfNumber.length <= visibleDigits) {
      return value;
    }
    
    const maskedPart = '*'.repeat(restOfNumber.length - visibleDigits);
    const visiblePart = restOfNumber.substring(restOfNumber.length - visibleDigits);
    
    return `${countryCode} ${maskedPart}${visiblePart}`;
  }
  
  return value;
}; 