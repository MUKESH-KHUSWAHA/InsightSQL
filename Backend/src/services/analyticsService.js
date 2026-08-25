const { query } = require('../db/pool');

/**
 * Get monthly revenue from completed orders.
 * Groups revenue by month using DATE_TRUNC.
 * @returns {Promise<Array<{month: string, revenue: number}>>}
 */
async function getMonthlyRevenue() {
  const sql = `
    SELECT
      DATE_TRUNC('month', o.order_date) AS month,
      SUM(oi.quantity * oi.unit_price) AS revenue
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.status = 'completed'
    GROUP BY month
    ORDER BY month
  `;

  const result = await query(sql);

  return result.rows.map(row => ({
    month: row.month,
    revenue: parseFloat(row.revenue),
  }));
}

/**
 * Get top revenue-generating products.
 * Uses JOIN across order_items, products, and orders.
 * @param {number} limit - Max number of products to return
 * @returns {Promise<Array<{product_id: number, name: string, category: string, total_revenue: number}>>}
 */
async function getTopProducts(limit = 10) {
  const sql = `
    SELECT
      p.product_id,
      p.name,
      p.category,
      SUM(oi.quantity * oi.unit_price) AS total_revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status = 'completed'
    GROUP BY p.product_id, p.name, p.category
    ORDER BY total_revenue DESC
    LIMIT $1
  `;

  const result = await query(sql, [limit]);

  return result.rows.map(row => ({
    product_id: row.product_id,
    name: row.name,
    category: row.category,
    total_revenue: parseFloat(row.total_revenue),
  }));
}

/**
 * Get top customers by total spending.
 * Aggregates across orders and order_items for completed orders.
 * @param {number} limit - Max number of customers to return
 * @returns {Promise<Array<{customer_id: number, name: string, total_spent: number}>>}
 */
async function getTopCustomers(limit = 10) {
  const sql = `
    SELECT
      c.customer_id,
      c.name,
      SUM(oi.quantity * oi.unit_price) AS total_spent
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.status = 'completed'
    GROUP BY c.customer_id, c.name
    ORDER BY total_spent DESC
    LIMIT $1
  `;

  const result = await query(sql, [limit]);

  return result.rows.map(row => ({
    customer_id: row.customer_id,
    name: row.name,
    total_spent: parseFloat(row.total_spent),
  }));
}

/**
 * Get at-risk customers.
 * Business definition: customers whose last completed order was > 90 days ago.
 * @returns {Promise<Array<{customer_id: number, name: string, last_order: string, days_since_last_order: number}>>}
 */
async function getAtRiskCustomers() {
  const sql = `
    SELECT
      c.customer_id,
      c.name,
      MAX(o.order_date) AS last_order,
      CURRENT_DATE - MAX(o.order_date)::date AS days_since_last_order
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.status = 'completed'
    GROUP BY c.customer_id, c.name
    HAVING MAX(o.order_date) < CURRENT_DATE - INTERVAL '90 days'
    ORDER BY last_order ASC
  `;

  const result = await query(sql);

  return result.rows.map(row => ({
    customer_id: row.customer_id,
    name: row.name,
    last_order: row.last_order,
    days_since_last_order: parseInt(row.days_since_last_order, 10),
  }));
}

/**
 * Get repeat-purchase retention rate.
 * Calculates the percentage of customers who made at least one purchase
 * after their first purchase. This is NOT a traditional cohort matrix.
 * @returns {Promise<{total_customers: number, repeat_customers: number, retention_rate_pct: number}>}
 */
async function getRetentionRate() {
  const sql = `
    WITH first_orders AS (
      SELECT
        customer_id,
        MIN(order_date) AS first_order_date
      FROM orders
      WHERE status = 'completed'
      GROUP BY customer_id
    ),
    customer_retention AS (
      SELECT
        f.customer_id,
        COUNT(o.order_id) FILTER (
          WHERE o.order_date > f.first_order_date
        ) AS repeat_order_count
      FROM first_orders f
      LEFT JOIN orders o
        ON o.customer_id = f.customer_id
        AND o.status = 'completed'
      GROUP BY f.customer_id
    )
    SELECT
      COUNT(*) AS total_customers,
      COUNT(*) FILTER (WHERE repeat_order_count > 0) AS repeat_customers,
      ROUND(
        100.0 *
        COUNT(*) FILTER (WHERE repeat_order_count > 0)
        / NULLIF(COUNT(*), 0),
        2
      ) AS retention_rate_pct
    FROM customer_retention
  `;

  const result = await query(sql);
  const row = result.rows[0];

  return {
    total_customers: parseInt(row.total_customers, 10),
    repeat_customers: parseInt(row.repeat_customers, 10),
    retention_rate_pct: parseFloat(row.retention_rate_pct),
  };
}

/**
 * Get dashboard summary statistics.
 * Combines total revenue, order count, and customer count in a single query.
 * @returns {Promise<{total_revenue: number, total_orders: number, total_customers: number}>}
 */
async function getDashboardSummary() {
  const sql = `
    SELECT
      (SELECT SUM(oi.quantity * oi.unit_price)
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.order_id
       WHERE o.status = 'completed') AS total_revenue,
      (SELECT COUNT(*) FROM orders WHERE status = 'completed') AS total_orders,
      (SELECT COUNT(*) FROM customers) AS total_customers
  `;

  const result = await query(sql);
  const row = result.rows[0];

  return {
    total_revenue: parseFloat(row.total_revenue),
    total_orders: parseInt(row.total_orders, 10),
    total_customers: parseInt(row.total_customers, 10),
  };
}

module.exports = {
  getMonthlyRevenue,
  getTopProducts,
  getTopCustomers,
  getAtRiskCustomers,
  getRetentionRate,
  getDashboardSummary,
};
