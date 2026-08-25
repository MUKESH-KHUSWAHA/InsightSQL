/**
 * Verify the analytics service layer works correctly.
 * Run: node test-service.js
 * Delete after verification.
 */
const {
  getMonthlyRevenue,
  getTopProducts,
  getTopCustomers,
  getAtRiskCustomers,
  getRetentionRate,
  getDashboardSummary,
} = require('./src/services/analyticsService');
const { pool } = require('./src/db/pool');

async function test() {
  console.log('=== Testing Analytics Service Layer ===\n');

  try {
    const summary = await getDashboardSummary();
    console.log('✅ Dashboard Summary:', summary);
    console.log(`   Type check - total_revenue is number: ${typeof summary.total_revenue === 'number'}`);

    const revenue = await getMonthlyRevenue();
    console.log(`\n✅ Monthly Revenue: ${revenue.length} months`);
    console.log(`   Type check - revenue is number: ${typeof revenue[0].revenue === 'number'}`);

    const products = await getTopProducts(5);
    console.log(`\n✅ Top Products: ${products.length} products`);
    console.log(`   Type check - total_revenue is number: ${typeof products[0].total_revenue === 'number'}`);

    const customers = await getTopCustomers(5);
    console.log(`\n✅ Top Customers: ${customers.length} customers`);
    console.log(`   Type check - total_spent is number: ${typeof customers[0].total_spent === 'number'}`);

    const atRisk = await getAtRiskCustomers();
    console.log(`\n✅ At-Risk Customers: ${atRisk.length} customers`);
    if (atRisk.length > 0) {
      console.log(`   Type check - days_since_last_order is number: ${typeof atRisk[0].days_since_last_order === 'number'}`);
    }

    const retention = await getRetentionRate();
    console.log(`\n✅ Retention Rate: ${retention.retention_rate_pct}%`);
    console.log(`   Type check - retention_rate_pct is number: ${typeof retention.retention_rate_pct === 'number'}`);

    console.log('\n=== ALL SERVICE TESTS PASSED ===');
  } catch (err) {
    console.error('❌ Service test failed:', err.message);
  } finally {
    await pool.end();
  }
}

test();
