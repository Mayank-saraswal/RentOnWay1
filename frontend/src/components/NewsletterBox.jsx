import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const NewsletterBox = () => {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Thank you for subscribing to our newsletter!')
    setEmail('')
  }

  return (
    <div className="my-16">
      {/* Newsletter Section */}
      <div className="bg-gray-100 p-8 rounded-lg mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 mb-6">Stay updated with our latest products and exclusive offers.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
      
      {/* Become a Seller Section */}
      <div className="bg-blue-50 p-8 rounded-lg">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Become a Seller on RentOnway</h2>
          <p className="text-gray-600 mb-6">
            Have premium products you'd like to rent out? Join our platform and start earning today!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/seller-login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Register as Seller
            </Link>
            
            <a
              href="#benefits"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
      
      {/* Seller Benefits Section */}
      <div id="benefits" className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Why Sell on RentOnway?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2">Earn Extra Income</h3>
            <p className="text-gray-600">Make money from your premium products when you're not using them.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
            <p className="text-gray-600">You decide when your items are available for rent.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
            <p className="text-gray-600">Our verification system ensures your items are in safe hands.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsletterBox
