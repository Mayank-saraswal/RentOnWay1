import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const OTPVerification = ({ 
  onVerify, 
  onResend, 
  onCancel, 
  isLoading, 
  type = 'phone',
  destination
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeInput, setActiveInput] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  // Handle countdown for resend button
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);
  
  // Handle OTP input change
  const handleChange = (e, index) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value.substring(0, 1); // Only take the first character
    setOtp(newOtp);
    
    // Auto-focus next input if value is entered
    if (value && index < 5) {
      setActiveInput(index + 1);
    }
    
    // Check if all inputs are filled
    if (newOtp.every(digit => digit) && index === 5) {
      // All digits entered, submit OTP
      handleSubmit(newOtp.join(''));
    }
  };
  
  // Handle key press events
  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setActiveInput(index - 1);
    }
    
    // Move to next input on right arrow
    if (e.key === 'ArrowRight' && index < 5) {
      setActiveInput(index + 1);
    }
    
    // Move to previous input on left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      setActiveInput(index - 1);
    }
  };
  
  // Focus the active input
  useEffect(() => {
    const input = document.getElementById(`otp-input-${activeInput}`);
    if (input) {
      input.focus();
    }
  }, [activeInput]);
  
  // Handle OTP submission
  const handleSubmit = (otpValue) => {
    if (otpValue.length !== 6) {
      toast.error('Please enter all 6 digits of the OTP');
      return;
    }
    
    onVerify(otpValue);
  };
  
  // Handle resend OTP
  const handleResend = () => {
    if (!canResend) return;
    
    onResend();
    setCanResend(false);
    setTimeLeft(30);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Verification Code
      </h2>
      
      <p className="text-center text-gray-600 mb-6">
        We've sent a verification code to your {type === 'phone' ? 'phone' : 'email'}{' '}
        <span className="font-medium">{destination}</span>
      </p>
      
      <div className="flex justify-center space-x-2 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-input-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
          />
        ))}
      </div>
      
      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={() => handleSubmit(otp.join(''))}
          disabled={otp.some(digit => !digit) || isLoading}
          className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>
      </div>
      
      <div className="text-center">
        <p className="text-gray-600 mb-2">
          Didn't receive the code?{' '}
          {!canResend && timeLeft > 0 && (
            <span className="text-gray-500">
              Resend in {timeLeft}s
            </span>
          )}
        </p>
        
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isLoading}
            className="text-primary hover:text-primary-dark font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Resend Code
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

OTPVerification.propTypes = {
  onVerify: PropTypes.func.isRequired,
  onResend: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  type: PropTypes.oneOf(['phone', 'email']),
  destination: PropTypes.string.isRequired
};

export default OTPVerification; 