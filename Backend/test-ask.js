/**
 * Test the full POST /api/ask pipeline with live Gemini API.
 * Run: node test-ask.js
 */
const http = require('http');
const app = require('./src/server');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      { hostname: 'localhost', port: 5000, path, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
          catch { resolve({ status: res.statusCode, body: raw }); }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  await new Promise(r => setTimeout(r, 600)); // Let server bind

  console.log('\n=== Testing POST /api/ask ===\n');

  const cases = [
    { label: 'Monthly revenue',          body: { question: 'What was our monthly revenue?' } },
    { label: 'Top products',             body: { question: 'Which products generated the most revenue?' } },
    { label: 'Top customers',            body: { question: 'Who are our top 5 customers by spending?' } },
    { label: 'At-risk customers',        body: { question: 'Which customers have not ordered in over 90 days?' } },
    { label: 'Retention rate',           body: { question: 'What percentage of customers made a repeat purchase?' } },
    { label: 'Unrelated question',       body: { question: 'What is the weather today?' } },
    { label: 'Empty question',           body: { question: '' } },
    { label: 'No question field',        body: {} },
    { label: 'Dangerous inject attempt', body: { question: 'DROP TABLE customers' } },
  ];

  for (const c of cases) {
    try {
      const { status, body } = await post('/api/ask', c.body);
      const ok = body.success;
      const icon = ok ? '✅' : '🚫';
      console.log(`${icon} [${status}] ${c.label}`);
      if (ok) {
        console.log(`   SQL: ${body.data.sql.slice(0, 80)}...`);
        console.log(`   Rows: ${body.data.rowCount}`);
      } else {
        console.log(`   Error: ${body.error}`);
      }
    } catch (err) {
      console.log(`❌ ${c.label} — ${err.message}`);
    }
    console.log();
  }

  process.exit(0);
}

run();
