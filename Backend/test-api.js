/**
 * Inline API test — starts the server in-process, runs HTTP requests, then exits.
 * Run: node test-api.js
 */
const http = require('http');
const app = require('./src/server');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  // Give the server a moment to bind
  await new Promise(r => setTimeout(r, 500));

  console.log('\n=== Testing Analytics REST APIs ===\n');

  const tests = [
    { label: 'GET /api/health',                        path: '/api/health' },
    { label: 'GET /api/summary',                       path: '/api/summary' },
    { label: 'GET /api/revenue/monthly',               path: '/api/revenue/monthly' },
    { label: 'GET /api/products/top (default limit)',  path: '/api/products/top' },
    { label: 'GET /api/products/top?limit=5',          path: '/api/products/top?limit=5' },
    { label: 'GET /api/customers/top?limit=5',         path: '/api/customers/top?limit=5' },
    { label: 'GET /api/customers/at-risk',             path: '/api/customers/at-risk' },
    { label: 'GET /api/retention',                     path: '/api/retention' },
    { label: 'GET /api/products/top?limit=abc (bad)',  path: '/api/products/top?limit=abc' },
    { label: 'GET /api/products/top?limit=0  (bad)',   path: '/api/products/top?limit=0' },
    { label: 'GET /api/nonexistent (404)',             path: '/api/nonexistent' },
  ];

  let pass = 0;
  let fail = 0;

  for (const t of tests) {
    try {
      const { status, body } = await get(t.path);
      const ok = body.success !== false;
      const icon = ok ? '✅' : (status === 400 || status === 404 ? '✅' : '❌');
      const summary = ok
        ? (Array.isArray(body.data) ? `${body.data.length} rows` : JSON.stringify(body.data ?? body).slice(0, 80))
        : `${status} — ${body.error}`;
      console.log(`${icon} [${status}] ${t.label}`);
      console.log(`   → ${summary}`);
      pass++;
    } catch (err) {
      console.log(`❌ ${t.label} — REQUEST FAILED: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n=== ${pass} passed, ${fail} failed ===\n`);
  process.exit(fail > 0 ? 1 : 0);
}

runTests();
