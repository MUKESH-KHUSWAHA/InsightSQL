/**
 * Import Controller — handles CSV upload and validation before import.
 */
const { parse } = require('csv-parse/sync');
const { validateCsvColumns, validateRowTypes } = require('../utils/csvImportValidator');
const { importCsvToTable } = require('../services/importService');
const { pool } = require('../db/pool');

/**
 * POST /api/admin/import/:table?mode=append|replace
 * 
 * Uploads a CSV file and imports it to the specified table.
 * Mode defaults to "append" if not specified.
 */
async function handleCsvImport(req, res, next) {
  try {
    // Extract table from URL params
    const table = req.params.table;
    
    // Extract mode from query params (default to "append" for safety)
    const mode = req.query.mode || 'append';

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please attach a CSV file.',
      });
    }

    // Parse CSV from memory buffer
    const buffer = req.file.buffer;
    const csvString = buffer.toString('utf8');
    
    let parsedRows;
    try {
      parsedRows = parse(csvString, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (parseErr) {
      return res.status(400).json({
        success: false,
        error: `Failed to parse CSV: ${parseErr.message}`,
      });
    }

    // Validate that CSV has data
    if (!parsedRows || parsedRows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'CSV file is empty or has no valid data rows.',
      });
    }

    // Extract headers from first row
    const headers = Object.keys(parsedRows[0]);

    // Validate column structure BEFORE touching database
    try {
      validateCsvColumns(table, headers);
    } catch (validationErr) {
      return res.status(400).json({
        success: false,
        error: validationErr.message,
      });
    }

    // Validate row data types — collect ALL errors (not just first)
    const rowErrors = [];
    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      try {
        validateRowTypes(table, row);
      } catch (rowErr) {
        rowErrors.push({
          rowIndex: i + 1,
          error: rowErr.message,
          rowData: row,
        });
      }
    }

    // If any row validation errors, return them all
    if (rowErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Found ${rowErrors.length} invalid row(s). See details below.`,
        details: rowErrors,
      });
    }

    // Import to database
    let result;
    try {
      result = await importCsvToTable({
        table,
        rows: parsedRows,
        mode,
        pool,
      });
    } catch (importErr) {
      // Check if this is a duplicate-key error (friendly message already generated)
      // Pattern: "Row X: this record already exists (ID Y)..."
      if (importErr.message.includes('this record already exists')) {
        return res.status(409).json({
          success: false,
          error: importErr.message,
        });
      }
      
      // For all other unexpected database errors, pass to global error handler
      throw importErr;
    }

    // Log success
    console.log(
      `[IMPORT] table=${table} mode=${mode} rows=${result.rowsImported} at ${new Date().toISOString()}`
    );

    // Return success response
    res.json({
      success: true,
      table: result.table,
      mode: result.mode,
      rowsImported: result.rowsImported,
    });
  } catch (err) {
    // Log failure
    console.error(`[IMPORT FAILED] ${err.message}`);
    
    // Pass error to global error handler
    next(err);
  }
}

module.exports = {
  handleCsvImport,
};
