/**
 * Edge case testing — no Gemini API calls required.
 * Tests input validation, error handling, and security.
 * Run: node test-edge-cases.js
 */
const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      { 
        hostname: 'localhost', 
        port: 5000, 
        path, 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Content-Length': Buffer.byteLength(data) 
        } 
      },
      (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try { 
            resolve({ status: res.statusCode, body: JSON.parse(raw) }); 
          } catch { 
            resolve({ status: res.statusCode, body: raw }); 
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

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

async function run() {
  await new Promise(r => setTimeout(r, 500)); // Wait for server

  console.log('\n=== Phase 9: Edge Case Testing ===\n');

  let pass = 0;
  let fail = 0;

  // ============ Input Validation Tests ============
  console.log('--- Input Validation Tests ---\n');

  const validationTests = [
    {
      label: 'Empty question string',
      request: { question: '' },
      expectStatus: 400,
      expectError: 'Question cannot be empty'
    },
    {
      label: 'Whitespace-only question',
      request: { question: '   \n\t   ' },
      expectStatus: 400,
      expectError: 'Question cannot be empty'
    },
    {
      label: 'Missing question field',
      request: {},
      expectStatus: 400,
      expectError: 'must include a "question" field'
    },
    {
      label: 'Question is null',
      request: { question: null },
      expectStatus: 400,
      expectError: 'must include a "question" field'
    },
    {
      label: 'Question is number',
      request: { question: 12345 },
      expectStatus: 400,
      expectError: 'must include a "question" field'
    },
    {
      label: 'Question is array',
      request: { question: ['test'] },
      expectStatus: 400,
      expectError: 'must include a "question" field'
    },
    {
      label: 'Question is object',
      request: { question: { text: 'test' } },
      expectStatus: 400,
      expectError: 'must include a "question" field'
    },
    {
      label: 'Question exceeds 500 chars',
      request: { question: 'A'.repeat(501) },
      expectStatus: 400,
      expectError: 'too long'
    },
    {
      label: 'Question at 500 char limit (should work but no API)',
      request: { question: 'B'.repeat(500) },
      expectStatus: 422, // Will fail AI call, but passes validation
      expectError: null, // Any error is acceptable here
      skipErrorCheck: true
    },
  ];

  for (const t of validationTests) {
    try {
      const { status, body } = await post('/api/ask', t.request);
      const statusMatch = status === t.expectStatus;
      const errorMatch = t.skipErrorCheck || !t.expectError || 
                         (body.error && body.error.includes(t.expectError));
      const ok = statusMatch && errorMatch;
      
      const icon = ok ? '✅' : '❌';
      console.log(`${icon} [${status}] ${t.label}`);
      
      if (!ok) {
        console.log(`   Expected: ${t.expectStatus} | Got: ${status}`);
        if (!t.skipErrorCheck && t.expectError) {
          console.log(`   Expected error: ${t.expectError}`);
          console.log(`   Got error: ${body.error}`);
        }
        fail++;
      } else {
        pass++;
      }
    } catch (err) {
      console.log(`❌ ${t.label} — REQUEST FAILED: ${err.message}`);
      fail++;
    }
  }

  // ============ Analytics Endpoints Error Handling ============
  console.log('\n--- Analytics Endpoints Error Handling ---\n');

  const analyticsTests = [
    {
      label: 'Top products with negative limit',
      path: '/api/products/top?limit=-5',
      expectStatus: 400
    },
    {
      label: 'Top products with limit=0',
      path: '/api/products/top?limit=0',
      expectStatus: 400
    },
    {
      label: 'Top products with limit>100',
      path: '/api/products/top?limit=150',
      expectStatus: 400
    },
    {
      label: 'Top products with non-numeric limit',
      path: '/api/products/top?limit=abc',
      expectStatus: 400
    },
    {
      label: 'Top customers with SQL injection attempt',
      path: '/api/customers/top?limit=5;DROP+TABLE+customers',
      expectStatus: 400
    },
    {
      label: 'Non-existent endpoint',
      path: '/api/nonexistent',
      expectStatus: 404
    },
  ];

  for (const t of analyticsTests) {
    try {
      const { status, body } = await get(t.path);
      const ok = status === t.expectStatus;
      const icon = ok ? '✅' : '❌';
      console.log(`${icon} [${status}] ${t.label}`);
      
      if (!ok) {
        console.log(`   Expected: ${t.expectStatus} | Got: ${status}`);
        fail++;
      } else {
        pass++;
      }
    } catch (err) {
      console.log(`❌ ${t.label} — REQUEST FAILED: ${err.message}`);
      fail++;
    }
  }

  // ============ Malformed Request Tests ============
  console.log('\n--- Malformed Request Tests ---\n');

  // Test invalid JSON
  try {
    const result = await new Promise((resolve, reject) => {
      const req = http.request(
        { hostname: 'localhost', port: 5000, path: '/api/ask', method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': 20 } },
        (res) => {
          let raw = '';
          res.on('data', c => raw += c);
          res.on('end', () => resolve({ status: res.statusCode, body: raw }));
        }
      );
      req.on('error', reject);
      req.write('{ invalid json }');
      req.end();
    });

    const ok = result.status === 400;
    const icon = ok ? '✅' : '❌';
    console.log(`${icon} [${result.status}] Invalid JSON body`);
    ok ? pass++ : fail++;
  } catch (err) {
    console.log(`❌ Invalid JSON body — REQUEST FAILED: ${err.message}`);
    fail++;
  }

  // Test missing Content-Type
  try {
    const result = await new Promise((resolve, reject) => {
      const data = JSON.stringify({ question: 'test' });
      const req = http.request(
        { hostname: 'localhost', port: 5000, path: '/api/ask', method: 'POST',
          headers: { 'Content-Length': Buffer.byteLength(data) } }, // No Content-Type
        (res) => {
          let raw = '';
          res.on('data', c => raw += c);
          res.on('end', () => resolve({ status: res.statusCode, body: raw }));
        }
      );
      req.on('error', reject);
      req.write(data);
      req.end();
    });

    // Express should still parse it or return 400
    const ok = result.status === 400 || result.status === 422;
    const icon = ok ? '✅' : '❌';
    console.log(`${icon} [${result.status}] Missing Content-Type header`);
    ok ? pass++ : fail++;
  } catch (err) {
    console.log(`❌ Missing Content-Type — REQUEST FAILED: ${err.message}`);
    fail++;
  }

  // ============ Summary ============
  console.log(`\n=== Phase 9 Edge Cases: ${pass} passed, ${fail} failed ===\n`);
  
  if (fail === 0) {
    console.log('✅ All edge case tests passed! Input validation is robust.\n');
  } else {
    console.log('⚠️  Some edge cases need attention. Review failures above.\n');
  }

  process.exit(fail > 0 ? 1 : 0);
}

run();
