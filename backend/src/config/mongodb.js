import mongoose from 'mongoose';
import 'dotenv/config';

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rentonway_db';

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', MONGODB_URI);
    
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      retryWrites: true
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Provide more specific error messages for common issues
    if (error.message.includes('bad auth')) {
      console.error('Authentication failed. Please check your MongoDB username and password in the .env file.');
      console.error('You may need to update your MongoDB Atlas credentials or whitelist your IP address.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('Connection refused. Please check if MongoDB is running or if the connection string is correct.');
    }
    
    // Exit the process if connection fails
    process.exit(1);
  }
};

export default connectDB; 