import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboard = () => {
  const { token, backendUrl } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState('new');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [currentLocation, setCurrentLocation] = useState('');
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    totalEarnings: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (!token) {
      toast.error('Please login as a delivery partner first');
      navigate('/delivery-login');
      return;
    }

    // Check if user type is delivery partner
    const userType = localStorage.getItem('userType');
    if (userType !== 'deliveryPartner') {
      toast.error('You are not authorized to access this page');
      navigate('/');
      return;
    }

    // Fetch delivery partner profile
    fetchProfile();
    
    // Fetch orders based on active tab
    fetchOrders();
    
    // Fetch stats
    fetchStats();
  }, [token, activeTab, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/delivery-partners/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProfile(response.data.data);
        setIsAvailable(response.data.data.isAvailable);
        setCurrentLocation(response.data.data.currentLocation || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch profile');
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      
      switch (activeTab) {
        case 'new':
          endpoint = `${backendUrl}/api/delivery-partners/orders/new`;
          break;
        case 'active':
          endpoint = `${backendUrl}/api/delivery-partners/orders/active`;
          break;
        case 'completed':
          endpoint = `${backendUrl}/api/delivery-partners/orders/completed`;
          break;
        case 'returns':
          endpoint = `${backendUrl}/api/delivery-partners/orders/returns`;
          break;
        default:
          endpoint = `${backendUrl}/api/delivery-partners/orders/new`;
      }
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/delivery-partners/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/delivery-partners/orders/${orderId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Order accepted successfully');
        fetchOrders();
        fetchStats();
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error(error.response?.data?.message || 'Failed to accept order');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/delivery-partners/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(`Order ${status.replace('_', ' ')} successfully`);
        fetchOrders();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/delivery-partners/availability`,
        { isAvailable: !isAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setIsAvailable(!isAvailable);
        toast.success(`You are now ${!isAvailable ? 'available' : 'unavailable'} for deliveries`);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error(error.response?.data?.message || 'Failed to update availability');
    }
  };

  const handleUpdateLocation = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/delivery-partners/location`,
        { currentLocation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Location updated successfully');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error(error.response?.data?.message || 'Failed to update location');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'return_initiated':
        return 'bg-orange-100 text-orange-800';
      case 'return_in_transit':
        return 'bg-amber-100 text-amber-800';
      case 'returned':
        return 'bg-teal-100 text-teal-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Delivery Partner Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="relative inline-block">
            <button
              onClick={handleToggleAvailability}
              className={`px-4 py-2 rounded-md ${
                isAvailable ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              } text-white`}
            >
              {isAvailable ? 'Available' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-gray-500 text-sm font-medium">Total Deliveries</h3>
          <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-gray-500 text-sm font-medium">Pending Deliveries</h3>
          <p className="text-2xl font-bold">{stats.pendingDeliveries}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-gray-500 text-sm font-medium">Completed Deliveries</h3>
          <p className="text-2xl font-bold">{stats.completedDeliveries}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
          <p className="text-2xl font-bold">₹{stats.totalEarnings.toFixed(2)}</p>
        </div>
      </div>

      {/* Location Update */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Update Your Location</h3>
        <div className="flex items-center">
          <input
            type="text"
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
            placeholder="Enter your current location"
            className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleUpdateLocation}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md"
          >
            Update
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'new'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            New Orders
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Active Deliveries
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'returns'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Returns
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-4 px-6 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Completed
          </button>
        </nav>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p className="mt-2">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
          <p className="text-gray-600">
            {activeTab === 'new'
              ? 'There are no new orders available for delivery at the moment.'
              : activeTab === 'active'
              ? 'You have no active deliveries at the moment.'
              : activeTab === 'returns'
              ? 'You have no return pickups at the moment.'
              : 'You have not completed any deliveries yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.user?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{order.user?.phone || 'N/A'}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{order.deliveryAddress}</div>
                    <div className="text-sm text-gray-500">
                      {order.city}, {order.state} - {order.pincode}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                    {activeTab === 'new' && (
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Accept
                      </button>
                    )}
                    
                    {activeTab === 'active' && order.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Out for Delivery
                      </button>
                    )}
                    
                    {activeTab === 'active' && order.status === 'out_for_delivery' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Mark Delivered
                      </button>
                    )}
                    
                    {activeTab === 'returns' && order.status === 'return_initiated' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'return_in_transit')}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Picked Up
                      </button>
                    )}
                    
                    {activeTab === 'returns' && order.status === 'return_in_transit' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'returned')}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Mark Returned
                      </button>
                    )}
                    
                    <button
                      onClick={() => navigate(`/delivery-order-details/${order.id}`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard; 