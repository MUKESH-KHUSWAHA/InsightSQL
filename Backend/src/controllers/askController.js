/**
 * Ask Controller — handles POST /api/ask
 *
 * Full NL-to-SQL flow:
 *
 *   1. Validate request body (question must be a non-empty string)
 *   2. Send question + schema to Gemini → receive generated SQL
 *   3. Validate the SQL for safety (sqlValidator)
 *   4. Execute in a read-only transaction (readOnlyExecutor)
 *   5. Return: { question, sql, columns, rows, rowCount }
 *
 * Error handling covers every step so the frontend always gets
 * a useful message rather than a raw exception.
 */
const { generateSQL } = require('../services/aiService');
const { validateSQL } = require('../utils/sqlValidator');
const { executeReadOnly } = require('../utils/readOnlyExecutor');

/**
 * POST /api/ask
 * Body: { question: string }
 */
async function askQuestion(req, res, next) {
  try {
    const { question } = req.body;

    // --------------- 1. Input validation ---------------
    if (!question || typeof question !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Request body must include a "question" field (string).',
      });
    }

    const trimmedQuestion = question.trim();

    if (trimmedQuestion.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Question cannot be empty.',
      });
    }

    if (trimmedQuestion.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Question is too long. Please keep it under 500 characters.',
      });
    }

    // --------------- 2. Generate SQL ---------------
    let generatedSQL;
    try {
      generatedSQL = await generateSQL(trimmedQuestion);
    } catch (aiErr) {
      // Distinguish "unrelated question" from API failures
      return res.status(422).json({
        success: false,
        error: aiErr.message,
      });
    }

    // --------------- 3. Validate SQL ---------------
    const { valid, reason } = validateSQL(generatedSQL);
    if (!valid) {
      return res.status(422).json({
        success: false,
        error: `The AI generated an unsafe query and it was blocked. Reason: ${reason}`,
        generatedSQL, // Show the blocked SQL for transparency in development
      });
    }

    // --------------- 4. Execute read-only ---------------
    let queryResult;
    try {
      queryResult = await executeReadOnly(generatedSQL);
    } catch (dbErr) {
      return res.status(422).json({
        success: false,
        error: dbErr.message,
        generatedSQL, // Show the SQL that caused the issue
      });
    }

    // --------------- 5. Return result ---------------
    return res.json({
      success: true,
      data: {
        question: trimmedQuestion,
        sql: generatedSQL,
        columns: queryResult.columns,
        rows: queryResult.rows,
        rowCount: queryResult.rowCount,
      },
    });
  } catch (err) {
    // Unexpected error — let the global error handler deal with it
    next(err);
  }
}

module.exports = { askQuestion };
