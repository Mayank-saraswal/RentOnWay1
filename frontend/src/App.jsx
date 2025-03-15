import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ShopContext } from './context/ShopContext'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SellerDashboard from './pages/SellerDashboard'
import DeliveryDashboard from './pages/DeliveryDashboard'
import DeliveryOrderDetails from './pages/DeliveryOrderDetails'
import Profile from './pages/Profile'
import MyRentals from './pages/MyRentals'
import DeliveryReturns from './pages/DeliveryReturns'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Role-based protected route
const RoleProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { user } = React.useContext(ShopContext);
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user || user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Navbar />
      <SearchBar />
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<Home />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:id' element={<Product />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        
        {/* Protected customer routes */}
        <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path='/place-order' element={<ProtectedRoute><PlaceOrder /></ProtectedRoute>} />
        <Route path='/orders' element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path='/my-rentals' element={<ProtectedRoute><MyRentals /></ProtectedRoute>} />
        
        {/* Seller routes */}
        <Route path='/seller-dashboard' element={<RoleProtectedRoute requiredRole="seller"><SellerDashboard /></RoleProtectedRoute>} />
        
        {/* Delivery partner routes */}
        <Route path='/delivery-dashboard' element={<RoleProtectedRoute requiredRole="delivery"><DeliveryDashboard /></RoleProtectedRoute>} />
        <Route path='/delivery-order-details/:orderId' element={<RoleProtectedRoute requiredRole="delivery"><DeliveryOrderDetails /></RoleProtectedRoute>} />
        <Route path='/delivery-returns' element={<RoleProtectedRoute requiredRole="delivery"><DeliveryReturns /></RoleProtectedRoute>} />
        
        {/* Redirect legacy routes */}
        <Route path='/sign-in' element={<Navigate to="/login" replace />} />
        <Route path='/sign-up' element={<Navigate to="/register" replace />} />
        <Route path='/verify' element={<Navigate to="/login" replace />} />
        <Route path='/seller-login' element={<Navigate to="/login" replace />} />
        <Route path='/delivery-login' element={<Navigate to="/login" replace />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
