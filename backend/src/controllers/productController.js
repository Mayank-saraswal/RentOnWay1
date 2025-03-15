import { Op } from 'sequelize';
import { Product, Retailer, Review, User } from '../models/index.js';

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      season,
      eventType,
      gender,
      minPrice,
      maxPrice,
      brand,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build filter object
    const filter = {
      isAvailable: true,
      isApproved: true
    };

    // Add filters if provided
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (season) filter.season = season;
    if (eventType) filter.eventType = eventType;
    if (gender) filter.gender = gender;
    if (brand) filter.brand = brand;
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.rentalPrice = {};
      if (minPrice) filter.rentalPrice[Op.gte] = parseFloat(minPrice);
      if (maxPrice) filter.rentalPrice[Op.lte] = parseFloat(maxPrice);
    }
    
    // Search filter
    if (search) {
      filter[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } }
      ];
    }

    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Get products
    const products = await Product.findAndCountAll({
      where: filter,
      include: [
        {
          model: Retailer,
          attributes: ['id', 'businessName', 'rating']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate pagination info
    const totalPages = Math.ceil(products.count / limit);

    res.status(200).json({
      success: true,
      count: products.count,
      totalPages,
      currentPage: parseInt(page),
      data: products.rows
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Retailer,
          attributes: ['id', 'businessName', 'rating']
        },
        {
          model: Review,
          include: [
            {
              model: User,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (product) {
      res.status(200).json({
        success: true,
        data: product
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a new product (retailer only)
// @route   POST /api/products
// @access  Private/Retailer
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subCategory,
      brand,
      retailPrice,
      rentalPrice,
      securityDeposit,
      quantity,
      season,
      eventType,
      gender,
      size,
      color,
      material,
      condition,
      minRentalDays,
      maxRentalDays
    } = req.body;

    // Create product
    const product = await Product.create({
      name,
      description,
      category,
      subCategory,
      brand,
      retailPrice,
      rentalPrice,
      securityDeposit,
      quantity,
      availableQuantity: quantity,
      images: req.files ? req.files.map(file => file.path) : [],
      season,
      eventType,
      gender,
      size,
      color,
      material,
      condition,
      minRentalDays,
      maxRentalDays,
      retailerId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update a product (retailer only)
// @route   PUT /api/products/:id
// @access  Private/Retailer
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product belongs to retailer
    if (product.retailerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Update product fields
    const {
      name,
      description,
      category,
      subCategory,
      brand,
      retailPrice,
      rentalPrice,
      securityDeposit,
      quantity,
      season,
      eventType,
      gender,
      size,
      color,
      material,
      condition,
      minRentalDays,
      maxRentalDays,
      isAvailable
    } = req.body;

    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (subCategory) product.subCategory = subCategory;
    if (brand) product.brand = brand;
    if (retailPrice) product.retailPrice = retailPrice;
    if (rentalPrice) product.rentalPrice = rentalPrice;
    if (securityDeposit) product.securityDeposit = securityDeposit;
    if (quantity) {
      product.quantity = quantity;
      // Update available quantity based on new quantity
      const rented = product.quantity - product.availableQuantity;
      product.availableQuantity = quantity - rented;
    }
    if (season) product.season = season;
    if (eventType) product.eventType = eventType;
    if (gender) product.gender = gender;
    if (size) product.size = size;
    if (color) product.color = color;
    if (material) product.material = material;
    if (condition) product.condition = condition;
    if (minRentalDays) product.minRentalDays = minRentalDays;
    if (maxRentalDays) product.maxRentalDays = maxRentalDays;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;

    // Update images if provided
    if (req.files && req.files.length > 0) {
      product.images = req.files.map(file => file.path);
    }

    // Save updated product
    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a product (retailer only)
// @route   DELETE /api/products/:id
// @access  Private/Retailer
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product belongs to retailer
    if (product.retailerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Delete product
    await product.destroy();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get retailer products
// @route   GET /api/products/retailer
// @access  Private/Retailer
export const getRetailerProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { retailerId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error getting retailer products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { 
        isAvailable: true,
        isApproved: true,
        isFeatured: true
      },
      include: [
        {
          model: Retailer,
          attributes: ['id', 'businessName', 'rating']
        }
      ],
      limit: 10
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error getting featured products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};