import nodemailer from 'nodemailer';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate a 6-digit OTP
export const generateEmailOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
export const sendEmailOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP - RentOnWay',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #007bff; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 30 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: error.message };
  }
};

// Store OTPs temporarily (in production, use Redis or similar)
const emailOTPs = new Map();

// Verify email OTP
export const verifyEmailOTP = (email, otp) => {
  const storedOTP = emailOTPs.get(email);
  if (!storedOTP) return false;
  
  const isValid = storedOTP.otp === otp && Date.now() < storedOTP.expiresAt;
  if (isValid) {
    emailOTPs.delete(email); // Remove OTP after successful verification
  }
  
  return isValid;
};

// Store email OTP (internal function)
export const storeEmailOTP = (email, otp) => {
  emailOTPs.set(email, {
    otp,
    expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes expiry
  });
}; 