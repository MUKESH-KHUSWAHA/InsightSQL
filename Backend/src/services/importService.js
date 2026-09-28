/**
 * Import Service — handles CSV data import to database tables.
 * 
 * Provides safe, transactional import with two modes:
 * - "replace": Truncates the table before inserting (with CASCADE)
 * - "append": Inserts new rows without clearing existing data
 */
const { IMPORT_SCHEMAS } = require('../config/importSchemas');

/**
 * Import CSV rows to a database table.
 * 
 * @param {object} params
 * @param {string} params.table - Table name (customers, products, orders, order_items)
 * @param {Array<object>} params.rows - Array of row objects from parsed CSV
 * @param {string} params.mode - "replace" or "append"
 * @param {Pool} params.pool - PostgreSQL connection pool
 * @returns {Promise<{table: string, mode: string, rowsImported: number}>}
 * @throws {Error} If mode is invalid or any database operation fails
 */
async function importCsvToTable({ table, rows, mode, pool }) {
  // Validate mode
  if (mode !== 'replace' && mode !== 'append') {
    throw new Error(`Invalid import mode: "${mode}". Must be either "replace" or "append".`);
  }

  // Get schema for this table
  const schema = IMPORT_SCHEMAS[table];
  if (!schema) {
    throw new Error(`Table "${table}" is not whitelisted for import.`);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // MODE: Replace — truncate the table first
    // WARNING: This will cascade-delete dependent rows in child tables due to FK constraints
    if (mode === 'replace') {
      console.log(`[IMPORT] Truncating table "${table}" with CASCADE...`);
      await client.query(`TRUNCATE ${table} RESTART IDENTITY CASCADE`);
    }

    // Insert each row using parameterized query
    const columns = schema.columns;
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const insertSql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Build values array in the same order as columns
        const values = columns.map(col => row[col]);
        await client.query(insertSql, values);
      } catch (rowErr) {
        // Check if this is a duplicate key violation (Postgres error code 23505)
        if (rowErr.code === '23505') {
          // Extract the ID column name and value for a clearer message
          const idColumn = schema.hasIdColumn;
          const idValue = row[idColumn];
          throw new Error(
            `Row ${i + 1}: this record already exists (ID ${idValue}). ` +
            `To overwrite existing data, use 'Replace' mode instead of 'Append', ` +
            `or remove this row from your CSV and try again.`
          );
        }
        
        // For all other database errors, provide detailed error
        throw new Error(
          `Row ${i + 1} failed to insert: ${rowErr.message}. ` +
          `Row data: ${JSON.stringify(row)}`
        );
      }
    }

    // Resync the ID sequence so future auto-generated IDs don't collide
    const idColumn = schema.hasIdColumn;
    const sequenceName = `pg_get_serial_sequence('${table}', '${idColumn}')`;
    await client.query(
      `SELECT setval(${sequenceName}, (SELECT MAX(${idColumn}) FROM ${table}))`
    );

    await client.query('COMMIT');

    return {
      table,
      mode,
      rowsImported: rows.length,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  importCsvToTable,
};
