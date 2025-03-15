import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import SellerOTPVerification from '../components/SellerOTPVerification';
import SellerEmailOTPVerification from '../components/SellerEmailOTPVerification';

const SellerLogin = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [businessType, setBusinessType] = useState('individual');
  const [storeImage, setStoreImage] = useState(null);
  const [storeImagePreview, setStoreImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState('form'); // 'form', 'phone-otp', or 'email-otp'
  const [verificationData, setVerificationData] = useState({
    phoneVerified: false,
    emailVerified: false,
    tempUserId: null
  });

  const formatPhoneNumber = (phoneNumber) => {
    // Remove any non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // For Fast2SMS, we need a 10-digit number without country code
    // If it has country code (e.g., +91 or 91), remove it
    if (digits.startsWith('91') && digits.length > 10) {
      return digits.substring(2);
    } else if (digits.length > 10) {
      return digits.substring(digits.length - 10);
    }
    
    return digits;
  };

  const handleStoreImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStoreImage(file);
      setStoreImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentState === 'Register') {
        // Format phone number for Fast2SMS
        const formattedPhone = formatPhoneNumber(phone);
        
        if (formattedPhone.length !== 10) {
          toast.error('Please enter a valid 10-digit phone number');
          setLoading(false);
          return;
        }
        
        // Check if store image is provided
        if (!storeImage) {
          toast.error('Please upload your store image');
          setLoading(false);
          return;
        }

        // Initiate registration and send OTP
        const response = await axios.post(`${backendUrl}/api/sellers/initiate-register`, {
          name,
          email,
          phone: formattedPhone,
          password,
          address,
          city,
          state,
          pincode,
          businessName,
          gstNumber,
          panNumber,
          businessType
        });
        
        if (response.data.success) {
          toast.success('OTPs sent successfully. Please verify your phone and email to complete registration.');
          setPhone(formattedPhone); // Update phone with formatted version
          setRegistrationStep('phone-otp');
          setVerificationData({
            phoneVerified: false,
            emailVerified: false,
            tempUserId: response.data.data.tempUserId
          });
        } else {
          toast.error(response.data.message || 'Registration failed');
        }
      } else {
        // Login as an existing seller
        const response = await axios.post(`${backendUrl}/api/sellers/login`, {
          email,
          password
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userType', 'seller');
          toast.success('Login successful!');
          navigate('/seller-dashboard');
        } else {
          toast.error(response.data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOtpVerificationComplete = (data) => {
    // Phone OTP verification successful
    if (data.data.emailVerified) {
      // Both phone and email are verified, complete registration with images
      completeRegistration();
    } else {
      // Phone verified but email not yet verified
      toast.success('Phone verified successfully! Please verify your email to complete registration.');
      setVerificationData({
        ...verificationData,
        phoneVerified: true
      });
      setRegistrationStep('email-otp');
    }
  };

  const handleEmailOtpVerificationComplete = (data) => {
    // Email OTP verification successful
    if (data.data.phoneVerified) {
      // Both phone and email are verified, complete registration with images
      completeRegistration();
    } else {
      // Email verified but phone not yet verified
      toast.success('Email verified successfully! Please verify your phone to complete registration.');
      setVerificationData({
        ...verificationData,
        emailVerified: true
      });
      setRegistrationStep('phone-otp');
    }
  };

  const completeRegistration = async () => {
    setLoading(true);
    try {
      // Create form data for multipart/form-data
      const formData = new FormData();
      formData.append('tempUserId', verificationData.tempUserId);
      formData.append('storeImage', storeImage);

      // Complete registration with images
      const response = await axios.post(
        `${backendUrl}/api/sellers/complete-register`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Registration completed successfully! Please login.');
        setCurrentState('Login');
        
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
        setAddress('');
        setCity('');
        setState('');
        setPincode('');
        setBusinessName('');
        setGstNumber('');
        setPanNumber('');
        setBusinessType('individual');
        setStoreImage(null);
        setStoreImagePreview(null);
        setRegistrationStep('form');
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error completing registration:', error);
      toast.error(error.response?.data?.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        {currentState === 'Login' ? 'Seller Login' : 'Seller Registration'}
      </h2>
      
      {currentState === 'Register' && registrationStep === 'phone-otp' ? (
        // Phone OTP verification step
        <div>
          <h3 className="text-xl font-semibold text-center mb-4">
            Verify Your Phone
          </h3>
          <SellerOTPVerification 
            phone={phone} 
            backendUrl={backendUrl} 
            onVerificationComplete={handlePhoneOtpVerificationComplete} 
          />
          <div className="mt-4 text-center">
            <button
              onClick={() => setRegistrationStep('form')}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Registration
            </button>
          </div>
        </div>
      ) : currentState === 'Register' && registrationStep === 'email-otp' ? (
        // Email OTP verification step
        <div>
          <h3 className="text-xl font-semibold text-center mb-4">
            Verify Your Email
          </h3>
          <SellerEmailOTPVerification 
            email={email} 
            backendUrl={backendUrl} 
            onVerificationComplete={handleEmailOtpVerificationComplete} 
          />
          <div className="mt-4 text-center">
            <button
              onClick={() => setRegistrationStep('form')}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Registration
            </button>
          </div>
        </div>
      ) : (
        // Login or Registration form
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentState === 'Register' && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Business Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="individual">Individual</option>
                  <option value="partnership">Partnership</option>
                  <option value="company">Company</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Store Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStoreImageChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {storeImagePreview && (
                  <div className="mt-2">
                    <img 
                      src={storeImagePreview} 
                      alt="Store Preview" 
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </>
          )}
          
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              currentState === 'Login' ? 'Login' : 'Register'
            )}
          </button>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setCurrentState(currentState === 'Login' ? 'Register' : 'Login')}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              {currentState === 'Login' ? 'Need to register? Sign up here' : 'Already registered? Login here'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SellerLogin; 