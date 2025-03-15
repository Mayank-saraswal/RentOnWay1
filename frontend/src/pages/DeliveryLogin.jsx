import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const DeliveryLogin = () => {
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
  const [vehicleType, setVehicleType] = useState('bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [drivingLicenseImage, setDrivingLicenseImage] = useState(null);
  const [vehicleImage, setVehicleImage] = useState(null);
  const [drivingLicenseImagePreview, setDrivingLicenseImagePreview] = useState(null);
  const [vehicleImagePreview, setVehicleImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDrivingLicenseImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDrivingLicenseImage(file);
      setDrivingLicenseImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVehicleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVehicleImage(file);
      setVehicleImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentState === 'Register') {
        // Check if images are provided
        if (!drivingLicenseImage) {
          toast.error('Please upload your driving license image');
          setLoading(false);
          return;
        }

        if (!vehicleImage) {
          toast.error('Please upload your vehicle image');
          setLoading(false);
          return;
        }

        // Create form data for multipart/form-data
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('city', city);
        formData.append('state', state);
        formData.append('pincode', pincode);
        formData.append('vehicleType', vehicleType);
        formData.append('vehicleNumber', vehicleNumber);
        formData.append('drivingLicenseNumber', drivingLicenseNumber);
        formData.append('drivingLicenseImage', drivingLicenseImage);
        formData.append('vehicleImage', vehicleImage);

        // Register as a new delivery partner
        const response = await axios.post(
          `${backendUrl}/api/delivery-partners/register`, 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          toast.success('Registration successful! Please login.');
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
          setVehicleType('bike');
          setVehicleNumber('');
          setDrivingLicenseNumber('');
          setDrivingLicenseImage(null);
          setVehicleImage(null);
          setDrivingLicenseImagePreview(null);
          setVehicleImagePreview(null);
        } else {
          toast.error(response.data.message || 'Registration failed');
        }
      } else {
        // Login as an existing delivery partner
        const response = await axios.post(`${backendUrl}/api/delivery-partners/login`, {
          email,
          password
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userType', 'deliveryPartner');
          toast.success('Login successful!');
          navigate('/delivery-dashboard');
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

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        {currentState === 'Login' ? 'Delivery Partner Login' : 'Delivery Partner Registration'}
      </h2>
      
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
              <label className="block text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Vehicle Number</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Driving License Number</label>
              <input
                type="text"
                value={drivingLicenseNumber}
                onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Driving License Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleDrivingLicenseImageChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {drivingLicenseImagePreview && (
                <div className="mt-2">
                  <img 
                    src={drivingLicenseImagePreview} 
                    alt="Driving License Preview" 
                    className="w-full h-40 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Vehicle Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleVehicleImageChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {vehicleImagePreview && (
                <div className="mt-2">
                  <img 
                    src={vehicleImagePreview} 
                    alt="Vehicle Preview" 
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
    </div>
  );
};

export default DeliveryLogin; 