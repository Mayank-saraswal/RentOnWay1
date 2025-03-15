import React, { useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const ReturnInspectionForm = ({ returnData, onComplete }) => {
  const { backendUrl, token } = useContext(ShopContext);
  const [loading, setLoading] = useState(false);
  const [productCondition, setProductCondition] = useState('excellent');
  const [qualityIssues, setQualityIssues] = useState([]);
  const [comments, setComments] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  // Possible product conditions
  const conditions = [
    { value: 'excellent', label: 'Excellent - Like New' },
    { value: 'good', label: 'Good - Minor Wear' },
    { value: 'fair', label: 'Fair - Visible Wear' },
    { value: 'poor', label: 'Poor - Significant Damage' }
  ];

  // Possible quality issues
  const possibleIssues = [
    { value: 'stains', label: 'Stains or Marks' },
    { value: 'tears', label: 'Tears or Rips' },
    { value: 'missing_parts', label: 'Missing Parts' },
    { value: 'broken', label: 'Broken Components' },
    { value: 'odor', label: 'Unpleasant Odor' },
    { value: 'color_fade', label: 'Color Fading' }
  ];

  // Handle condition change
  const handleConditionChange = (e) => {
    setProductCondition(e.target.value);
  };

  // Handle issue toggle
  const handleIssueToggle = (issueValue) => {
    if (qualityIssues.includes(issueValue)) {
      setQualityIssues(qualityIssues.filter(issue => issue !== issueValue));
    } else {
      setQualityIssues([...qualityIssues, issueValue]);
    }
  };

  // Handle comments change
  const handleCommentsChange = (e) => {
    setComments(e.target.value);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 5 images
    if (files.length + images.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }
    
    setImages([...images, ...files]);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviews]);
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreview];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreview(newPreviews);
  };

  // Submit inspection
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast.error('Please upload at least one image of the product');
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('returnId', returnData.id);
      formData.append('condition', productCondition);
      formData.append('issues', JSON.stringify(qualityIssues));
      formData.append('comments', comments);
      
      // Append images
      images.forEach((image, index) => {
        formData.append('images', image);
      });
      
      const response = await fetch(`${backendUrl}/api/returns/inspection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Inspection submitted successfully');
        onComplete(data);
      } else {
        toast.error(data.message || 'Failed to submit inspection');
      }
    } catch (error) {
      console.error('Error submitting inspection:', error);
      toast.error('An error occurred while submitting inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Product Return Inspection</h2>
      <p className="text-gray-600 mb-6">
        Please inspect the product carefully and document its condition with photos.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Condition
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conditions.map((condition) => (
              <label 
                key={condition.value} 
                className={`flex items-center p-3 border rounded-md cursor-pointer ${
                  productCondition === condition.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value={condition.value}
                  checked={productCondition === condition.value}
                  onChange={handleConditionChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span>{condition.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Quality Issues */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quality Issues (if any)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {possibleIssues.map((issue) => (
              <label 
                key={issue.value} 
                className={`flex items-center p-2 border rounded-md cursor-pointer ${
                  qualityIssues.includes(issue.value) 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  value={issue.value}
                  checked={qualityIssues.includes(issue.value)}
                  onChange={() => handleIssueToggle(issue.value)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 mr-2"
                />
                <span>{issue.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Comments
          </label>
          <textarea
            value={comments}
            onChange={handleCommentsChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the product condition in detail..."
          ></textarea>
        </div>
        
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images (Max 5)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <p className="mb-1 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5 MB each)</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                multiple 
                onChange={handleImageUpload}
                disabled={images.length >= 5}
              />
            </label>
          </div>
          
          {/* Image Previews */}
          {imagePreview.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {imagePreview.map((src, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={src} 
                    alt={`Preview ${index + 1}`} 
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition"
          >
            {loading ? 'Submitting...' : 'Submit Inspection'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReturnInspectionForm;