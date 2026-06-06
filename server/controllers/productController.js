const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get all unique brands
// @route   GET /api/products/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Product.distinct('brand');
  res.json(brands);
});

// @desc    Fetch all products (with optional search keyword)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, sort, brand } = req.query;

  // Build query
  const query = {};

  if (keyword) {
    query.name = {
      $regex: keyword,
      $options: 'i',
    };
  }

  if (category) {
    query.category = category;
  }

  if (brand) {
    query.brand = brand;
  }

  let products = await Product.find(query);

  if (minPrice || maxPrice) {
    products = products.filter(p => {
      const pPrice = p.discountPrice || p.price;
      if (minPrice && pPrice < Number(minPrice)) return false;
      if (maxPrice && pPrice > Number(maxPrice)) return false;
      return true;
    });
  }

  if (sort === 'trending') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get sales volume per product in the last 30 days
    const topProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: "$orderItems" },
      { $group: { _id: "$orderItems.product", count: { $sum: "$orderItems.qty" } } }
    ]);
    
    const salesMap = {};
    topProducts.forEach(item => {
      if (item._id) {
        salesMap[item._id.toString()] = item.count;
      }
    });

    products.sort((a, b) => {
      const salesA = salesMap[a._id.toString()] || 0;
      const salesB = salesMap[b._id.toString()] || 0;
      if (salesB !== salesA) {
        return salesB - salesA; // Sort by sales desc
      }
      return b.updatedAt - a.updatedAt; // Then by updatedAt desc
    });
  } else if (sort === 'price_asc') {
    products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sort === 'price_desc') {
    products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else {
    products.sort((a, b) => b.createdAt - a.createdAt);
  }

  res.json(products);
});

// @desc    Fetch a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  let product;
  
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    product = await Product.findById(req.params.id);
  }
  
  if (!product) {
    product = await Product.findOne({ slug: req.params.id });
  }

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample name',
    price: 0,
    user: req.user._id,
    images: ['/images/sample.jpg'],
    brand: 'Sample brand',
    category: req.body.category || '60d21b4667d0d8992e610c85', // Need a valid ObjectId, better to pass from frontend
    stock: 0,
    numReviews: 0,
    description: 'Sample description',
    isKBeauty: true,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    images,
    brand,
    category,
    stock,
    isKBeauty,
    discountPrice,
    skinType,
    tags,
    slug,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    if (slug) product.slug = slug;
    product.price = price || product.price;
    product.description = description || product.description;
    product.images = images || product.images;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    product.isKBeauty = isKBeauty !== undefined ? isKBeauty : product.isKBeauty;
    product.discountPrice = discountPrice || product.discountPrice;
    product.skinType = skinType || product.skinType;
    product.tags = tags !== undefined ? tags : product.tags;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, image } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      image,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const review = product.reviews.id(req.params.reviewId);
    
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('User not authorized to delete this review');
    }

    product.reviews.pull(req.params.reviewId);

    product.numReviews = product.reviews.length;
    if (product.reviews.length > 0) {
      product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
    } else {
      product.rating = 0;
    }

    await product.save();
    res.json({ message: 'Review removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  deleteProductReview,
  getBrands,
};