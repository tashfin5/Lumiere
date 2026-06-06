const asyncHandler = require('express-async-handler');
const SiteStats = require('../models/SiteStats');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Offer = require('../models/Offer');

// @desc    Track a view for a given pathname
// @route   POST /api/stats/track
// @access  Public
const trackView = asyncHandler(async (req, res) => {
  const { pathname } = req.body;
  if (!pathname) {
    res.status(400);
    throw new Error('Pathname is required');
  }

  // Always increment main site view for any tracked request
  let siteStats = await SiteStats.findOne({ page: 'main' });
  if (!siteStats) {
    siteStats = new SiteStats({ page: 'main', views: 0 });
  }
  siteStats.views += 1;
  await siteStats.save();

  // Increment specific item if applicable
  if (pathname.startsWith('/product/')) {
    const slug = pathname.split('/')[2];
    if (slug) await Product.updateOne({ slug }, { $inc: { views: 1 } });
  } else if (pathname.startsWith('/category/')) {
    const slug = pathname.split('/')[2];
    if (slug) await Category.updateOne({ slug }, { $inc: { views: 1 } });
  } else if (pathname.startsWith('/brands/')) {
    const slug = pathname.split('/')[2];
    if (slug) await Brand.updateOne({ slug }, { $inc: { views: 1 } });
  } else if (pathname.startsWith('/offer/')) {
    const slug = pathname.split('/')[2];
    if (slug) await Offer.updateOne({ slug }, { $inc: { views: 1 } });
  }

  res.json({ success: true, siteViews: siteStats.views });
});

// @desc    Get aggregated stats for Admin Dashboard
// @route   GET /api/stats
// @access  Private/Admin
const getAggregatedStats = asyncHandler(async (req, res) => {
  const siteStats = await SiteStats.findOne({ page: 'main' });
  const totalViews = siteStats?.views || 0;

  res.json({
    totalViews
  });
});

module.exports = {
  trackView,
  getAggregatedStats,
};
