/**
 * Import Schema Definitions
 * 
 * Whitelists the 4 importable tables and their exact expected CSV headers,
 * matching the actual database schema as verified in reseed.js.
 */

const IMPORT_SCHEMAS = {
  customers: {
    columns: ['customer_id', 'name', 'email', 'signup_date'],
    hasIdColumn: 'customer_id',
  },
  products: {
    columns: ['product_id', 'name', 'category', 'price'],
    hasIdColumn: 'product_id',
  },
  orders: {
    columns: ['order_id', 'customer_id', 'order_date', 'status'],
    hasIdColumn: 'order_id',
  },
  order_items: {
    columns: ['order_item_id', 'order_id', 'product_id', 'quantity', 'unit_price'],
    hasIdColumn: 'order_item_id',
  },
};

// Order for TRUNCATE operations (children first to avoid FK constraint violations)
const TABLE_DEPENDENCY_ORDER = ['order_items', 'orders', 'customers', 'products'];

// Reverse order for INSERT operations (parents first)
const TABLE_INSERT_ORDER = ['products', 'customers', 'orders', 'order_items'];

module.exports = {
  IMPORT_SCHEMAS,
  TABLE_DEPENDENCY_ORDER,
  TABLE_INSERT_ORDER,
};
