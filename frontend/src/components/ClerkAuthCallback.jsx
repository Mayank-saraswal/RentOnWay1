import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const ClerkAuthCallback = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useContext(ShopContext);
  
  useEffect(() => {
    // Wait for Clerk to load and user to be set in context
    if (isLoaded) {
      if (isSignedIn && user) {
        // User is signed in and synced with backend
        toast.success('Successfully signed in!');
        
        // Redirect based on user role
        if (user.role === 'seller') {
          navigate('/seller-dashboard');
        } else if (user.role === 'delivery') {
          navigate('/delivery-dashboard');
        } else {
          navigate('/');
        }
      } else if (!isSignedIn) {
        // User is not signed in
        toast.info('Sign in cancelled');
        navigate('/');
      }
    }
  }, [isLoaded, isSignedIn, user, navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="mt-4 text-gray-600">Processing your authentication...</p>
    </div>
  );
};

export default ClerkAuthCallback; 