import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const CollegeWear = () => {
    const { products } = useContext(ShopContext);
    const [collegeWear, setCollegeWear] = useState([]);

    useEffect(() => {
        // Filter products for college wear (you might want to add a category field in your products)
        // For now, we'll just use a slice of products as an example
        setCollegeWear(products.slice(5, 13));
    }, [products]);

    return (
        <div className='my-16 bg-gray-50 py-12 px-4'>
            <div className='text-center py-8'>
                <Title text1={'COLLEGE'} text2={'WEAR'} />
                <p className='w-3/4 m-auto text-sm md:text-base text-gray-600 mb-4'>
                    Perfect outfits for campus life - comfortable, stylish, and affordable to rent.
                </p>
            </div>

            {/* College Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="relative group cursor-pointer overflow-hidden rounded-lg">
                    <img src={assets.fashion_img3} alt="Casual Wear" className="w-full h-64 object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <h3 className="text-white text-xl font-bold">Casual Wear</h3>
                    </div>
                </div>
                <div className="relative group cursor-pointer overflow-hidden rounded-lg">
                    <img src={assets.fashion_img4} alt="Presentation Attire" className="w-full h-64 object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <h3 className="text-white text-xl font-bold">Presentation Attire</h3>
                    </div>
                </div>
                <div className="relative group cursor-pointer overflow-hidden rounded-lg">
                    <img src={assets.fashion_img5} alt="Campus Events" className="w-full h-64 object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <h3 className="text-white text-xl font-bold">Campus Events</h3>
                    </div>
                </div>
                <div className="relative group cursor-pointer overflow-hidden rounded-lg">
                    <img src={assets.fashion_img6} alt="Weekend Outings" className="w-full h-64 object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <h3 className="text-white text-xl font-bold">Weekend Outings</h3>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <h3 className="text-xl font-semibold mb-6 text-center">Popular College Rentals</h3>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 gap-y-10'>
                {collegeWear.map((item, index) => (
                    <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
                ))}
            </div>

            {/* Student Discount Banner */}
            <div className="mt-16 bg-blue-600 text-white p-8 rounded-lg text-center">
                <h3 className="text-2xl font-bold mb-3">Student Special: 15% Off Your First Rental</h3>
                <p className="mb-6">Use code STUDENT15 at checkout. Valid student ID required.</p>
                <Link 
                    to="/collection?category=college" 
                    className="inline-block bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                >
                    Browse College Collection
                </Link>
            </div>
        </div>
    )
}

export default CollegeWear 