/**
 * API service layer — all backend communication goes through here.
 *
 * Base URL uses the Vite proxy in development (/api → http://localhost:5000/api).
 * In production, set VITE_API_URL environment variable.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --------------- Response Interceptor ---------------

// Unwrap the { success, data } envelope on success.
// On API-level errors (success: false) throw a friendly Error.
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && body.success === false) {
      throw new Error(body.error ?? 'An unexpected error occurred.');
    }
    return body;
  },
  (error) => {
    // Network / timeout error
    if (!error.response) {
      throw new Error('Cannot reach the server. Is the backend running?');
    }
    // HTTP error with a JSON body
    const message = error.response.data?.error ?? error.message;
    throw new Error(message);
  }
);

// --------------- Analytics Endpoints ---------------

/**
 * GET /api/summary
 * @returns {{ total_revenue: number, total_orders: number, total_customers: number }}
 */
export async function fetchSummary() {
  const res = await api.get('/api/summary');
  return res.data;
}

/**
 * GET /api/revenue/monthly
 * @returns {Array<{ month: string, revenue: number }>}
 */
export async function fetchMonthlyRevenue() {
  const res = await api.get('/api/revenue/monthly');
  return res.data;
}

/**
 * GET /api/products/top?limit=n
 * @param {number} limit
 * @returns {Array<{ product_id: number, name: string, category: string, total_revenue: number }>}
 */
export async function fetchTopProducts(limit = 10) {
  const res = await api.get('/api/products/top', { params: { limit } });
  return res.data;
}

/**
 * GET /api/customers/top?limit=n
 * @param {number} limit
 * @returns {Array<{ customer_id: number, name: string, total_spent: number }>}
 */
export async function fetchTopCustomers(limit = 10) {
  const res = await api.get('/api/customers/top', { params: { limit } });
  return res.data;
}

/**
 * GET /api/customers/at-risk
 * @returns {Array<{ customer_id: number, name: string, last_order: string, days_since_last_order: number }>}
 */
export async function fetchAtRiskCustomers() {
  const res = await api.get('/api/customers/at-risk');
  return res.data;
}

/**
 * GET /api/retention
 * @returns {{ total_customers: number, repeat_customers: number, retention_rate_pct: number }}
 */
export async function fetchRetention() {
  const res = await api.get('/api/retention');
  return res.data;
}

/**
 * POST /api/ask
 * @param {string} question — natural language business question
 * @returns {{ question: string, sql: string, columns: string[], rows: object[] }}
 */
export async function askQuestion(question) {
  const res = await api.post('/api/ask', { question });
  return res.data;
}

export default api;
