/**
 * Import Routes — CSV data import endpoints.
 * 
 * NOTE: This route has no authentication. It is intentionally left open for demo 
 * purposes in a college project. In a production deployment this MUST be restricted 
 * to authenticated admin users before deployment — see README for details.
 */
const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { handleCsvImport } = require('../controllers/importController');

const router = express.Router();

/**
 * POST /api/admin/import/:table?mode=append|replace
 * 
 * Upload a CSV file and import it to the specified table.
 * - :table must be one of: customers, products, orders, order_items
 * - mode defaults to "append" (safe), can be "replace" (destructive)
 * 
 * Request: multipart/form-data with "file" field containing CSV
 * Response: { success: true, table, mode, rowsImported }
 */
router.post('/:table', upload.single('file'), handleCsvImport);

module.exports = router;
