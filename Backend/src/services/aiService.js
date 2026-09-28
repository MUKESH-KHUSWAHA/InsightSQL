/**
 * AI Service — Gemini NL-to-SQL generation.
 *
 * Responsibilities:
 *  1. Build a schema-aware system prompt
 *  2. Send the user's question to Gemini
 *  3. Parse and clean the returned SQL
 *
 * Security rules:
 *  - Only the database schema is sent to Gemini (no actual data rows)
 *  - The API key is loaded from environment (never hardcoded)
 *  - Generated SQL is NOT trusted — it is validated before execution
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

// Initialise the Gemini client (done once at module load)
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// --------------- Schema-aware system prompt ---------------

const SYSTEM_PROMPT = `
You are a PostgreSQL analytics SQL generator for the InsightSQL business analytics platform.

Your ONLY job is to convert the user's natural language business question into a single, valid PostgreSQL SELECT query.

## Database Schema

customers (
  customer_id  SERIAL PRIMARY KEY,
  name         VARCHAR(100),
  email        VARCHAR(100),
  signup_date  DATE
)

products (
  product_id  SERIAL PRIMARY KEY,
  name        VARCHAR(100),
  category    VARCHAR(50),
  price       NUMERIC(10,2)
)

orders (
  order_id     SERIAL PRIMARY KEY,
  customer_id  INT  REFERENCES customers(customer_id),
  order_date   DATE,
  status       VARCHAR(20) DEFAULT 'completed'
)

order_items (
  order_item_id  SERIAL PRIMARY KEY,
  order_id       INT  REFERENCES orders(order_id),
  product_id     INT  REFERENCES products(product_id),
  quantity       INT,
  unit_price     NUMERIC(10,2)
)

## Relationships

orders.customer_id       → customers.customer_id
order_items.order_id     → orders.order_id
order_items.product_id   → products.product_id

Revenue = SUM(order_items.quantity * order_items.unit_price)
Always filter on: WHERE orders.status = 'completed'

## Rules

- Generate PostgreSQL SQL only.
- Always produce a single SELECT query (or a CTE that leads to a SELECT).
- CTEs (WITH clauses) are allowed.
- JOINs are allowed.
- Aggregations (SUM, COUNT, AVG, MAX, MIN) are allowed.
- Window functions are allowed.
- LIMIT is allowed and encouraged for top-N queries.
- NEVER generate INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, GRANT, REVOKE, or COPY.
- NEVER include explanations, markdown, or code fences.
- Return ONLY the raw SQL — nothing else.
- If the question is unrelated to this business database, respond exactly with: UNRELATED_QUESTION
`.trim();

// --------------- SQL extraction ---------------

/**
 * Extract raw SQL from the LLM response.
 * Gemini sometimes wraps output in markdown code fences even when told not to.
 * Strip those if present.
 */
function extractSQL(rawResponse) {
  let text = rawResponse.trim();

  // Remove ```sql ... ``` or ``` ... ``` fences
  text = text.replace(/^```(?:sql)?\s*/i, '').replace(/\s*```\s*$/, '');

  // Remove any leading/trailing whitespace again
  text = text.trim();

  // Remove trailing semicolons (we add none ourselves; the validator handles this)
  // Keep it as-is for the validator to inspect
  return text;
}

// --------------- Transient-overload retry helper ---------------

// Backoff delays (ms) before each retry attempt — only used for 503/overload errors
const OVERLOAD_RETRY_DELAYS_MS = [1000, 3000];

function isOverloadError(err) {
  if (err && err.status === 503) return true;
  const msg = (err && err.message) || '';
  return /overloaded|high demand|503|service unavailable/i.test(msg);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call Gemini's generateContent, retrying only on transient 503/overload
 * errors with a short backoff. Any other error (bad API key, invalid
 * request, etc.) is thrown immediately without retrying.
 */
async function callGeminiWithRetry(model, prompt) {
  let lastErr;
  for (let attempt = 0; attempt <= OVERLOAD_RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      lastErr = err;
      const hasRetriesLeft = attempt < OVERLOAD_RETRY_DELAYS_MS.length;
      if (hasRetriesLeft && isOverloadError(err)) {
        const delay = OVERLOAD_RETRY_DELAYS_MS[attempt];
        console.error(
          `[aiService] Gemini overloaded (attempt ${attempt + 1}/${OVERLOAD_RETRY_DELAYS_MS.length + 1}), retrying in ${delay}ms:`,
          err.message
        );
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// --------------- Main export ---------------

/**
 * Generate a PostgreSQL SELECT query from a natural language question.
 *
 * @param {string} question — the user's business question
 * @returns {Promise<string>} — the generated SQL string
 * @throws {Error} — if the question is unrelated or the API call fails
 */
async function generateSQL(question) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.8-flash',
    generationConfig: {
      temperature: 0.1,        // Low temperature = deterministic, accurate SQL
      maxOutputTokens: 1024,   // SQL queries don't need to be long
    },
  });

  const prompt = `${SYSTEM_PROMPT}\n\nUser question: ${question}`;

  let result;
  try {
    result = await callGeminiWithRetry(model, prompt);
  } catch (err) {
    // Never let raw vendor/technical error text (endpoint URLs, SDK error
    // class names, etc.) reach the client — log it here for debugging and
    // surface a clean, generic message instead.
    console.error('[aiService] Gemini API call failed:', err);
    throw new Error('The AI assistant is temporarily busy handling requests. Please try again in a moment.');
  }

  const rawText = result.response.text();

  // Check if Gemini flagged the question as unrelated
  if (rawText.trim().toUpperCase().includes('UNRELATED_QUESTION')) {
    throw new Error(
      'I can only answer questions related to the business data in InsightSQL (customers, orders, products, revenue).'
    );
  }

  const sql = extractSQL(rawText);

  if (!sql || sql.length === 0) {
    throw new Error('The AI did not return a valid SQL query. Please rephrase your question.');
  }

  return sql;
}

module.exports = { generateSQL };
