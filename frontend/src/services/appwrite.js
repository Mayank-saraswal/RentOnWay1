import { Client, Account, ID } from 'appwrite';

// Initialize Appwrite client
const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || 'your-project-id');

// Initialize Appwrite account
const account = new Account(client);

// Authentication services
export const AppwriteService = {
    // Create a new user account
    createAccount: async (email, password, name) => {
        try {
            const response = await account.create(
                ID.unique(),
                email,
                password,
                name
            );
            
            if (response.$id) {
                // Login immediately after successful registration
                return await AppwriteService.login(email, password);
            } else {
                return { success: false, message: 'Account creation failed' };
            }
        } catch (error) {
            console.error('Appwrite service :: createAccount :: error', error);
            return { success: false, message: error.message };
        }
    },

    // Login user
    login: async (email, password) => {
        try {
            const session = await account.createEmailSession(email, password);
            const user = await account.get();
            
            return { 
                success: true, 
                user, 
                session,
                message: 'Login successful' 
            };
        } catch (error) {
            console.error('Appwrite service :: login :: error', error);
            return { success: false, message: error.message };
        }
    },

    // Get current user
    getCurrentUser: async () => {
        try {
            const user = await account.get();
            return { success: true, user };
        } catch (error) {
            console.error('Appwrite service :: getCurrentUser :: error', error);
            return { success: false, message: error.message };
        }
    },

    // Logout user
    logout: async () => {
        try {
            await account.deleteSession('current');
            return { success: true, message: 'Logout successful' };
        } catch (error) {
            console.error('Appwrite service :: logout :: error', error);
            return { success: false, message: error.message };
        }
    },

    // Send password reset email
    resetPassword: async (email) => {
        try {
            await account.createRecovery(email, import.meta.env.VITE_APP_URL + '/reset-password');
            return { success: true, message: 'Password reset email sent' };
        } catch (error) {
            console.error('Appwrite service :: resetPassword :: error', error);
            return { success: false, message: error.message };
        }
    },

    // Update user's name
    updateName: async (name) => {
        try {
            const user = await account.updateName(name);
            return { success: true, user };
        } catch (error) {
            console.error('Appwrite service :: updateName :: error', error);
            return { success: false, message: error.message };
        }
    },

    // Check if user is logged in
    isLoggedIn: async () => {
        try {
            const user = await account.get();
            return !!user.$id;
        } catch (error) {
            return false;
        }
    }
};

export { client, account }; 