/**
 * AtRiskTable — customers who haven't ordered in > 90 days.
 * Data comes from GET /api/customers/at-risk
 *
 * Each row: { customer_id, name, last_order, days_since_last_order }
 */
import useApi from '../hooks/useApi';
import { fetchAtRiskCustomers } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

// Urgency colour based on days inactive
function urgencyClass(days) {
  if (days > 365) return 'text-rose-400';
  if (days > 180) return 'text-orange-400';
  return 'text-amber-400';
}

function urgencyBadge(days) {
  if (days > 365) return <span className="badge-danger">{days}d</span>;
  return <span className="badge bg-orange-900/40 text-orange-400 border border-orange-800">{days}d</span>;
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function AtRiskTable() {
  const { data, loading, error, retry } = useApi(fetchAtRiskCustomers);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="section-title">At-Risk Customers</h2>
          <p className="section-subtitle">Last completed order was more than 90 days ago</p>
        </div>
        {data && (
          <span className="badge-danger">{data.length} at risk</span>
        )}
      </div>

      {loading && <LoadingSpinner message="Loading at-risk data…" />}
      {error && <ErrorMessage message={`Unable to load at-risk customers. ${error}`} onRetry={retry} />}
      {!loading && !error && (!data || data.length === 0) && (
        <EmptyState message="No at-risk customers. Great retention!" icon="✅" />
      )}

      {!loading && !error && data && data.length > 0 && (
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="data-table">
            <thead className="sticky top-0 bg-surface-800">
              <tr>
                <th>Customer</th>
                <th>Last Order</th>
                <th className="text-right">Inactive</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.customer_id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-rose-900/40 border border-rose-800/50 flex items-center justify-center text-[10px] font-bold text-rose-400 shrink-0">
                        {row.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`font-medium ${urgencyClass(row.days_since_last_order)}`}>
                        {row.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-slate-400">{formatDate(row.last_order)}</td>
                  <td className="text-right">{urgencyBadge(row.days_since_last_order)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
