import { useState } from 'react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { askQuestion } from '../services/api';

/**
 * AskAI page — Natural Language to SQL interface.
 * 
 * User enters a business question → Gemini generates SQL → Backend executes → Display results.
 */
export default function AskAI() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmed = question.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await askQuestion(trimmed);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to process your question.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuestion('');
    setError(null);
    setResult(null);
  };

  const exampleQuestions = [
    'What was our monthly revenue?',
    'Which products generated the most revenue?',
    'Who are our top 5 customers by spending?',
    'Which customers have not ordered in over 90 days?',
    'What percentage of customers made a repeat purchase?',
  ];

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Ask AI"
        subtitle="Ask business questions in natural language — powered by Gemini"
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Question Input Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-slate-200 mb-2">
                Your Question
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What was our total revenue last month?"
                className="w-full px-4 py-3 bg-surface-900 border border-surface-600 rounded-lg 
                         text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 
                         focus:ring-primary-500 focus:border-transparent resize-none transition-all"
                rows={3}
                maxLength={500}
                disabled={loading}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                {question.length}/500 characters
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Ask AI
                  </>
                )}
              </button>

              {(result || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-ghost"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  New Question
                </button>
              )}
            </div>
          </form>

          {/* Example Questions */}
          {!result && !error && !loading && (
            <div className="mt-6 pt-6 border-t border-surface-600">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                Try These Examples
              </p>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuestion(q)}
                    className="px-3 py-1.5 bg-surface-700 hover:bg-surface-600 border border-surface-500 
                             rounded-lg text-xs text-slate-300 hover:text-slate-100 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <ErrorMessage message={error} onRetry={() => handleSubmit({ preventDefault: () => {} })} />
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-4">
            {/* Question Echo */}
            <div className="card-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" 
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Question
                  </p>
                  <p className="text-sm text-slate-200">
                    {result.question}
                  </p>
                </div>
              </div>
            </div>

            {/* Generated SQL */}
            <div className="card-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" 
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Generated SQL
                  </p>
                  <div className="sql-block">
                    {result.sql}
                  </div>
                </div>
              </div>
            </div>

            {/* Query Results */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="section-title">Query Results</h3>
                  <p className="section-subtitle">
                    {result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'} returned
                  </p>
                </div>
                {result.rowCount > 0 && (
                  <span className="badge-success">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" />
                    </svg>
                    Success
                  </span>
                )}
              </div>

              {result.rowCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-surface-700 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" 
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400">No results found</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {result.columns.map((col) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, idx) => (
                        <tr key={idx}>
                          {result.columns.map((col) => (
                            <td key={col}>
                              {formatCellValue(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !error && !loading && (
          <div className="card flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">Ask a Business Question</h2>
            <p className="text-sm text-slate-400 max-w-md">
              Type your question in natural language, and the AI will convert it to SQL, 
              execute it safely against the database, and show you the results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Format cell values for display in the results table.
 * Handles numbers, dates, booleans, nulls, and objects.
 */
function formatCellValue(value) {
  if (value === null || value === undefined) {
    return <span className="text-slate-500 italic">null</span>;
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    // Format large numbers with commas, keep decimals as-is
    if (Number.isInteger(value)) {
      return value.toLocaleString();
    }
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}
