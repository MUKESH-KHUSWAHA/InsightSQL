const express = require('express');
const { askQuestion } = require('../controllers/askController');

const router = express.Router();

/**
 * POST /api/ask
 * Body: { "question": "Which products sold the most?" }
 * Returns: { success, data: { question, sql, columns, rows, rowCount } }
 */
router.post('/ask', askQuestion);

module.exports = router;
