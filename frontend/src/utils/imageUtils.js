/**
 * Utility function to format image URLs
 * This ensures that image paths from the backend are properly formatted
 * @param {string} imagePath - The image path from the backend
 * @returns {string} - The properly formatted image URL
 */
export const formatImageUrl = (imagePath) => {
  // If the image path is already a full URL, return it as is
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path from the uploads directory
  if (imagePath.startsWith('uploads/')) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}/${imagePath}`;
  }
  
  // For local assets imported in the frontend
  return imagePath;
}; 