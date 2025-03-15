import { account, ID } from './config';
import { toast } from 'react-toastify';
import axios from 'axios';

class AuthService {
  // Create a new account
  async createAccount(email, password, name) {
    try {
      const response = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      if (response.$id) {
        // Login after successful account creation
        return this.login(email, password);
      }
      
      return response;
    } catch (error) {
      console.error('Appwrite create account error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  }
  
  // Login to account
  async login(email, password) {
    try {
      const session = await account.createEmailSession(email, password);
      
      if (session.$id) {
        // Get account details
        const accountDetails = await account.get();
        
        // Sync with backend
        return this.syncWithBackend(accountDetails);
      }
      
      return null;
    } catch (error) {
      console.error('Appwrite login error:', error);
      toast.error(error.message || 'Failed to login');
      throw error;
    }
  }
  
  // Login with Google
  async loginWithGoogle() {
    try {
      account.createOAuth2Session('google', 
        `${window.location.origin}/auth-callback`, 
        `${window.location.origin}/login?error=cancelled`
      );
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Failed to login with Google');
      throw error;
    }
  }
  
  // Handle OAuth callback
  async handleAuthCallback() {
    try {
      const accountDetails = await account.get();
      return this.syncWithBackend(accountDetails);
    } catch (error) {
      console.error('Auth callback error:', error);
      toast.error(error.message || 'Authentication failed');
      throw error;
    }
  }
  
  // Sync Appwrite user with backend
  async syncWithBackend(accountDetails) {
    try {
      const response = await axios.post('/api/users/appwrite-auth', {
        appwriteId: accountDetails.$id,
        name: accountDetails.name,
        email: accountDetails.email
      });
      
      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data));
        
        toast.success('Login successful');
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Backend sync error:', error);
      toast.error(error.response?.data?.message || 'Failed to sync with backend');
      throw error;
    }
  }
  
  // Logout
  async logout() {
    try {
      await account.deleteSession('current');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to logout');
      throw error;
    }
  }
  
  // Get current user
  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
  
  // Check if user is logged in
  async isLoggedIn() {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
}

const authService = new AuthService();
export default authService; 