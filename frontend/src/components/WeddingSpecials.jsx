import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const WeddingSpecials = () => {
    const { products } = useContext(ShopContext);
    const [weddingWear, setWeddingWear] = useState([]);

    useEffect(() => {
        // Filter products for wedding wear
        // For now, we'll just use a slice of products as an example
        setWeddingWear(products.slice(15, 23));
    }, [products]);

    return (
        <div className='my-16'>
            <div className='text-center py-8'>
                <Title text1={'WEDDING'} text2={'SPECIALS'} />
                <p className='w-3/4 m-auto text-sm md:text-base text-gray-600 mb-4'>
                    Elegant outfits for every wedding occasion - from engagement to reception.
                </p>
            </div>

            {/* Wedding Banner */}
            <div className="relative mb-16 overflow-hidden rounded-lg">
                <img 
                    src={assets.fashion_img11} 
                    alt="Wedding Collection" 
                    className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-white p-12">
                    <h3 className="text-4xl md:text-6xl font-bold mb-4">Celebrate in Style</h3>
                    <p className="text-xl mb-8 max-w-2xl text-center">
                        Rent premium wedding attire without the premium price tag
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link 
                            to="/collection?category=bride" 
                            className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                        >
                            Bride Collection
                        </Link>
                        <Link 
                            to="/collection?category=groom" 
                            className="bg-transparent text-white border-2 border-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-black transition"
                        >
                            Groom Collection
                        </Link>
                    </div>
                </div>
            </div>

            {/* Wedding Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                <Link to="/collection?category=engagement" className="group">
                    <div className="relative overflow-hidden rounded-lg">
                        <img src={assets.fashion_img12} alt="Engagement" className="w-full h-72 object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <h3 className="text-white text-xl font-bold">Engagement</h3>
                        </div>
                    </div>
                </Link>
                <Link to="/collection?category=sangeet" className="group">
                    <div className="relative overflow-hidden rounded-lg">
                        <img src={assets.fashion_img13} alt="Sangeet & Mehndi" className="w-full h-72 object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <h3 className="text-white text-xl font-bold">Sangeet & Mehndi</h3>
                        </div>
                    </div>
                </Link>
                <Link to="/collection?category=wedding" className="group">
                    <div className="relative overflow-hidden rounded-lg">
                        <img src={assets.fashion_img14} alt="Wedding Day" className="w-full h-72 object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <h3 className="text-white text-xl font-bold">Wedding Day</h3>
                        </div>
                    </div>
                </Link>
                <Link to="/collection?category=reception" className="group">
                    <div className="relative overflow-hidden rounded-lg">
                        <img src={assets.fashion_img15} alt="Reception" className="w-full h-72 object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <h3 className="text-white text-xl font-bold">Reception</h3>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Featured Products */}
            <h3 className="text-xl font-semibold mb-6 text-center">Most Rented Wedding Outfits</h3>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 gap-y-10'>
                {weddingWear.map((item, index) => (
                    <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
                ))}
            </div>
        </div>
    );
};

export default WeddingSpecials; 