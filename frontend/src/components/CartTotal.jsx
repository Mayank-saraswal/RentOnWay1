import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = () => {
    const {
      currency, 
      delivery_fee, 
      getCartAmount, 
      formatCurrency, 
      cartItems, 
      products, 
      getRentalDetails
    } = useContext(ShopContext);

    // Calculate total rental costs
    const calculateRentalTotal = () => {
      let total = 0;
      
      for (const itemId in cartItems) {
        for (const size in cartItems[itemId]) {
          const rentalInfo = getRentalDetails(itemId, size);
          if (rentalInfo) {
            const product = products.find(p => p._id === itemId);
            if (product) {
              total += product.price * rentalInfo.rentalDays * cartItems[itemId][size];
            }
          }
        }
      }
      
      return total;
    };

    // Calculate regular purchase total (non-rental items)
    const calculatePurchaseTotal = () => {
      let total = 0;
      
      for (const itemId in cartItems) {
        for (const size in cartItems[itemId]) {
          const rentalInfo = getRentalDetails(itemId, size);
          if (!rentalInfo) {
            const product = products.find(p => p._id === itemId);
            if (product) {
              total += product.price * cartItems[itemId][size];
            }
          }
        }
      }
      
      return total;
    };

    const rentalTotal = calculateRentalTotal();
    const purchaseTotal = calculatePurchaseTotal();
    const subtotal = rentalTotal + purchaseTotal;
    const total = subtotal + delivery_fee;

    return (
      <div className='w-full'>
        <div className='text-2xl'>
          <Title text1={'CART'} text2={'TOTALS'} />
        </div>

        <div className='flex flex-col gap-2 mt-2 text-sm'>
          {rentalTotal > 0 && (
            <div className='flex justify-between'>
              <p>Rental Items</p>
              <p>{currency} {formatCurrency(rentalTotal)}</p>
            </div>
          )}
          
          {purchaseTotal > 0 && (
            <div className='flex justify-between'>
              <p>Purchase Items</p>
              <p>{currency} {formatCurrency(purchaseTotal)}</p>
            </div>
          )}
          
          <div className='flex justify-between'>
            <p>Subtotal</p>
            <p>{currency} {formatCurrency(subtotal)}</p>
          </div>
          <hr />
          <div className='flex justify-between'>
            <p>Shipping Fee</p>
            <p>{currency} {formatCurrency(delivery_fee)}</p>
          </div>
          <hr />
          <div className='flex justify-between'>
            <b>Total</b>
            <b>{currency} {formatCurrency(total)}</b>
          </div>
        </div>
      </div>
    )
}

export default CartTotal
