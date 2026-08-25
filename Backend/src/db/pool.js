const { Pool } = require('pg');
const env = require('../config/env');

// Application connection pool — used for standard analytics queries
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log pool errors (but don't crash the server)
pool.on('error', (err) => {
  console.error('⚠️  Unexpected database pool error:', err.message);
});

/**
 * Execute a parameterized query using the application pool.
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
