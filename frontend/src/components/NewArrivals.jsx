import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const NewArrivals = () => {
    const { products, formatCurrency } = useContext(ShopContext);
    const [newArrivals, setNewArrivals] = useState([]);

    useEffect(() => {
        // Get the most recent products (assuming they are sorted by date in the API)
        setNewArrivals(products.slice(0, 8));
    }, [products]);

    return (
        <div className='my-16'>
            <div className='text-center py-8'>
                <Title text1={'NEW'} text2={'ARRIVALS'} />
                <p className='w-3/4 m-auto text-sm md:text-base text-gray-600 mb-4'>
                    Discover our latest additions to the collection. Be the first to rent these trending pieces.
                </p>
            </div>

            {/* Featured Banner */}
            <div className="relative mb-12 overflow-hidden rounded-lg">
                <img 
                    src={assets.fashion_img2} 
                    alt="New Arrivals" 
                    className="w-full h-[300px] md:h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white p-6">
                    <h3 className="text-2xl md:text-4xl font-bold mb-4">Fresh Styles Just Landed</h3>
                    <p className="text-lg mb-6 max-w-2xl text-center">
                        Be the first to rent our newest designer pieces before they're gone
                    </p>
                    <Link 
                        to="/collection" 
                        className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                    >
                        Shop New Arrivals
                    </Link>
                </div>
            </div>

            {/* Products Grid */}
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 gap-y-10'>
                {newArrivals.map((item, index) => (
                    <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
                ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-10">
                <Link 
                    to="/collection" 
                    className="inline-block border-2 border-black px-8 py-3 font-medium hover:bg-black hover:text-white transition"
                >
                    View All New Arrivals
                </Link>
            </div>
        </div>
    )
}

export default NewArrivals 