const analyticsService = require('../services/analyticsService');

// --------------- Helpers ---------------

/**
 * Parse and validate the `limit` query parameter.
 * Returns an integer between 1 and 100 (default 10).
 * Returns null if the value is invalid.
 */
function parseLimit(raw, defaultValue = 10) {
  if (raw === undefined || raw === null || raw === '') return defaultValue;
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 1 || n > 100) return null;
  return n;
}

// --------------- Controllers ---------------

/**
 * GET /api/summary
 * Returns: { total_revenue, total_orders, total_customers }
 */
async function getDashboardSummary(req, res, next) {
  try {
    const data = await analyticsService.getDashboardSummary();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/revenue/monthly
 * Returns: [{ month, revenue }]
 */
async function getMonthlyRevenue(req, res, next) {
  try {
    const data = await analyticsService.getMonthlyRevenue();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/top?limit=10
 * Returns: [{ product_id, name, category, total_revenue }]
 */
async function getTopProducts(req, res, next) {
  try {
    const limit = parseLimit(req.query.limit, 10);
    if (limit === null) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit. Must be an integer between 1 and 100.',
      });
    }
    const data = await analyticsService.getTopProducts(limit);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/customers/top?limit=10
 * Returns: [{ customer_id, name, total_spent }]
 */
async function getTopCustomers(req, res, next) {
  try {
    const limit = parseLimit(req.query.limit, 10);
    if (limit === null) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit. Must be an integer between 1 and 100.',
      });
    }
    const data = await analyticsService.getTopCustomers(limit);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/customers/at-risk
 * Returns: [{ customer_id, name, last_order, days_since_last_order }]
 */
async function getAtRiskCustomers(req, res, next) {
  try {
    const data = await analyticsService.getAtRiskCustomers();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/retention
 * Returns: { total_customers, repeat_customers, retention_rate_pct }
 */
async function getRetentionRate(req, res, next) {
  try {
    const data = await analyticsService.getRetentionRate();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardSummary,
  getMonthlyRevenue,
  getTopProducts,
  getTopCustomers,
  getAtRiskCustomers,
  getRetentionRate,
};
