import { Client, Account, ID } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID || 'your-project-id');

// Initialize Appwrite account
const account = new Account(client);

export { client, account, ID }; 