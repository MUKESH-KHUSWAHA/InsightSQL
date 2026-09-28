const { query } = require('./src/db/pool');

async function checkProduct11() {
  const sql = `
    SELECT
      p.product_id,
      p.name,
      MIN(o.order_date) AS first_order,
      MAX(o.order_date) AS last_order,
      EXTRACT(DAY FROM AGE(MAX(o.order_date), MIN(o.order_date))) AS days_diff,
      EXTRACT(DAY FROM AGE(MAX(o.order_date), MIN(o.order_date))) + 1 AS days_diff_plus_one,
      SUM(oi.quantity) AS total_units
    FROM products p
    JOIN order_items oi ON p.product_id = oi.product_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status = 'completed' AND p.product_id = 11
    GROUP BY p.product_id, p.name
  `;
  
  const result = await query(sql);
  console.log('Product 11 Debug:');
  console.log(JSON.stringify(result.rows[0], null, 2));
  process.exit(0);
}

checkProduct11();
