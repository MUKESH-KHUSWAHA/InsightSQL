const express = require('express');
const {
  getDashboardSummary,
  getMonthlyRevenue,
  getTopProducts,
  getTopCustomers,
  getAtRiskCustomers,
  getRetentionRate,
  getRevenueGrowth,
  getCustomerChurn,
  getProductPerformance,
  getCustomerSegments,
} = require('../controllers/analyticsController');

const router = express.Router();

// Dashboard summary (total revenue, orders, customers)
router.get('/summary', getDashboardSummary);

// Monthly revenue trend
router.get('/revenue/monthly', getMonthlyRevenue);

// Month-over-month revenue growth rate
router.get('/revenue/growth', getRevenueGrowth);

// Top revenue-generating products
router.get('/products/top', getTopProducts);

// Product performance metrics (sales velocity, avg order value)
router.get('/products/performance', getProductPerformance);

// Top customers by spending
router.get('/customers/top', getTopCustomers);

// At-risk customers (last order > 90 days ago)
router.get('/customers/at-risk', getAtRiskCustomers);

// Customer churn analysis (180+ days inactive)
router.get('/customers/churn', getCustomerChurn);

// Customer lifecycle segmentation
router.get('/customers/segments', getCustomerSegments);

// Repeat-purchase retention rate
router.get('/retention', getRetentionRate);

module.exports = router;
