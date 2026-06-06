const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Brand = require('../models/Brand');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({}).sort({ name: 1 });
  res.json(brands);
});

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Public
const getBrandById = asyncHandler(async (req, res) => {
  let brand;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    brand = await Brand.findById(req.params.id);
  } else {
    brand = await Brand.findOne({ slug: req.params.id });
  }

  if (brand) {
    res.json(brand);
  } else {
    res.status(404);
    throw new Error('Brand not found');
  }
});

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private/Admin
const createBrand = asyncHandler(async (req, res) => {
  const { name, slug, image, description, isFeatured } = req.body;

  const brandExists = await Brand.findOne({ $or: [{ name }, { slug }] });

  if (brandExists) {
    res.status(400);
    throw new Error('Brand already exists');
  }

  const brand = new Brand({
    name,
    slug,
    image,
    description,
    isFeatured
  });

  const createdBrand = await brand.save();
  res.status(201).json(createdBrand);
});

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
const updateBrand = asyncHandler(async (req, res) => {
  const { name, slug, image, description, isFeatured } = req.body;

  const brand = await Brand.findById(req.params.id);

  if (brand) {
    brand.name = name || brand.name;
    brand.slug = slug || brand.slug;
    brand.image = image !== undefined ? image : brand.image;
    brand.description = description !== undefined ? description : brand.description;
    brand.isFeatured = isFeatured !== undefined ? isFeatured : brand.isFeatured;

    const updatedBrand = await brand.save();
    res.json(updatedBrand);
  } else {
    res.status(404);
    throw new Error('Brand not found');
  }
});

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (brand) {
    await brand.deleteOne();
    res.json({ message: 'Brand removed' });
  } else {
    res.status(404);
    throw new Error('Brand not found');
  }
});

module.exports = {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
