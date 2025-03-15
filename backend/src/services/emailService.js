const nodemailer = require('nodemailer');

/**
 * Create a nodemailer transporter
 * @returns {Object} - Nodemailer transporter
 */
const createTransporter = () => {
  // Create transporter with environment variables
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // App password for Gmail
    }
  });
  
  return transporter;
};

/**
 * Send email using Nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content
 * @returns {Promise<Object>} - Response from Nodemailer
 */
exports.sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = createTransporter();
    
    // Email options
    const mailOptions = {
      from: `RentOnWay <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', info.messageId);
    
    return {
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email service error:', error);
    
    // For development/testing, log success even if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Simulating email success');
      console.log('Email content:', { to, subject, text });
      return {
        success: true,
        message: 'Email sent successfully (simulated in development)',
        messageId: 'dev-' + Date.now()
      };
    }
    
    throw new Error(error.message || 'Failed to send email');
  }
};

/**
 * Send OTP verification email
 * @param {string} to - Recipient email address
 * @param {string} otp - OTP to send
 * @returns {Promise<Object>} - Response from sendEmail function
 */
exports.sendOTPEmail = async (to, otp) => {
  const subject = 'RentOnWay Verification Code';
  const text = `Your verification code is: ${otp}. It will expire in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">RentOnWay Verification</h2>
      <p>Your verification code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px; background-color: #f3f4f6; padding: 10px; text-align: center;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    </div>
  `;
  
  return await exports.sendEmail(to, subject, text, html);
};

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} otp - OTP to send
 * @returns {Promise<Object>} - Response from sendEmail function
 */
exports.sendPasswordResetEmail = async (to, otp) => {
  const subject = 'RentOnWay Password Reset';
  const text = `Your password reset code is: ${otp}. It will expire in 10 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">RentOnWay Password Reset</h2>
      <p>Your password reset code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px; background-color: #f3f4f6; padding: 10px; text-align: center;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;
  
  return await exports.sendEmail(to, subject, text, html);
}; 