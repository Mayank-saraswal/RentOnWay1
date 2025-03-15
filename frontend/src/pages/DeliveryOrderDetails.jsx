import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const DeliveryOrderDetails = () => {
  const { token, backendUrl } = useContext(ShopContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const { orderId } = useParams();
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

    fetchOrderDetails();
  }, [token, orderId, navigate]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/delivery-partners/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch order details');
        navigate('/delivery-dashboard');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch order details');
      navigate('/delivery-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (status) => {
    setStatusUpdateLoading(true);
    try {
      const response = await axios.put(
        `${backendUrl}/api/delivery-partners/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(`Order ${status.replace('_', ' ')} successfully`);
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setStatusUpdateLoading(false);
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
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="spinner"></div>
        <p className="mt-2">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-4">The order you are looking for does not exist or you don't have permission to view it.</p>
        <button
          onClick={() => navigate('/delivery-dashboard')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <button
          onClick={() => navigate('/delivery-dashboard')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Order #{order.orderNumber}</h2>
            <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="mt-2 md:mt-0">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
              {formatStatus(order.status)}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{order.user?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{order.user?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4">
          <h3 className="text-lg font-semibold mb-2">Delivery Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Address</p>
              <p className="font-medium">{order.deliveryAddress}</p>
              <p className="font-medium">
                {order.city}, {order.state} - {order.pincode}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Delivery Date</p>
              <p className="font-medium">{formatDate(order.deliveryDate)}</p>
              {order.status === 'return_initiated' || order.status === 'return_in_transit' || order.status === 'returned' ? (
                <>
                  <p className="text-gray-600 mt-2">Return Date</p>
                  <p className="font-medium">{formatDate(order.returnDate)}</p>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4">
          <h3 className="text-lg font-semibold mb-2">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rental Period
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.OrderItems?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={item.product?.images && item.product.images.length > 0 
                              ? `${backendUrl}/${item.product.images[0]}` 
                              : 'https://via.placeholder.com/40'}
                            alt={item.product?.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name || 'Product Name'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.size || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.startDate)} - {formatDate(order.endDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.totalDays} days
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4">
          <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Rental Amount:</span>
                <span>₹{order.rentalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Security Deposit:</span>
                <span>₹{order.securityDepositAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Delivery Fee:</span>
                <span>₹{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Tax:</span>
                <span>₹{order.taxAmount.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Discount:</span>
                  <span>-₹{order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 font-bold border-t border-gray-200 mt-2 pt-2">
                <span>Total:</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Payment Method:</span>
                <span className="capitalize">{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Payment Status:</span>
                <span className="capitalize">{order.paymentStatus.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 mt-6 pt-6 flex flex-wrap gap-3 justify-end">
          {order.status === 'confirmed' && (
            <button
              onClick={() => handleUpdateOrderStatus('out_for_delivery')}
              disabled={statusUpdateLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-blue-300"
            >
              {statusUpdateLoading ? 'Updating...' : 'Mark as Out for Delivery'}
            </button>
          )}
          
          {order.status === 'out_for_delivery' && (
            <button
              onClick={() => handleUpdateOrderStatus('delivered')}
              disabled={statusUpdateLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:bg-green-300"
            >
              {statusUpdateLoading ? 'Updating...' : 'Mark as Delivered'}
            </button>
          )}
          
          {order.status === 'return_initiated' && (
            <button
              onClick={() => handleUpdateOrderStatus('return_in_transit')}
              disabled={statusUpdateLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-blue-300"
            >
              {statusUpdateLoading ? 'Updating...' : 'Mark as Picked Up for Return'}
            </button>
          )}
          
          {order.status === 'return_in_transit' && (
            <button
              onClick={() => handleUpdateOrderStatus('returned')}
              disabled={statusUpdateLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:bg-green-300"
            >
              {statusUpdateLoading ? 'Updating...' : 'Mark as Returned'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrderDetails; 