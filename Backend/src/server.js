const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const healthRoutes = require('./routes/healthRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const askRoutes = require('./routes/askRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// --------------- Middleware ---------------

// CORS — allow frontend (Vite dev server) to call the API
app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Parse JSON request bodies
app.use(express.json({ limit: '1mb' }));

// --------------- Routes ---------------

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
  console.log(`   Health check: http://localhost:${env.PORT}/api/health\n`);
});

module.exports = app;
