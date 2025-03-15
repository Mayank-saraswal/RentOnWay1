import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import { assets } from '../assets/assets';
import { Link } from 'react-router-dom';

const PartyWear = () => {
    const { products } = useContext(ShopContext);
    const [partyWear, setPartyWear] = useState([]);

    useEffect(() => {
        // Filter products for party wear
        // For now, we'll just use a slice of products as an example
        setPartyWear(products.slice(10, 18));
    }, [products]);

    return (
        <div className='my-16'>
            <div className='text-center py-8'>
                <Title text1={'PARTY'} text2={'WEAR'} />
                <p className='w-3/4 m-auto text-sm md:text-base text-gray-600 mb-4'>
                    Make a statement at your next event with our stunning party wear collection.
                </p>
            </div>

            {/* Hero Banner */}
            <div className="relative mb-16 overflow-hidden rounded-lg">
                <img 
                    src={assets.fashion_img7} 
                    alt="Party Collection" 
                    className="w-full h-[400px] md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent flex flex-col items-start justify-center text-white p-12">
                    <h3 className="text-3xl md:text-5xl font-bold mb-4">Shine at Every Party</h3>
                    <p className="text-lg mb-6 max-w-md">
                        Rent designer party wear for a fraction of the retail price
                    </p>
                    <Link 
                        to="/collection?category=party" 
                        className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition"
                    >
                        Explore Party Collection
                    </Link>
                </div>
            </div>

            {/* Party Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="relative group cursor-pointer overflow-hidden rounded-lg">
                    <img src={assets.fashion_img8} alt="Cocktail Dresses" className="w-full h-80 object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <h3 className="text-white text-2xl font-bold">Cocktail Dresses</h3>
                    </div>
                </div>
                <div className="relative group cursor-pointer overflow-hidden rounded-lg">
                    <img src={assets.fashion_img9} alt="Evening Gowns" className="w-full h-80 object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <h3 className="text-white text-2xl font-bold">Evening Gowns</h3>
                    </div>
                </div>
                <div className="relative group cursor-pointer overflow-hidden rounded-lg">
                    <img src={assets.fashion_img10} alt="Formal Suits" className="w-full h-80 object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <h3 className="text-white text-2xl font-bold">Formal Suits</h3>
                    </div>
                </div>
            </div>

            {/* Featured Products */}
            <h3 className="text-xl font-semibold mb-6 text-center">Trending Party Outfits</h3>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 gap-y-10'>
                {partyWear.map((item, index) => (
                    <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} />
                ))}
            </div>

            {/* Party Tips */}
            <div className="mt-16 bg-gray-900 text-white p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-6 text-center">Party Styling Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white text-gray-900 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                        <h4 className="text-xl font-semibold mb-2">Choose the Right Fit</h4>
                        <p className="text-gray-300">Rent a size up and down to ensure the perfect fit for your special night.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white text-gray-900 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                        <h4 className="text-xl font-semibold mb-2">Accessorize Wisely</h4>
                        <p className="text-gray-300">Add our curated accessories to complete your party look.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white text-gray-900 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                        <h4 className="text-xl font-semibold mb-2">Plan Ahead</h4>
                        <p className="text-gray-300">Book your party outfit at least a week in advance for popular events.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PartyWear 