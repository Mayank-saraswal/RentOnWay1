import React, { useContext, useState, useEffect } from 'react'
import {assets} from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
    const [visible, setVisible] = useState(false);
    const [profileDropdown, setProfileDropdown] = useState(false);

    const { setShowSearch, getCartCount, navigate } = useContext(ShopContext);
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    
    // Get user role from context
    const userRole = user?.role || 'customer';

    const handleLogout = async () => {
        try {
            await logout();
            setProfileDropdown(false);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    };

    return (
        <div className='flex justify-between items-center py-4 relative'>
            <Link to='/'>
                <div className='flex items-center gap-2'>
                    <img src={assets.logo} alt="logo" className='w-8 h-8' />
                    <h1 className='text-xl font-bold'>RentOnWay</h1>
                </div>
            </Link>
            <div className='hidden md:flex gap-8 items-center'>
                <NavLink to='/' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'}>Home</NavLink>
                <NavLink to='/collection' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'}>Collection</NavLink>
                <NavLink to='/about' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'}>About</NavLink>
                <NavLink to='/contact' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'}>Contact</NavLink>
                
                {/* Show role-specific links based on user role */}
                {isAuthenticated && userRole === 'seller' && (
                    <NavLink to='/seller-dashboard' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'}>Dashboard</NavLink>
                )}
                
                {isAuthenticated && userRole === 'delivery' && (
                    <NavLink to='/delivery-dashboard' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'}>Dashboard</NavLink>
                )}
                
                {isAuthenticated && userRole === 'customer' && (
                    <>
                        <NavLink to='/orders' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'}>Orders</NavLink>
                        <NavLink to='/my-rentals' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'}>Rentals</NavLink>
                    </>
                )}
            </div>
            <div className='hidden md:flex gap-4 items-center'>
                <div className='cursor-pointer' onClick={() => setShowSearch(true)}>
                    <img src={assets.search_icon} alt="search" className='w-5 h-5' />
                </div>
                <Link to='/cart'>
                    <div className='relative'>
                        <img src={assets.cart_icon} alt="cart" className='w-5 h-5' />
                        {getCartCount() > 0 && (
                            <div className='absolute -top-2 -right-2 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs'>
                                {getCartCount()}
                            </div>
                        )}
                    </div>
                </Link>
                
                {!isLoading && (
                    isAuthenticated ? (
                        <div className="relative">
                            <button 
                                onClick={() => setProfileDropdown(!profileDropdown)}
                                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                            >
                                <span className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </button>
                            
                            {profileDropdown && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                        <p className="font-medium">{user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setProfileDropdown(false)}>
                                        Profile
                                    </Link>
                                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setProfileDropdown(false)}>
                                        Orders
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to='/login'>
                            <button className='bg-primary text-white px-4 py-2 rounded-md'>Sign In</button>
                        </Link>
                    )
                )}
            </div>
            <div className='md:hidden cursor-pointer' onClick={() => setVisible(true)}>
                <img src={assets.hamburger} alt="menu" className='w-6 h-6' />
            </div>
            {visible && (
                <div className='fixed top-0 left-0 w-full h-full bg-white z-50 p-4'>
                    <div className='flex justify-between items-center mb-8'>
                        <div className='flex items-center gap-2'>
                            <img src={assets.logo} alt="logo" className='w-8 h-8' />
                            <h1 className='text-xl font-bold'>RentOnWay</h1>
                        </div>
                        <div className='cursor-pointer' onClick={() => setVisible(false)}>
                            <img src={assets.close_icon} alt="close" className='w-6 h-6' />
                        </div>
                    </div>
                    <div className='flex flex-col gap-4'>
                        <NavLink to='/' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'} onClick={() => setVisible(false)}>Home</NavLink>
                        <NavLink to='/collection' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'} onClick={() => setVisible(false)}>Collection</NavLink>
                        <NavLink to='/about' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'} onClick={() => setVisible(false)}>About</NavLink>
                        <NavLink to='/contact' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'} onClick={() => setVisible(false)}>Contact</NavLink>
                        
                        {/* Show role-specific links based on user role */}
                        {isAuthenticated && userRole === 'seller' && (
                            <NavLink to='/seller-dashboard' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'} onClick={() => setVisible(false)}>Seller Dashboard</NavLink>
                        )}
                        
                        {isAuthenticated && userRole === 'delivery' && (
                            <NavLink to='/delivery-dashboard' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'} onClick={() => setVisible(false)}>Delivery Dashboard</NavLink>
                        )}
                        
                        {isAuthenticated && userRole === 'customer' && (
                            <>
                                <NavLink to='/orders' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'} onClick={() => setVisible(false)}>My Orders</NavLink>
                                <NavLink to='/my-rentals' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'} onClick={() => setVisible(false)}>My Rentals</NavLink>
                                <NavLink to='/profile' className={({isActive}) => isActive ? 'text-primary font-medium' : 'hover:text-primary'} onClick={() => setVisible(false)}>Profile</NavLink>
                            </>
                        )}
                        
                        <div className='flex items-center gap-4 mt-4'>
                            <div className='cursor-pointer' onClick={() => {setShowSearch(true); setVisible(false)}}>
                                <img src={assets.search_icon} alt="search" className='w-5 h-5' />
                            </div>
                            <Link to='/cart' onClick={() => setVisible(false)}>
                                <div className='relative'>
                                    <img src={assets.cart_icon} alt="cart" className='w-5 h-5' />
                                    {getCartCount() > 0 && (
                                        <div className='absolute -top-2 -right-2 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-xs'>
                                            {getCartCount()}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            
                            {!isLoading && (
                                isAuthenticated ? (
                                    <button
                                        onClick={handleLogout}
                                        className="bg-primary text-white px-4 py-2 rounded-md"
                                    >
                                        Sign out
                                    </button>
                                ) : (
                                    <Link to='/login' onClick={() => setVisible(false)}>
                                        <button className='bg-primary text-white px-4 py-2 rounded-md'>Sign In</button>
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Navbar
