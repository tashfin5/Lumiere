const express = require('express');
const router = express.Router();
const {
  trackView,
  getAggregatedStats,
} = require('../controllers/statsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getAggregatedStats);
router.route('/track').post(trackView);

module.exports = router;
