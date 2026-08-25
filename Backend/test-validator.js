/**
 * Quick validator unit test — run: node test-validator.js
 */
const { validateSQL } = require('./src/utils/sqlValidator');

const tests = [
  // --- Should be VALID ---
  { sql: 'SELECT * FROM customers', expect: true, label: 'Simple SELECT' },
  { sql: 'WITH t AS (SELECT 1) SELECT * FROM t', expect: true, label: 'CTE' },
  { sql: "SELECT name FROM customers WHERE status = 'delete this'", expect: true, label: 'DELETE in string literal' },
  { sql: 'SELECT 1 -- DROP TABLE customers', expect: true, label: 'DROP in comment' },
  { sql: 'SELECT SUM(quantity) FROM order_items', expect: true, label: 'Aggregation' },

  // --- Should be INVALID ---
  { sql: 'DROP TABLE customers', expect: false, label: 'DROP TABLE' },
  { sql: 'SELECT 1; DROP TABLE customers', expect: false, label: 'Multi-statement with DROP' },
  { sql: 'INSERT INTO customers VALUES (1)', expect: false, label: 'INSERT' },
  { sql: "UPDATE customers SET name = 'x'", expect: false, label: 'UPDATE' },
  { sql: 'DELETE FROM customers', expect: false, label: 'DELETE' },
  { sql: 'TRUNCATE TABLE orders', expect: false, label: 'TRUNCATE' },
  { sql: 'SELECT * FROM customers; SELECT * FROM products', expect: false, label: 'Multi-statement' },
  { sql: 'ALTER TABLE customers ADD COLUMN test INT', expect: false, label: 'ALTER' },
  { sql: '', expect: false, label: 'Empty string' },
];

let pass = 0;
let fail = 0;

for (const t of tests) {
  const { valid, reason } = validateSQL(t.sql);
  const ok = valid === t.expect;
  const icon = ok ? '✅' : '❌';
  const status = valid ? 'VALID  ' : 'INVALID';
  console.log(`${icon} [${status}] ${t.label}`);
  if (!ok) {
    console.log(`   ⚠ Expected: ${t.expect} | Got: ${valid}`);
    if (reason) console.log(`   Reason: ${reason}`);
    fail++;
  } else {
    pass++;
  }
}

console.log(`\n=== ${pass} pass, ${fail} fail ===`);
process.exit(fail > 0 ? 1 : 0);
