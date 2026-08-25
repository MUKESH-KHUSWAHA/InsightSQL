const express = require('express');
const { pool } = require('../db/pool');

const router = express.Router();

/**
 * GET /api/health
 * Returns server status and database connectivity.
 */
router.get('/', async (req, res, next) => {
  try {
    // Test database connectivity with a simple query
    const result = await pool.query('SELECT NOW() AS server_time');
    const serverTime = result.rows[0].server_time;

    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      serverTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Database is unreachable but the server itself is running
    res.status(503).json({
      success: false,
      status: 'degraded',
      database: 'disconnected',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
