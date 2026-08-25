const env = require('../config/env');

/**
 * Global error handling middleware.
 * Catches errors thrown in route handlers and returns consistent JSON.
 */
const errorHandler = (err, req, res, _next) => {
  console.error('❌ Unhandled error:', err.message);

  // In development, include the stack trace for debugging
  if (env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : err.message,
  });
};

/**
 * 404 handler for unknown routes.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFoundHandler };
