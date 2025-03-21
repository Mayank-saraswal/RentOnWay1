import 'dotenv/config' ; 
import express from 'express'; 
import cors from 'cors'; 
import http from 'http'; 
import { Server } from 'socket.io'; 
import connectDB from './config/mongodb.js'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import userRoutes from './routes/userRoutes.js'; 
import productRoutes from './routes/productRoutes.js'; 
import cartRoutes from './routes/cartRoutes.js'; 
import adminRoutes from './routes/adminRoutes.js'; 
import retailerRoutes from './routes/retailerRoutes.js'; 
import deliveryPartnerRoutes from './routes/deliveryPartnerRoutes.js'; 
import paymentRoutes from './routes/paymentRoutes.js'; 
import returnRoutes from './routes/returnRoutes.js'; 
import rentalRoutes from './routes/rentalRoutes.js'; 
import orderRoutes from './routes/orderRoutes.js'; 
import sellerRoutes from './routes/sellerRoutes.js'; 
import categoryRoutes from './routes/categoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Define PORT from environment variables or use default
const PORT = process.env.PORT || 5000;
 
// Get current directory name 
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 
 
const app = express(); 
const server = http.createServer(app); 
const io = new Server(server, { 
  cors: { 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true 
  } 
}); 
 
// Middleware 
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] 
})); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
 
// Static folder for uploads 
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); 
 
// Routes 
app.use('/api/users', userRoutes); 
app.use('/api/products', productRoutes); 
app.use('/api/cart', cartRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/retailers', retailerRoutes); 
app.use('/api/delivery-partners', deliveryPartnerRoutes); 
app.use('/api/payments', paymentRoutes); 
app.use('/api/returns', returnRoutes); 
app.use('/api/rentals', rentalRoutes); 
app.use('/api/orders', orderRoutes); 
app.use('/api/sellers', sellerRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/auth', authRoutes);
 
// Root route 
app.get('/', (req, res) => {
  res.send('API is running...');
}); 
 
// Socket.io connection 
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id); 
 
  // Handle chat messages 
  socket.on('sendMessage', (data) => {
    io.to(data.room).emit('receiveMessage', data); 
  }); 
 
  // Join a room 
  socket.on('joinRoom', (room) => {
    socket.join(room); 
    console.log(`User ${socket.id} joined room: ${room}`); 
  }); 
 
  // Leave a room 
  socket.on('leaveRoom', (room) => {
    socket.leave(room); 
    console.log(`User ${socket.id} left room: ${room}`); 
  }); 
 
  // Handle disconnect 
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id); 
  }); 
}); 
 
// Start server 
const startServer = async () => {
  try { 
    // Connect to MongoDB 
    await connectDB(); 
    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`); 
      console.log(`MongoDB connected successfully`); 
    }); 
  } catch (error) { 
    console.error(`Error starting server: ${error.message}`); 
    process.exit(1); 
  } 
}; 
 
startServer(); 
 
// Export io instance for use in other files 
export { io }; 

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
}); 
