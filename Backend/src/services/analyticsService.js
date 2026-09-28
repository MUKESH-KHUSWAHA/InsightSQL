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

/**
 * Get month-over-month revenue growth rate.
 * Calculates percentage change between consecutive months.
 * @returns {Promise<Array<{month: string, revenue: number, growth_rate: number}>>}
 */
async function getRevenueGrowth() {
  const sql = `
    WITH monthly_revenue AS (
      SELECT
        DATE_TRUNC('month', o.order_date) AS month,
        SUM(oi.quantity * oi.unit_price) AS revenue
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.status = 'completed'
      GROUP BY month
    )
    SELECT
      month,
      revenue,
      LAG(revenue) OVER (ORDER BY month) AS prev_month_revenue,
      CASE
        WHEN LAG(revenue) OVER (ORDER BY month) IS NULL THEN NULL
        WHEN LAG(revenue) OVER (ORDER BY month) = 0 THEN NULL
        ELSE ROUND(
          100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
          / LAG(revenue) OVER (ORDER BY month),
          2
        )
      END AS growth_rate
    FROM monthly_revenue
    ORDER BY month
  `;

  const result = await query(sql);

  return result.rows.map(row => ({
    month: row.month,
    revenue: parseFloat(row.revenue),
    growth_rate: row.growth_rate !== null ? parseFloat(row.growth_rate) : null,
  }));
}

/**
 * Get customer churn analysis.
 * Identifies customers who were active but have not ordered in 180+ days.
 * @returns {Promise<{active_customers: number, churned_customers: number, churn_rate_pct: number, churned_list: Array}>}
 */
async function getCustomerChurn() {
  const sql = `
    WITH customer_last_order AS (
      SELECT
        c.customer_id,
        c.name,
        MAX(o.order_date) AS last_order_date,
        CURRENT_DATE - MAX(o.order_date)::date AS days_since_last_order
      FROM customers c
      JOIN orders o ON c.customer_id = o.customer_id
      WHERE o.status = 'completed'
      GROUP BY c.customer_id, c.name
    )
    SELECT
      COUNT(*) FILTER (WHERE days_since_last_order <= 180) AS active_customers,
      COUNT(*) FILTER (WHERE days_since_last_order > 180) AS churned_customers,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE days_since_last_order > 180)
        / NULLIF(COUNT(*), 0),
        2
      ) AS churn_rate_pct,
      json_agg(
        json_build_object(
          'customer_id', customer_id,
          'name', name,
          'last_order_date', last_order_date,
          'days_since_last_order', days_since_last_order
        ) ORDER BY days_since_last_order DESC
      ) FILTER (WHERE days_since_last_order > 180) AS churned_list
    FROM customer_last_order
  `;

  const result = await query(sql);
  const row = result.rows[0];

  return {
    active_customers: parseInt(row.active_customers, 10),
    churned_customers: parseInt(row.churned_customers, 10),
    churn_rate_pct: parseFloat(row.churn_rate_pct),
    churned_list: row.churned_list || [],
  };
}

/**
 * Get product performance metrics.
 * Calculates sales velocity, average order value, and total units sold per product.
 * @param {number} limit - Max number of products to return
 * @returns {Promise<Array<{product_id: number, name: string, category: string, total_units: number, total_revenue: number, avg_order_value: number, sales_velocity: number}>>}
 */
async function getProductPerformance(limit = 20) {
  const sql = `
    SELECT
      p.product_id,
      p.name,
      p.category,
      SUM(oi.quantity) AS total_units,
      SUM(oi.quantity * oi.unit_price) AS total_revenue,
      ROUND(AVG(oi.quantity * oi.unit_price), 2) AS avg_order_value,
      ROUND(
        SUM(oi.quantity)::numeric /
        NULLIF(
          EXTRACT(DAY FROM AGE(MAX(o.order_date), MIN(o.order_date))) + 1,
          0
        ),
        2
      ) AS sales_velocity
    FROM products p
    JOIN order_items oi ON p.product_id = oi.product_id
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
    total_units: parseInt(row.total_units, 10),
    total_revenue: parseFloat(row.total_revenue),
    avg_order_value: parseFloat(row.avg_order_value),
    sales_velocity: parseFloat(row.sales_velocity),
  }));
}

/**
 * Get customer segmentation by lifecycle stage.
 * Segments: New (0-30 days), Active (31-90 days), Dormant (91-180 days), Lost (180+ days)
 * @returns {Promise<{new: number, active: number, dormant: number, lost: number, segments: Array}>}
 */
async function getCustomerSegments() {
  const sql = `
    WITH customer_last_order AS (
      SELECT
        c.customer_id,
        c.name,
        c.signup_date,
        MAX(o.order_date) AS last_order_date,
        CURRENT_DATE - MAX(o.order_date)::date AS days_since_last_order,
        COUNT(o.order_id) AS total_orders
      FROM customers c
      LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.status = 'completed'
      GROUP BY c.customer_id, c.name, c.signup_date
    ),
    segmented AS (
      SELECT
        customer_id,
        name,
        signup_date,
        last_order_date,
        days_since_last_order,
        total_orders,
        CASE
          WHEN days_since_last_order IS NULL THEN 'new'
          WHEN days_since_last_order <= 30 THEN 'new'
          WHEN days_since_last_order <= 90 THEN 'active'
          WHEN days_since_last_order <= 180 THEN 'dormant'
          ELSE 'lost'
        END AS segment
      FROM customer_last_order
    )
    SELECT
      COUNT(*) FILTER (WHERE segment = 'new') AS new,
      COUNT(*) FILTER (WHERE segment = 'active') AS active,
      COUNT(*) FILTER (WHERE segment = 'dormant') AS dormant,
      COUNT(*) FILTER (WHERE segment = 'lost') AS lost,
      json_agg(
        json_build_object(
          'customer_id', customer_id,
          'name', name,
          'segment', segment,
          'last_order_date', last_order_date,
          'days_since_last_order', days_since_last_order,
          'total_orders', total_orders
        ) ORDER BY segment, days_since_last_order DESC
      ) AS segments
    FROM segmented
  `;

  const result = await query(sql);
  const row = result.rows[0];

  return {
    new: parseInt(row.new, 10),
    active: parseInt(row.active, 10),
    dormant: parseInt(row.dormant, 10),
    lost: parseInt(row.lost, 10),
    segments: row.segments || [],
  };
}

module.exports = {
  getMonthlyRevenue,
  getTopProducts,
  getTopCustomers,
  getAtRiskCustomers,
  getRetentionRate,
  getDashboardSummary,
  getRevenueGrowth,
  getCustomerChurn,
  getProductPerformance,
  getCustomerSegments,
};
