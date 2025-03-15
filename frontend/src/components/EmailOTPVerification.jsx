import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmailOTPVerification = ({ email, backendUrl, onVerificationComplete }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-focus the first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    if (resendDisabled) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [resendDisabled]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }
    
    if (isNaN(value)) {
      return;
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    if (pastedData.length <= 6 && /^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      
      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        newOtp[i] = pastedData.charAt(i);
      }
      
      setOtp(newOtp);
      
      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        inputRefs.current[nextEmptyIndex].focus();
      } else {
        inputRefs.current[5].focus();
      }
    }
  };

  const sendEmailOTP = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post(`${backendUrl}/api/users/send-email-otp`, { email });
      
      if (response.data.success) {
        toast.success('OTP sent successfully to your email');
        setResendDisabled(true);
        setCountdown(30);
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending email OTP:', error);
      if (error.response) {
        toast.error(error.response.data?.message || 'Server error');
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(error.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOTP = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post(`${backendUrl}/api/users/verify-email-otp`, {
        email,
        otp: otpString
      });
      
      if (response.data.success) {
        toast.success('Email verified successfully');
        onVerificationComplete && onVerificationComplete(response.data);
      } else {
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying email OTP:', error);
      if (error.response) {
        toast.error(error.response.data?.message || 'Server error');
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(error.message || 'Failed to verify OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <p className="text-gray-600 mb-6">
        We've sent a verification code to <span className="font-medium">{email}</span>
      </p>
      
      <div className="flex justify-center gap-2 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="w-12 h-12 text-center text-xl font-semibold border rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        ))}
      </div>
      
      <button
        onClick={verifyEmailOTP}
        disabled={loading || otp.join('').length !== 6}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 mb-4 flex items-center justify-center"
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {loading ? 'Verifying...' : 'Verify Email OTP'}
      </button>
      
      <div className="text-center">
        <p className="text-gray-600 text-sm">
          Didn't receive the code?{' '}
          {resendDisabled ? (
            <span className="text-gray-400">Resend in {countdown}s</span>
          ) : (
            <button
              onClick={sendEmailOTP}
              disabled={loading || resendDisabled}
              className="text-blue-600 font-medium hover:text-blue-800"
            >
              Resend OTP
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default EmailOTPVerification; 