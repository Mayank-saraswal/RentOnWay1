# RentOnWay Backend API

This is the backend API for the RentOnWay application, a platform for renting products.

## Features

- User authentication with JWT
- OTP verification via SMS and Email
- User profile management
- Security features (rate limiting, data sanitization, etc.)

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Nodemailer for email services
- Fast2SMS for SMS services

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/rentonway
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30

   # Email configuration
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_email_app_password
   EMAIL_FROM=noreply@rentonway.com
   EMAIL_FROM_NAME=RentOnWay

   # SMS configuration (Fast2SMS)
   FAST2SMS_API_KEY=your_fast2sms_api_key
   SMS_SENDER_ID=RNTWAY

   # OTP configuration
   OTP_EXPIRE=10
   ```

## Running the Server

### Development mode
```
npm run dev
```

### Production mode
```
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/send-phone-otp` - Send OTP to phone
- `POST /api/auth/send-email-otp` - Send OTP to email
- `POST /api/auth/verify-phone-otp` - Verify phone OTP
- `POST /api/auth/verify-email-otp` - Verify email OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/update-profile` - Update user profile (protected)

## Error Handling

The API uses a consistent error response format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Security Measures

- Helmet for setting security headers
- Rate limiting to prevent brute force attacks
- Data sanitization against NoSQL injection
- XSS protection
- Parameter pollution prevention

## License

ISC 