import React, { useState, useEffect } from 'react';
import { format, addDays, differenceInDays } from 'date-fns';

const DateRangePicker = ({ minDays = 4, maxDays = 30, onDateChange }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), minDays));
  const [totalDays, setTotalDays] = useState(minDays);
  const [error, setError] = useState('');

  // Format dates for display and input value
  const formatDateForInput = (date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // Calculate total days whenever dates change
  useEffect(() => {
    if (startDate && endDate) {
      const days = differenceInDays(endDate, startDate);
      setTotalDays(days);
      
      // Validate minimum rental period
      if (days < minDays) {
        setError(`Minimum rental period is ${minDays} days`);
      } else if (days > maxDays) {
        setError(`Maximum rental period is ${maxDays} days`);
      } else {
        setError('');
        // Call the parent component's callback with valid dates
        onDateChange({
          startDate,
          endDate,
          days
        });
      }
    }
  }, [startDate, endDate, minDays, maxDays, onDateChange]);

  // Handle start date change
  const handleStartDateChange = (e) => {
    const newStartDate = new Date(e.target.value);
    setStartDate(newStartDate);
    
    // If the new start date makes the rental period less than minimum days,
    // adjust the end date automatically
    const currentDays = differenceInDays(endDate, newStartDate);
    if (currentDays < minDays) {
      setEndDate(addDays(newStartDate, minDays));
    }
  };

  // Handle end date change
  const handleEndDateChange = (e) => {
    const newEndDate = new Date(e.target.value);
    setEndDate(newEndDate);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Select Rental Period</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={formatDateForInput(startDate)}
            min={formatDateForInput(new Date())}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={formatDateForInput(endDate)}
            min={formatDateForInput(addDays(startDate, minDays))}
            max={formatDateForInput(addDays(startDate, maxDays))}
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm font-medium text-gray-700">Total Days: </span>
          <span className="text-lg font-bold">{totalDays}</span>
        </div>
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker; 