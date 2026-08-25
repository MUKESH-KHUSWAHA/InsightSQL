const express = require('express');
const {
  getDashboardSummary,
  getMonthlyRevenue,
  getTopProducts,
  getTopCustomers,
  getAtRiskCustomers,
  getRetentionRate,
} = require('../controllers/analyticsController');

const router = express.Router();

// Dashboard summary (total revenue, orders, customers)
router.get('/summary', getDashboardSummary);

// Monthly revenue trend
router.get('/revenue/monthly', getMonthlyRevenue);

// Top revenue-generating products
router.get('/products/top', getTopProducts);

// Top customers by spending
router.get('/customers/top', getTopCustomers);

// At-risk customers (last order > 90 days ago)
router.get('/customers/at-risk', getAtRiskCustomers);

// Repeat-purchase retention rate
router.get('/retention', getRetentionRate);

module.exports = router;
