import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { format, isAfter } from 'date-fns';
import Title from '../components/Title';
import ReturnModal from '../components/ReturnModal';
import { toast } from 'react-toastify';

const MyRentals = () => {
  const { backendUrl, token, currency, formatCurrency, navigate } = useContext(ShopContext);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (!token) {
      toast.error('Please login to view your rentals');
      navigate('/login');
      return;
    }

    // Fetch user's rentals
    fetchRentals();
  }, [token, navigate]);

  // Fetch rentals from API
  const fetchRentals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/rentals/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setRentals(data.rentals || []);
      } else {
        toast.error(data.message || 'Failed to fetch rentals');
      }
    } catch (error) {
      console.error('Error fetching rentals:', error);
      toast.error('An error occurred while fetching rentals');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  // Check if rental period has ended
  const isRentalEnded = (endDate) => {
    return isAfter(new Date(), new Date(endDate));
  };

  // Get rental status
  const getRentalStatus = (rental) => {
    if (rental.returnStatus === 'completed') {
      return { label: 'Returned', color: 'bg-green-100 text-green-800' };
    } else if (rental.returnStatus === 'pending') {
      return { label: 'Return Pending', color: 'bg-yellow-100 text-yellow-800' };
    } else if (isRentalEnded(rental.endDate)) {
      return { label: 'Return Due', color: 'bg-red-100 text-red-800' };
    } else {
      return { label: 'Active', color: 'bg-blue-100 text-blue-800' };
    }
  };

  // Handle return initiation
  const handleInitiateReturn = (rental) => {
    setSelectedRental(rental);
    setShowReturnModal(true);
  };

  // Handle return modal close
  const handleReturnModalClose = () => {
    setShowReturnModal(false);
    setSelectedRental(null);
    // Refresh rentals list
    fetchRentals();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-2xl mb-6">
        <Title text1={'MY'} text2={'RENTALS'} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : rentals.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Rentals Found</h2>
          <p className="text-gray-600 mb-4">You haven't rented any products yet.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {rentals.map((rental) => {
            const status = getRentalStatus(rental);
            
            return (
              <div key={rental.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Product Image */}
                    <div className="w-full md:w-1/4">
                      <img 
                        src={rental.product.image[0]} 
                        alt={rental.product.name} 
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                    
                    {/* Rental Details */}
                    <div className="w-full md:w-3/4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold">{rental.product.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600">Size</p>
                          <p className="font-medium">{rental.size}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Order Date</p>
                          <p className="font-medium">{formatDate(rental.orderDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Rental Period</p>
                          <p className="font-medium">{formatDate(rental.startDate)} - {formatDate(rental.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Cost</p>
                          <p className="font-medium">{currency}{formatCurrency(rental.totalCost)}</p>
                        </div>
                      </div>
                      
                      {/* Return Button */}
                      {(isRentalEnded(rental.endDate) && rental.returnStatus !== 'completed' && rental.returnStatus !== 'pending') && (
                        <div className="mt-6">
                          <button
                            onClick={() => handleInitiateReturn(rental)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                          >
                            Initiate Return
                          </button>
                        </div>
                      )}
                      
                      {/* Return Details */}
                      {rental.returnStatus === 'pending' && (
                        <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                          <h4 className="font-semibold text-yellow-800 mb-2">Return Scheduled</h4>
                          <p className="text-sm text-yellow-700">
                            Pickup scheduled for {formatDate(rental.returnDetails.pickupDate)} 
                            ({rental.returnDetails.pickupTimeSlot})
                          </p>
                        </div>
                      )}
                      
                      {rental.returnStatus === 'completed' && (
                        <div className="mt-4 bg-green-50 p-4 rounded-md">
                          <h4 className="font-semibold text-green-800 mb-2">Return Completed</h4>
                          <p className="text-sm text-green-700">
                            Product returned on {formatDate(rental.returnDetails.completedDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedRental && (
        <ReturnModal 
          rental={selectedRental} 
          onClose={handleReturnModalClose} 
        />
      )}
    </div>
  );
};

export default MyRentals; 