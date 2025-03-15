import axios from 'axios';
import { AppwriteService } from './appwrite';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: `${API_URL}/api`
});

// Add request interceptor to add auth token to all requests
api.interceptors.request.use(
  async (config) => {
    // Don't add token for public endpoints
    const publicEndpoints = [
      '/products',
      '/users/register',
      '/users/login',
      '/users/verify-otp'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url.includes(endpoint) && config.method === 'get'
    );
    
    if (isPublicEndpoint) {
      return config;
    }
    
    // For authenticated endpoints, try to get token from Appwrite
    try {
      const isLoggedIn = await AppwriteService.isLoggedIn();
      
      if (isLoggedIn) {
        const { user } = await AppwriteService.getCurrentUser();
        
        if (user && user.$id) {
          config.headers.Authorization = `Bearer ${user.$id}`;
        }
      }
    } catch (error) {
      console.error('Error adding auth token to request:', error);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to handle API responses
const handleResponse = (response) => {
  return response.data;
};

// Helper function to handle API errors
const handleError = (error) => {
  throw error.response?.data || { success: false, message: 'An error occurred' };
};

// User APIs
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const verifyOTP = async (data) => {
  try {
    const response = await api.post('/users/verify-otp', data);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Appwrite Authentication
export const appwriteAuth = async (userData) => {
  try {
    const response = await api.post('/users/appwrite-auth', userData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Product APIs
export const getProducts = async (filters = {}) => {
  try {
    const response = await api.get('/products', { params: filters });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Cart APIs
export const getCart = async () => {
  try {
    const response = await api.get('/cart');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const addToCart = async (cartData) => {
  try {
    const response = await api.post('/cart', cartData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateCartItem = async (itemId, updateData) => {
  try {
    const response = await api.put(`/cart/${itemId}`, updateData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const removeFromCart = async (itemId) => {
  try {
    const response = await api.delete(`/cart/${itemId}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const clearCart = async () => {
  try {
    const response = await api.delete('/cart');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Payment APIs
export const createRazorpayOrder = async (orderData) => {
  try {
    const response = await api.post('/payments/create-order', orderData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments/verify', paymentData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Rental APIs
export const createRental = async (rentalData) => {
  try {
    const response = await api.post('/rentals', rentalData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getUserRentals = async () => {
  try {
    const response = await api.get('/rentals');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getActiveRentals = async () => {
  try {
    const response = await api.get('/rentals/active');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getCompletedRentals = async () => {
  try {
    const response = await api.get('/rentals/completed');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getRentalById = async (rentalId) => {
  try {
    const response = await api.get(`/rentals/${rentalId}`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const cancelRental = async (rentalId) => {
  try {
    const response = await api.put(`/rentals/${rentalId}/cancel`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

// Return APIs
export const scheduleReturn = async (returnData) => {
  try {
    const response = await api.post('/returns', returnData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getUserReturns = async () => {
  try {
    const response = await api.get('/returns');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getPendingReturns = async () => {
  try {
    const response = await api.get('/returns/pending');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getCompletedReturns = async () => {
  try {
    const response = await api.get('/returns/completed');
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const assignReturn = async (returnId, assignData) => {
  try {
    const response = await api.put(`/returns/${returnId}/assign`, assignData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateReturnStatus = async (returnId, statusData) => {
  try {
    const response = await api.put(`/returns/${returnId}/status`, statusData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const submitInspection = async (returnId, inspectionData) => {
  try {
    const response = await api.post(`/returns/${returnId}/inspection`, inspectionData);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
};

export const completeReturn = async (returnId) => {
  try {
    const response = await api.put(`/returns/${returnId}/complete`);
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
}; 