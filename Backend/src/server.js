const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const healthRoutes = require('./routes/healthRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const askRoutes = require('./routes/askRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// --------------- Middleware ---------------

// CORS — allow frontend (Vite dev server locally, Vercel in production)
const allowedOrigins =
  env.NODE_ENV === 'production'
    ? [env.FRONTEND_URL || 'https://insight-sql-eosin.vercel.app']
    : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json({ limit: '1mb' }));

// --------------- Routes ---------------

// Root route - for health check when visiting base URL
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'InsightSQL Backend API',
    version: '1.0.0',
    environment: env.NODE_ENV,
    endpoints: {
      health: '/api/health',
      summary: '/api/summary',
      revenue: '/api/revenue/monthly',
      products: '/api/products/top',
      customers: '/api/customers/top',
      atRisk: '/api/customers/at-risk',
      retention: '/api/retention',
      ask: 'POST /api/ask'
    }
  });
});

app.use('/api/health', healthRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', askRoutes);

// --------------- Error Handling ---------------

// 404 for unmatched routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// --------------- Start Server ---------------

app.listen(env.PORT, () => {
  console.log(`\n🚀 InsightSQL Backend running on http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`   Health check: http://localhost:${env.PORT}/api/health\n`);
});

module.exports = app;