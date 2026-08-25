/**
 * SQL Safety Validator
 *
 * Multi-layer validation for AI-generated SQL before execution.
 * Never trust LLM output — validate thoroughly before running.
 *
 * Layers:
 *  1. Strip SQL comments (line + block) before analysis
 *  2. Ensure the query starts with SELECT or WITH
 *  3. Reject dangerous DML/DDL keywords
 *  4. Reject multiple statements (semicolons)
 *  5. Reject empty queries
 */

// Keywords that must never appear in a safe read-only query
const DANGEROUS_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'ALTER',
  'TRUNCATE',
  'CREATE',
  'GRANT',
  'REVOKE',
  'COPY',
  'CALL',
  'EXECUTE',
  'VACUUM',
  'REINDEX',
  'CLUSTER',
  'COMMENT',
  'LOCK',
  'NOTIFY',
  'LISTEN',
  'UNLISTEN',
  'LOAD',
  'IMPORT',
  'EXPORT',
];

/**
 * Remove single-line (--) and block (/* * /) SQL comments from a query string.
 * This prevents bypass attempts like:
 *   SELECT 1; -- DROP TABLE users
 */
function stripComments(sql) {
  // Remove block comments /* ... */
  let result = sql.replace(/\/\*[\s\S]*?\*\//g, ' ');
  // Remove line comments -- ...
  result = result.replace(/--[^\n]*/g, ' ');
  return result;
}

/**
 * Remove string literals to avoid false positives where a keyword appears
 * inside a string value like WHERE name = 'DELETE ME'.
 */
function stripStringLiterals(sql) {
  // Replace single-quoted string contents with empty placeholder
  return sql.replace(/'([^'\\]|\\.)*'/g, "''");
}

/**
 * Validate AI-generated SQL for safety.
 *
 * @param {string} sql — raw SQL string from the LLM
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateSQL(sql) {
  if (!sql || typeof sql !== 'string') {
    return { valid: false, reason: 'No SQL was generated.' };
  }

  const trimmed = sql.trim();

  if (trimmed.length === 0) {
    return { valid: false, reason: 'Generated SQL is empty.' };
  }

  if (trimmed.length > 10000) {
    return { valid: false, reason: 'Generated SQL exceeds maximum allowed length.' };
  }

  // Strip comments and string literals before analysis
  const stripped = stripStringLiterals(stripComments(trimmed));
  const normalized = stripped.trim().toUpperCase();

  // Rule 1: Must begin with SELECT or WITH (CTEs start with WITH)
  if (!normalized.startsWith('SELECT') && !normalized.startsWith('WITH')) {
    return {
      valid: false,
      reason: 'Only SELECT queries are allowed. This query does not start with SELECT or WITH.',
    };
  }

  // Rule 2: Reject dangerous keywords as standalone words (word boundary)
  for (const keyword of DANGEROUS_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(stripped)) {
      return {
        valid: false,
        reason: `Query contains disallowed keyword: ${keyword}. Only read-only SELECT queries are permitted.`,
      };
    }
  }

  // Rule 3: Reject multiple statements
  // Split on semicolons (after stripping comments/strings) and check for multiple real statements
  const statements = stripped
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (statements.length > 1) {
    return {
      valid: false,
      reason: 'Multiple SQL statements are not allowed. Only a single SELECT query is permitted.',
    };
  }

  return { valid: true };
}

module.exports = { validateSQL };
