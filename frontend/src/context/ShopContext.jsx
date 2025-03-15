import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import * as api from '../services/api';

export const ShopContext = createContext(null);

const ShopContextProvider = (props) => {
    const currency = '₹';
    const delivery_fee = 99;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [rentalDetails, setRentalDetails] = useState({});
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // Use Appwrite authentication
    const { user, isAuthenticated } = useAuth();

    // Format currency in Indian Rupee format
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount).replace('₹', ''); // Remove the currency symbol as we add it separately
    };

    // Fetch cart items when user changes
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchCartItems();
        } else {
            setCartItems({});
        }
    }, [isAuthenticated, user]);

    // Fetch cart items from API
    const fetchCartItems = async () => {
        if (!isAuthenticated) return;
        
        try {
            setLoading(true);
            const response = await api.getCart();
            
            if (response.success) {
                setCartItems(response.data.items || {});
                
                // Set rental details if available
                if (response.data.rentalDetails) {
                    setRentalDetails(response.data.rentalDetails);
                }
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (itemId, size, quantity = 1, rental = null) => {
        if (!size) {
            toast.error('Select Product Size');
            return;
        }

        if (!isAuthenticated) {
            toast.info('Please sign in to add items to cart');
            navigate('/sign-in');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                productId: itemId,
                size,
                quantity
            };

            // Add rental details if provided
            if (rental) {
                payload.rentalStart = rental.rentalStart;
                payload.rentalEnd = rental.rentalEnd;
                payload.rentalDays = rental.rentalDays;
            }

            const response = await api.addToCart(payload);

            if (response.success) {
                toast.success('Item added to cart');
                fetchCartItems();

                // Store rental details in local state
                if (rental) {
                    setRentalDetails(prev => ({
                        ...prev,
                        [`${itemId}_${size}`]: rental
                    }));
                }
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to add item to cart');
        } finally {
            setLoading(false);
        }
    };

    // Get rental details for a specific item
    const getRentalDetails = (itemId, size) => {
        return rentalDetails[`${itemId}_${size}`] || null;
    };

    // Calculate rental cost for an item
    const calculateRentalCost = (itemId, size) => {
        const item = products.find(product => product._id === itemId);
        const rental = getRentalDetails(itemId, size);

        if (!item || !rental) return 0;

        return item.price * rental.rentalDays;
    };

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {
                    console.error('Error calculating cart count:', error);
                }
            }
        }
        return totalCount;
    };

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);

        if (quantity <= 0) {
            if (cartData[itemId] && cartData[itemId][size]) {
                delete cartData[itemId][size];

                if (Object.keys(cartData[itemId]).length === 0) {
                    delete cartData[itemId];
                }

                // Also remove rental details if any
                if (rentalDetails[`${itemId}_${size}`]) {
                    const newRentalDetails = {...rentalDetails};
                    delete newRentalDetails[`${itemId}_${size}`];
                    setRentalDetails(newRentalDetails);
                }
            }
        } else {
            if (!cartData[itemId]) {
                cartData[itemId] = {};
            }
            cartData[itemId][size] = quantity;
        }

        setCartItems(cartData);

        if (isAuthenticated) {
            try {
                await api.updateCartItem(itemId, { size, quantity });
            } catch (error) {
                console.error(error);
                toast.error(error.message || 'Failed to update cart');
            }
        }
    };

    const removeFromCart = async (itemId, size) => {
        updateQuantity(itemId, size, 0);
    };

    const clearCart = async () => {
        setCartItems({});
        setRentalDetails({});
        
        if (isAuthenticated) {
            try {
                await api.clearCart();
            } catch (error) {
                console.error(error);
                toast.error(error.message || 'Failed to clear cart');
            }
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        
        for (const itemId in cartItems) {
            for (const size in cartItems[itemId]) {
                const quantity = cartItems[itemId][size];
                const product = products.find(p => p._id === itemId);
                
                if (product) {
                    // Check if it's a rental
                    const rental = getRentalDetails(itemId, size);
                    
                    if (rental) {
                        totalAmount += calculateRentalCost(itemId, size) * quantity;
                    } else {
                        totalAmount += product.price * quantity;
                    }
                }
            }
        }
        
        return totalAmount;
    };

    const contextValue = {
        currency,
        delivery_fee,
        backendUrl,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        setCartItems,
        rentalDetails,
        setRentalDetails,
        products,
        setProducts,
        loading,
        setLoading,
        navigate,
        isAuthenticated,
        user,
        formatCurrency,
        addToCart,
        getRentalDetails,
        calculateRentalCost,
        getCartCount,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalCartAmount,
        fetchCartItems
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;