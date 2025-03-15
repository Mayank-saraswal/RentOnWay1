import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const PasswordReset = ({ onCancel }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        setIsEmailSent(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      {!isEmailSent ? (
        <>
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
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" 
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Reset Your Password
          </h2>
          
          <p className="text-center text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-primary hover:text-primary-dark font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="text-center mb-6">
            <svg 
              className="w-16 h-16 mx-auto text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Check Your Email
          </h2>
          
          <p className="text-center text-gray-600 mb-6">
            We've sent a password reset link to <span className="font-medium">{email}</span>. 
            Please check your inbox and follow the instructions to reset your password.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => setIsEmailSent(false)}
              className="w-full py-2 px-4 bg-white text-primary border border-primary font-semibold rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            >
              Try Another Email
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
        </>
      )}
    </div>
  );
};

PasswordReset.propTypes = {
  onCancel: PropTypes.func.isRequired
};

export default PasswordReset; 