import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import 'dotenv/config';

// Database configuration
const dbName = process.env.DB_NAME || 'renton_db';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';

// Function to create database if it doesn't exist
const createDatabaseIfNotExists = async () => {
  try {
    // Create a connection without specifying a database
    const connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword
    });

    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`);
    console.log(`Database ${dbName} created or already exists`);
    
    // Close the connection
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
};

// Create a new Sequelize instance with MySQL
const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // Log more details about the connection attempt
    console.log('Connection details:', {
      dbName,
      dbUser,
      passwordProvided: dbPassword ? 'Yes' : 'No',
      dbHost
    });
  }
};

// Call the test connection function
testConnection();

export { createDatabaseIfNotExists };
export default sequelize;