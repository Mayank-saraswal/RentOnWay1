import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const FestivalWear = () => {
    const { products } = useContext(ShopContext);
    const [festivalWear, setFestivalWear] = useState([]);

    useEffect(() => {
        // Filter products for festival wear
        // For now, we'll just use a slice of products as an example
        setFestivalWear(products.slice(8, 16));
    }, [products]);

    return (
        <div className='my-16'>
            <div className='text-center py-8'>
                <Title text1={'FESTIVAL'} text2={'WEAR'} />
                <p className='w-3/4 m-auto text-sm md:text-base text-gray-600 mb-4'>
                    Celebrate festivals in style with our curated collection of traditional and fusion outfits.
                </p>
            </div>

            {/* Festival Banner */}
            <div className="relative mb-16 overflow-hidden rounded-lg">
                <img 
                    src={assets.fashion_img16} 
                    alt="Festival Collection" 
                    className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-transparent flex flex-col items-start justify-center text-white p-12">
                    <h3 className="text-3xl md:text-5xl font-bold mb-4">Festival Season is Here!</h3>
                    <p className="text-lg mb-6 max-w-md">
                        Rent stunning outfits for Diwali, Holi, Navratri and more
                    </p>
                    <Link 
                        to="/collection?category=festival" 
                        className="bg-white text-orange-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                    >
                        Explore Festival Collection
                    </Link>
                </div>
            </div>

            {/* Festival Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="relative group cursor-pointer overflow-hidden rounded-lg">
                    <img src={assets.fashion_img17} alt="Diwali Collection" className="w-full h-80 object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end justify-center p-6">
                        <div className="text-center">
                            <h3 className="text-white text-2xl font-bold mb-2">Diwali Collection</h3>
                            <Link 
                                to="/collection?category=diwali" 
                                className="inline-block bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
                            >
                                View Collection
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="relative group cursor-pointer overflow-hidden rounded-lg">
                    <img src={assets.fashion_img18} alt="Navratri Special" className="w-full h-80 object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end justify-center p-6">
                        <div className="text-center">
                            <h3 className="text-white text-2xl font-bold mb-2">Navratri Special</h3>
                            <Link 
                                to="/collection?category=navratri" 
                                className="inline-block bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
                            >
                                View Collection
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="relative group cursor-pointer overflow-hidden rounded-lg">
                    <img src={assets.fashion_img19} alt="Holi Celebration" className="w-full h-80 object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end justify-center p-6">
                        <div className="text-center">
                            <h3 className="text-white text-2xl font-bold mb-2">Holi Celebration</h3>
                            <Link 
                                to="/collection?category=holi" 
                                className="inline-block bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition"
                            >
                                View Collection
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <h3 className="text-xl font-semibold mb-6 text-center">Trending Festival Outfits</h3>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 gap-y-10'>
                {festivalWear.map((item, index) => (
                    <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
                ))}
            </div>

            {/* Festival Tips */}
            <div className="mt-16 bg-orange-50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-6 text-center text-orange-800">Festival Fashion Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
                        <h4 className="text-lg font-semibold mb-2 text-orange-800">Book in Advance</h4>
                        <p className="text-gray-600">Festival outfits are in high demand. Book at least 2 weeks in advance to secure your favorite pieces.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
                        <h4 className="text-lg font-semibold mb-2 text-orange-800">Accessorize Right</h4>
                        <p className="text-gray-600">Complete your festival look with our matching jewelry and accessories available for rent.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
                        <h4 className="text-lg font-semibold mb-2 text-orange-800">Comfort is Key</h4>
                        <p className="text-gray-600">Choose outfits that allow you to move freely and enjoy the festivities comfortably.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FestivalWear; 