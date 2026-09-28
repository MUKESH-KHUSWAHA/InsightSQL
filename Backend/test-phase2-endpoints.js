/**
 * Test Phase 2 Analytics Endpoints
 * Run: node test-phase2-endpoints.js
 */
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(name, url) {
  try {
    const res = await axios.get(`${BASE_URL}${url}`);
    const { success, data } = res.data;
    
    if (!success) {
      console.log(`❌ ${name}: success=false`);
      return false;
    }
    
    console.log(`✅ ${name}:`, JSON.stringify(data).substring(0, 100) + '...');
    return true;
  } catch (err) {
    console.log(`❌ ${name}: ${err.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Phase 2 Analytics Endpoints\n');
  
  const tests = [
    ['Revenue Growth', '/revenue/growth'],
    ['Customer Churn', '/customers/churn'],
    ['Product Performance', '/products/performance'],
    ['Customer Segments', '/customers/segments'],
    ['Product Performance (limit=10)', '/products/performance?limit=10'],
    ['Product Performance (invalid limit)', '/products/performance?limit=abc'],
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const [name, url] of tests) {
    const result = await testEndpoint(name, url);
    if (result) passed++;
    else failed++;
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
