import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SellerOTPVerification = ({ phone, backendUrl, onVerificationComplete }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  
  // Timer for OTP resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (value.length > 1) {
      // If pasted value is longer than 1 character, take only the first character
      value = value.charAt(0);
    }
    
    if (isNaN(value)) {
      return;
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value !== '' && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle key down events (backspace, etc.)
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs[index - 1].current.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('').slice(0, 4);
      
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 4) {
          newOtp[index] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus the appropriate input
      if (digits.length < 4) {
        inputRefs[digits.length].current.focus();
      }
    }
  };

  // Send OTP to phone
  const sendPhoneOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/sellers/send-otp`, { phone });
      
      if (response.data.success) {
        toast.success('OTP sent successfully!');
        setTimeLeft(60);
        setCanResend(false);
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyPhoneOTP = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 4) {
      toast.error('Please enter a valid 4-digit OTP');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/sellers/verify-phone-otp`, {
        phone,
        otp: otpString
      });
      
      if (response.data.success) {
        toast.success('Phone verified successfully!');
        onVerificationComplete(response.data);
      } else {
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          We've sent a verification code to your phone number: <span className="font-semibold">{phone}</span>
        </p>
      </div>
      
      <div className="flex justify-center space-x-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={verifyPhoneOTP}
          disabled={loading || otp.join('').length !== 4}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>
      
      <div className="text-center text-sm">
        {canResend ? (
          <button
            onClick={sendPhoneOTP}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Resend OTP
          </button>
        ) : (
          <p className="text-gray-600">
            Resend OTP in <span className="font-semibold">{timeLeft}</span> seconds
          </p>
        )}
      </div>
    </div>
  );
};

export default SellerOTPVerification; 