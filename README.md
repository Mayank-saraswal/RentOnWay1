# RentOnway - Clothing Rental Platform

RentOnway is a modern clothing rental platform inspired by Rent the Runway, allowing users to rent premium clothing and accessories for various occasions.

## New Features

### Category Components
We've added several new category components to enhance the user experience:

1. **New Arrivals** - Showcases the latest additions to our collection
2. **College Wear** - Outfits perfect for campus life and academic events
3. **Party Wear** - Stunning outfits for parties and special events
4. **Wedding Specials** - Elegant attire for all wedding-related occasions
5. **Festival Wear** - Traditional and fusion outfits for various festivals

### Enhanced Seller Dashboard
The seller dashboard now includes:
- Improved product categorization with wear types (College, Party, Wedding, Festival, etc.)
- Occasion-specific tagging for better searchability
- Seasonal categories (Summer, Winter, Monsoon)

## Running the Application

### Using the Batch File (Windows)
Simply double-click the `run-app.bat` file to start both the frontend and backend servers.

### Manual Start
1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend server:
   ```
   cd frontend
   npm run dev
   ```

## MongoDB Connection
If you're experiencing MongoDB connection issues:
1. Check your MongoDB Atlas credentials in the `.env` file
2. Make sure your IP address is whitelisted in MongoDB Atlas
3. For local development, you can use: `mongodb://localhost:27017/rentonway_db`

## Technologies Used
- Frontend: React, TailwindCSS
- Backend: Node.js, Express
- Database: MongoDB
- Payment Gateway: Razorpay

## Inspiration
This project is inspired by [Rent the Runway](https://www.renttherunway.com/), a popular clothing rental service.
