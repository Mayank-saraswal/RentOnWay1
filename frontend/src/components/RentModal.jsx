import React, { useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import DateRangePicker from './DateRangePicker';
import { useNavigate } from 'react-router-dom';

const RentModal = ({ product, onClose }) => {
  const { formatCurrency, currency, addToCart } = useContext(ShopContext);
  const [selectedSize, setSelectedSize] = useState('');
  const [rentalDetails, setRentalDetails] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle date selection from DateRangePicker
  const handleDateChange = (dateRange) => {
    setRentalDetails(dateRange);
  };

  // Handle size selection
  const handleSizeChange = (e) => {
    setSelectedSize(e.target.value);
    setError('');
  };

  // Calculate total rental cost
  const calculateTotal = () => {
    if (!rentalDetails) return 0;
    return product.price * rentalDetails.days;
  };

  // Handle rent now button click
  const handleRentNow = () => {
    if (!selectedSize) {
      setError('Please select a size');
      return;
    }

    if (!rentalDetails || rentalDetails.days < 4) {
      setError('Please select a valid rental period (minimum 4 days)');
      return;
    }

    // Add product to cart with rental details
    addToCart(product._id, selectedSize, 1, {
      rentalStart: rentalDetails.startDate,
      rentalEnd: rentalDetails.endDate,
      rentalDays: rentalDetails.days
    });

    // Navigate to checkout
    navigate('/place-order');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Rent This Item</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <img 
              src={product.image[0]} 
              alt={product.name} 
              className="w-full h-auto rounded-lg"
            />
            <h3 className="text-xl font-semibold mt-4">{product.name}</h3>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-lg font-bold text-blue-600">
              {currency}{formatCurrency(product.price)}/day
            </p>
          </div>

          <div className="space-y-6">
            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Size
              </label>
              <div className="grid grid-cols-5 gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`py-2 border ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    } rounded-md text-sm font-medium`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Picker */}
            <DateRangePicker 
              minDays={4} 
              maxDays={30} 
              onDateChange={handleDateChange} 
            />

            {/* Rental Summary */}
            {rentalDetails && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Rental Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Daily Rate:</span>
                    <span>{currency}{formatCurrency(product.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Days:</span>
                    <span>{rentalDetails.days}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{currency}{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              onClick={handleRentNow}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentModal; 