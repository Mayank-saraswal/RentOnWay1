import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const EmailVerification = ({ email, onVerified, onCancel }) => {
  const [isResending, setIsResending] = useState(false);
  const { resendEmailVerification } = useAuth();

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const result = await resendEmailVerification();
      
      if (result.success) {
        toast.success('Verification email sent successfully!');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast.error('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const handleRefresh = () => {
    // Refresh the auth state to check if email is verified
    onVerified();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <svg 
          className="w-16 h-16 mx-auto text-primary" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
          />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Verify Your Email
      </h2>
      
      <p className="text-center text-gray-600 mb-6">
        We've sent a verification email to <span className="font-medium">{email}</span>. 
        Please check your inbox and click the verification link to complete your registration.
      </p>
      
      <div className="space-y-4">
        <button
          onClick={handleRefresh}
          className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        >
          I've Verified My Email
        </button>
        
        <button
          onClick={handleResendEmail}
          disabled={isResending}
          className="w-full py-2 px-4 bg-white text-primary border border-primary font-semibold rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? 'Sending...' : 'Resend Verification Email'}
        </button>
        
        <button
          onClick={onCancel}
          className="w-full py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Back to Login
        </button>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Didn't receive the email? Check your spam folder or try another email address.
        </p>
      </div>
    </div>
  );
};

EmailVerification.propTypes = {
  email: PropTypes.string.isRequired,
  onVerified: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default EmailVerification; 