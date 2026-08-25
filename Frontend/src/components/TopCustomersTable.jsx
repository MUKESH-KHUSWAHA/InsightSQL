/**
 * TopCustomersTable — ranked table of highest-value customers.
 * Data comes from GET /api/customers/top?limit=10
 *
 * Each row: { customer_id, name, total_spent }
 */
import useApi from '../hooks/useApi';
import { fetchTopCustomers } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

const LIMIT = 10;

// Medal emoji for top 3
function rank(i) {
  if (i === 0) return '🥇';
  if (i === 1) return '🥈';
  if (i === 2) return '🥉';
  return `#${i + 1}`;
}

export default function TopCustomersTable() {
  const { data, loading, error, retry } = useApi(() => fetchTopCustomers(LIMIT));

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="section-title">Top Customers</h2>
          <p className="section-subtitle">Ranked by total spend on completed orders</p>
        </div>
        <span className="badge-neutral">Top {LIMIT}</span>
      </div>

      {loading && <LoadingSpinner message="Loading customer data…" />}
      {error && <ErrorMessage message={`Unable to load customers. ${error}`} onRetry={retry} />}
      {!loading && !error && (!data || data.length === 0) && (
        <EmptyState message="No customer data found." icon="👤" />
      )}

      {!loading && !error && data && data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-12 text-center">Rank</th>
                <th>Customer</th>
                <th className="text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.customer_id}>
                  <td className="text-center text-base">{rank(i)}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      {/* Avatar initials */}
                      <div className="w-7 h-7 rounded-full bg-primary-900/60 border border-primary-700/40 flex items-center justify-center text-[10px] font-bold text-primary-400 shrink-0">
                        {row.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-200">{row.name}</span>
                    </div>
                  </td>
                  <td className="text-right font-semibold text-emerald-400">
                    ${row.total_spent.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
