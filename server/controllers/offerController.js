const asyncHandler = require('express-async-handler');
const Offer = require('../models/Offer');
const mongoose = require('mongoose');

const createSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// @desc    Get all active offers
// @route   GET /api/offers
// @access  Public
const getActiveOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find({ isActive: true })
    .populate('products')
    .populate('bogoBuyProducts')
    .populate('bogoGetProducts')
    .populate('bundles.products');
  res.json(offers);
});

// @desc    Get all offers
// @route   GET /api/offers/admin
// @access  Private/Admin
const getAdminOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find({}).sort({ createdAt: -1 });
  res.json(offers);
});

// @desc    Get offer by ID
// @route   GET /api/offers/:id
// @access  Public
const getOfferById = asyncHandler(async (req, res) => {
  const idOrSlug = req.params.id;
  let offer;

  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    offer = await Offer.findById(idOrSlug)
      .populate('products')
      .populate('bogoBuyProducts')
      .populate('bogoGetProducts')
      .populate('bundles.products');
  }
  
  if (!offer) {
    offer = await Offer.findOne({ slug: idOrSlug })
      .populate('products')
      .populate('bogoBuyProducts')
      .populate('bogoGetProducts')
      .populate('bundles.products');
  }

  // Fallback for backward compatibility with older `id-slug` links
  if (!offer && idOrSlug.includes('-')) {
    const potentialId = idOrSlug.split('-')[0];
    if (mongoose.Types.ObjectId.isValid(potentialId)) {
      offer = await Offer.findById(potentialId)
        .populate('products')
        .populate('bogoBuyProducts')
        .populate('bogoGetProducts')
        .populate('bundles.products');
    }
  }

  if (offer) {
    res.json(offer);
  } else {
    res.status(404);
    throw new Error('Offer not found');
  }
});

// @desc    Create an offer
// @route   POST /api/offers
// @access  Private/Admin
const createOffer = asyncHandler(async (req, res) => {
  const { title, description, image, mobileImage, titleColor, descriptionColor, isActive, products, offerType, discountValue, buyQuantity, getQuantity, bundlePrice, bogoBuyProducts, bogoGetProducts, bundles } = req.body;

  const offer = new Offer({
    title,
    slug: createSlug(title),
    description,
    image,
    mobileImage,
    titleColor: titleColor || '#ffffff',
    descriptionColor: descriptionColor || '#e5e7eb',
    isActive,
    offerType: offerType || 'STANDARD',
    discountValue: discountValue || 0,
    buyQuantity: buyQuantity || 1,
    getQuantity: getQuantity || 1,
    bundlePrice: bundlePrice || 0,
    products: products || [],
    bogoBuyProducts: bogoBuyProducts || [],
    bogoGetProducts: bogoGetProducts || [],
    bundles: bundles || [],
  });

  const createdOffer = await offer.save();
  res.status(201).json(createdOffer);
});

// @desc    Update an offer
// @route   PUT /api/offers/:id
// @access  Private/Admin
const updateOffer = asyncHandler(async (req, res) => {
  const { title, description, image, mobileImage, titleColor, descriptionColor, isActive, products, offerType, discountValue, buyQuantity, getQuantity, bundlePrice, bogoBuyProducts, bogoGetProducts, bundles } = req.body;

  const offer = await Offer.findById(req.params.id);

  if (offer) {
    offer.title = title || offer.title;
    if (title) {
      offer.slug = createSlug(title);
    }
    offer.description = description !== undefined ? description : offer.description;
    offer.image = image || offer.image;
    offer.mobileImage = mobileImage !== undefined ? mobileImage : offer.mobileImage;
    offer.titleColor = titleColor || offer.titleColor;
    offer.descriptionColor = descriptionColor || offer.descriptionColor;
    offer.isActive = isActive !== undefined ? isActive : offer.isActive;
    if (offerType !== undefined) offer.offerType = offerType;
    if (discountValue !== undefined) offer.discountValue = discountValue;
    if (buyQuantity !== undefined) offer.buyQuantity = buyQuantity;
    if (getQuantity !== undefined) offer.getQuantity = getQuantity;
    if (bundlePrice !== undefined) offer.bundlePrice = bundlePrice;
    if (products) offer.products = products;
    if (bogoBuyProducts) offer.bogoBuyProducts = bogoBuyProducts;
    if (bogoGetProducts) offer.bogoGetProducts = bogoGetProducts;
    if (bundles) offer.bundles = bundles;

    const updatedOffer = await offer.save();
    res.json(updatedOffer);
  } else {
    res.status(404);
    throw new Error('Offer not found');
  }
});

// @desc    Delete an offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);

  if (offer) {
    await offer.deleteOne();
    res.json({ message: 'Offer removed' });
  } else {
    res.status(404);
    throw new Error('Offer not found');
  }
});

module.exports = {
  getActiveOffers,
  getAdminOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
};
