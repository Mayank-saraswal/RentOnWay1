import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { format } from 'date-fns';
import Title from '../components/Title';
import ReturnInspectionForm from '../components/ReturnInspectionForm';
import { toast } from 'react-toastify';

const DeliveryReturns = () => {
  const { backendUrl, token, navigate } = useContext(ShopContext);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    // Check if delivery partner is logged in
    if (!token) {
      toast.error('Please login as a delivery partner');
      navigate('/delivery-login');
      return;
    }

    // Fetch returns
    fetchReturns();
  }, [token, navigate, activeTab]);

  // Fetch returns from API
  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/returns/delivery?status=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setReturns(data.returns || []);
      } else {
        toast.error(data.message || 'Failed to fetch returns');
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('An error occurred while fetching returns');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  // Handle return selection for inspection
  const handleSelectReturn = (returnData) => {
    setSelectedReturn(returnData);
    setShowInspectionForm(true);
  };

  // Handle inspection completion
  const handleInspectionComplete = (data) => {
    setShowInspectionForm(false);
    setSelectedReturn(null);
    // Refresh returns list
    fetchReturns();
  };

  // Get address display
  const getAddressDisplay = (address) => {
    if (!address) return 'Address not available';
    
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-2xl mb-6">
        <Title text1={'DELIVERY'} text2={'RETURNS'} />
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'pending'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Pickups
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'completed'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('completed')}
        >
          Completed Returns
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Returns Found</h2>
          <p className="text-gray-600">
            {activeTab === 'pending'
              ? 'There are no pending returns to pick up.'
              : 'You have not completed any returns yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {returns.map((returnItem) => (
            <div key={returnItem.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image */}
                  <div className="w-full md:w-1/4">
                    <img 
                      src={returnItem.product.image[0]} 
                      alt={returnItem.product.name} 
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                  
                  {/* Return Details */}
                  <div className="w-full md:w-3/4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold">{returnItem.product.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activeTab === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {activeTab === 'pending' ? 'Pending Pickup' : 'Completed'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">Return ID</p>
                        <p className="font-medium">{returnItem.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Size</p>
                        <p className="font-medium">{returnItem.size}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pickup Date</p>
                        <p className="font-medium">{formatDate(returnItem.pickupDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time Slot</p>
                        <p className="font-medium capitalize">{returnItem.pickupTimeSlot}</p>
                      </div>
                    </div>
                    
                    {/* Customer Details */}
                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                      <h4 className="font-semibold mb-2">Customer Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium">{returnItem.customer.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{returnItem.customer.phone}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium">{getAddressDisplay(returnItem.customer.address)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    {returnItem.additionalNotes && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">Additional Notes</p>
                        <p className="italic text-gray-700">{returnItem.additionalNotes}</p>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    {activeTab === 'pending' && (
                      <div className="mt-6">
                        <button
                          onClick={() => handleSelectReturn(returnItem)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                        >
                          Process Return
                        </button>
                      </div>
                    )}
                    
                    {/* Inspection Details */}
                    {activeTab === 'completed' && returnItem.inspection && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Inspection Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Condition</p>
                            <p className="font-medium capitalize">{returnItem.inspection.condition}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Completed On</p>
                            <p className="font-medium">{formatDate(returnItem.completedDate)}</p>
                          </div>
                        </div>
                        
                        {returnItem.inspection.issues && returnItem.inspection.issues.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Issues</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {returnItem.inspection.issues.map((issue, index) => (
                                <span 
                                  key={index} 
                                  className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
                                >
                                  {issue.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {returnItem.inspection.comments && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Comments</p>
                            <p className="italic text-gray-700">{returnItem.inspection.comments}</p>
                          </div>
                        )}
                        
                        {/* Inspection Images */}
                        {returnItem.inspection.images && returnItem.inspection.images.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Inspection Images</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                              {returnItem.inspection.images.map((image, index) => (
                                <a 
                                  key={index} 
                                  href={`${backendUrl}/${image}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <img 
                                    src={`${backendUrl}/${image}`} 
                                    alt={`Inspection ${index + 1}`} 
                                    className="w-full h-20 object-cover rounded-md"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspection Form Modal */}
      {showInspectionForm && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Process Return</h2>
              <button
                onClick={() => setShowInspectionForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <ReturnInspectionForm 
              returnData={selectedReturn} 
              onComplete={handleInspectionComplete} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryReturns; 