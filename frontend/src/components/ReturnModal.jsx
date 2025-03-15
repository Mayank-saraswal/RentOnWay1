import React, { useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const ReturnModal = ({ rental, onClose }) => {
  const { backendUrl, token, formatCurrency, currency } = useContext(ShopContext);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Schedule, 2: Confirmation
  const [pickupDate, setPickupDate] = useState(new Date());
  const [pickupTimeSlot, setPickupTimeSlot] = useState('morning');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [returnId, setReturnId] = useState(null);

  // Format date for display
  const formatDate = (date) => {
    return format(new Date(date), 'dd MMM yyyy');
  };

  // Format date for input
  const formatDateForInput = (date) => {
    return format(new Date(date), 'yyyy-MM-dd');
  };

  // Handle pickup date change
  const handleDateChange = (e) => {
    setPickupDate(new Date(e.target.value));
  };

  // Handle time slot change
  const handleTimeSlotChange = (slot) => {
    setPickupTimeSlot(slot);
  };

  // Handle notes change
  const handleNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };

  // Schedule pickup
  const handleSchedulePickup = async () => {
    if (!pickupDate) {
      toast.error('Please select a pickup date');
      return;
    }

    setLoading(true);

    try {
      // API call to schedule pickup
      const response = await fetch(`${backendUrl}/api/returns/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rentalId: rental.id,
          productId: rental.product._id,
          pickupDate,
          pickupTimeSlot,
          additionalNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        setReturnId(data.returnId);
        setStep(2);
        toast.success('Pickup scheduled successfully');
      } else {
        toast.error(data.message || 'Failed to schedule pickup');
      }
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      toast.error('An error occurred while scheduling pickup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Return Product</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 1 ? (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Rental Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-medium">{rental.product.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Size</p>
                    <p className="font-medium">{rental.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rental Period</p>
                    <p className="font-medium">{formatDate(rental.startDate)} - {formatDate(rental.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Rental Cost</p>
                    <p className="font-medium">{currency}{formatCurrency(rental.totalCost)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Schedule Pickup</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={formatDateForInput(pickupDate)}
                    min={formatDateForInput(new Date())}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['morning', 'afternoon', 'evening'].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`py-2 border ${
                          pickupTimeSlot === slot
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        } rounded-md text-sm font-medium capitalize`}
                        onClick={() => handleTimeSlotChange(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Morning: 9AM-12PM, Afternoon: 12PM-4PM, Evening: 4PM-8PM
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={additionalNotes}
                    onChange={handleNotesChange}
                    rows="3"
                    placeholder="Any special instructions for pickup..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSchedulePickup}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
              >
                {loading ? 'Scheduling...' : 'Schedule Pickup'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Pickup Scheduled Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Your return request has been confirmed. A delivery partner will pick up the product on {formatDate(pickupDate)} during the {pickupTimeSlot} time slot.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Return ID: {returnId}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-left mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Instructions:</h4>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                <li>Please ensure the product is clean and in good condition</li>
                <li>Keep all original packaging if possible</li>
                <li>The delivery partner will inspect the product during pickup</li>
                <li>You'll receive a confirmation once the return is processed</li>
              </ul>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-md font-medium transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnModal; 