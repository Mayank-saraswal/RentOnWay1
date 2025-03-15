# RentOnway - Rental Feature Guide

## Overview

RentOnway now includes a powerful rental feature that allows customers to rent products for a specific period. This guide explains how to use and manage the rental functionality.

## For Customers

### Renting a Product

1. Browse the product catalog and select a product you want to rent.
2. On the product page, select your size.
3. Click the "RENT NOW" button.
4. In the rental modal:
   - Select your rental start date
   - Select your rental end date (minimum 4 days, maximum 30 days)
   - Review the rental summary and total cost
   - Click "Proceed to Checkout"
5. Complete the checkout process to confirm your rental.

### Viewing Rental Information

1. In your cart, rental items will display:
   - Rental period (start and end dates)
   - Duration in days
   - Total rental cost

2. The cart total will separate:
   - Rental items cost
   - Purchase items cost (if any)
   - Shipping fee
   - Total amount

## For Developers

### Key Components

1. **DateRangePicker.jsx**
   - Handles date selection with validation
   - Ensures minimum rental period of 4 days
   - Calculates total rental days

2. **RentModal.jsx**
   - Displays product information
   - Includes DateRangePicker
   - Shows rental summary
   - Handles checkout process

3. **ShopContext.jsx Updates**
   - Added rental state management
   - Added functions to calculate rental costs
   - Modified cart functionality to handle rentals

### Implementation Details

#### Adding Rental to Cart

```javascript
addToCart(productId, size, quantity, rental);
```

Where `rental` is an object containing:
- `rentalStart`: Start date
- `rentalEnd`: End date
- `rentalDays`: Number of days

#### Getting Rental Details

```javascript
const rentalInfo = getRentalDetails(productId, size);
```

#### Calculating Rental Cost

```javascript
const cost = calculateRentalCost(productId, size);
```

## Technical Requirements

- date-fns library for date manipulation
- React context for state management
- MongoDB for data storage

## Running the Application

Use the provided batch file to start the application:

```
run-app.bat
```

This will:
1. Install required packages
2. Start the backend server
3. Start the frontend server

## Future Enhancements

- Calendar view for availability
- Rental history for users
- Admin dashboard for rental management
- Rental extension functionality 