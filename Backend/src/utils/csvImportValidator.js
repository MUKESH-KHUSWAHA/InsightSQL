/**
 * CSV Import Validator
 * 
 * Validates CSV structure and row data before importing to the database.
 */
const { IMPORT_SCHEMAS } = require('../config/importSchemas');

/**
 * Validate CSV column headers against expected schema.
 * 
 * @param {string} table - Table name (must be one of the whitelisted tables)
 * @param {string[]} parsedHeaders - Array of column names from CSV first row
 * @throws {Error} If table is not whitelisted or columns don't match
 */
function validateCsvColumns(table, parsedHeaders) {
  // Check if table is whitelisted
  if (!IMPORT_SCHEMAS[table]) {
    const allowed = Object.keys(IMPORT_SCHEMAS).join(', ');
    throw new Error(
      `Invalid table name: "${table}". Allowed tables: ${allowed}`
    );
  }

  const expectedColumns = IMPORT_SCHEMAS[table].columns;
  const receivedColumns = parsedHeaders;

  // Convert to sets for comparison (order doesn't matter, but all columns must match)
  const expectedSet = new Set(expectedColumns);
  const receivedSet = new Set(receivedColumns);

  // Check if sets are equal
  const missing = expectedColumns.filter(col => !receivedSet.has(col));
  const extra = receivedColumns.filter(col => !expectedSet.has(col));

  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `CSV column mismatch for table "${table}". ` +
      `Expected: [${expectedColumns.join(', ')}]. ` +
      `Received: [${receivedColumns.join(', ')}]. ` +
      (missing.length > 0 ? `Missing: [${missing.join(', ')}]. ` : '') +
      (extra.length > 0 ? `Extra: [${extra.join(', ')}].` : '')
    );
  }
}

/**
 * Validate individual row data types based on table schema.
 * 
 * @param {string} table - Table name
 * @param {object} row - Row object with column values
 * @throws {Error} If row contains invalid data types
 */
function validateRowTypes(table, row) {
  // Basic type validation per table
  switch (table) {
    case 'products':
      if (!row.product_id || isNaN(parseInt(row.product_id, 10))) {
        throw new Error('product_id must be a valid integer');
      }
      if (!row.name || row.name.trim().length === 0) {
        throw new Error('name cannot be empty');
      }
      if (!row.category || row.category.trim().length === 0) {
        throw new Error('category cannot be empty');
      }
      if (!row.price || isNaN(parseFloat(row.price)) || parseFloat(row.price) < 0) {
        throw new Error('price must be a positive number');
      }
      break;

    case 'customers':
      if (!row.customer_id || isNaN(parseInt(row.customer_id, 10))) {
        throw new Error('customer_id must be a valid integer');
      }
      if (!row.name || row.name.trim().length === 0) {
        throw new Error('name cannot be empty');
      }
      if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        throw new Error('email must be a valid email address');
      }
      if (!row.signup_date || isNaN(Date.parse(row.signup_date))) {
        throw new Error('signup_date must be a valid date');
      }
      break;

    case 'orders':
      if (!row.order_id || isNaN(parseInt(row.order_id, 10))) {
        throw new Error('order_id must be a valid integer');
      }
      if (!row.customer_id || isNaN(parseInt(row.customer_id, 10))) {
        throw new Error('customer_id must be a valid integer');
      }
      if (!row.order_date || isNaN(Date.parse(row.order_date))) {
        throw new Error('order_date must be a valid date');
      }
      if (!row.status || row.status.trim().length === 0) {
        throw new Error('status cannot be empty');
      }
      break;

    case 'order_items':
      if (!row.order_item_id || isNaN(parseInt(row.order_item_id, 10))) {
        throw new Error('order_item_id must be a valid integer');
      }
      if (!row.order_id || isNaN(parseInt(row.order_id, 10))) {
        throw new Error('order_id must be a valid integer');
      }
      if (!row.product_id || isNaN(parseInt(row.product_id, 10))) {
        throw new Error('product_id must be a valid integer');
      }
      if (!row.quantity || isNaN(parseInt(row.quantity, 10)) || parseInt(row.quantity, 10) <= 0) {
        throw new Error('quantity must be a positive integer');
      }
      if (!row.unit_price || isNaN(parseFloat(row.unit_price)) || parseFloat(row.unit_price) < 0) {
        throw new Error('unit_price must be a positive number');
      }
      break;

    default:
      throw new Error(`Unknown table: ${table}`);
  }
}

module.exports = {
  validateCsvColumns,
  validateRowTypes,
};
