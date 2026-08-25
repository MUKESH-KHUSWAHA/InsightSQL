/**
 * Read-only SQL executor.
 *
 * Executes AI-generated SQL safely:
 *  1. Acquires a client from the application pool
 *  2. Starts a transaction with SET TRANSACTION READ ONLY
 *     → The database itself enforces read-only. Even if validation missed something,
 *       PostgreSQL will reject any write operation at this point.
 *  3. Sets a 5-second statement timeout
 *  4. Runs the query
 *  5. Always rolls back (not strictly needed for reads, but ensures clean state)
 *
 * This is a defense-in-depth approach:
 *   Layer 1 → SQL validation (sqlValidator.js)
 *   Layer 2 → Database-enforced read-only transaction (this file)
 */
const { pool } = require('../db/pool');

// Maximum time (ms) an AI-generated query is allowed to run
const QUERY_TIMEOUT_MS = 5000;

/**
 * Execute a validated SQL query in a read-only transaction.
 *
 * @param {string} sql — validated SELECT query
 * @returns {Promise<{ columns: string[], rows: object[], rowCount: number }>}
 */
async function executeReadOnly(sql) {
  const client = await pool.connect();

  try {
    // Set a per-statement timeout to prevent runaway queries
    await client.query(`SET statement_timeout = ${QUERY_TIMEOUT_MS}`);

    // Begin a read-only transaction — PostgreSQL enforces this at the DB level
    await client.query('BEGIN READ ONLY');

    const result = await client.query(sql);

    // Always rollback — read-only means we never commit anything
    await client.query('ROLLBACK');

    // Shape the result for the API response
    const columns = result.fields.map(f => f.name);
    const rows = result.rows;

    return { columns, rows, rowCount: result.rowCount };
  } catch (err) {
    // Attempt to rollback on error (best-effort)
    try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ }

    // Make timeout errors user-friendly
    if (err.message && err.message.includes('statement timeout')) {
      throw new Error(
        'Query timed out after 5 seconds. Try a more specific question.'
      );
    }

    // Surface other DB errors as friendly messages
    throw new Error(`Query execution failed: ${err.message}`);
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}

module.exports = { executeReadOnly };
