/**
 * ChurnCard — displays customer churn analysis.
 * Data comes from GET /api/customers/churn
 *
 * { active_customers, churned_customers, churn_rate_pct, churned_list }
 *
 * Definition: Customers who haven't ordered in 180+ days are considered "churned".
 */
import useApi from '../hooks/useApi';
import { fetchCustomerChurn } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function ChurnCard() {
  const { data, loading, error, retry } = useApi(fetchCustomerChurn);

  const rate = data?.churn_rate_pct ?? 0;
  const churned = data?.churned_list ?? [];
  const visible = churned.slice(0, 10);
  const remaining = Math.max(0, churned.length - 10);

  // Colour based on rate (lower is better for churn)
  const rateColor =
    rate <= 20 ? 'text-emerald-400' :
    rate <= 40 ? 'text-amber-400' :
    'text-rose-400';

  return (
    <div className="card flex flex-col h-full">
      <div className="mb-4">
        <h2 className="section-title">Customer Churn Analysis</h2>
        <p className="section-subtitle">
          Customers inactive for 180+ days
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading churn data…" />}
      {error && <ErrorMessage message={`Unable to load churn data. ${error}`} onRetry={retry} />}

      {!loading && !error && data && (
        <div className="flex flex-col gap-4">
          {/* Headline stat - Churn Rate */}
          <div className="flex items-center justify-center bg-surface-700 rounded-lg p-4">
            <div className="text-center">
              <p className="metric-label mb-2">Churn Rate</p>
              <p className={`text-4xl font-bold ${rateColor}`}>{rate}%</p>
            </div>
          </div>

          {/* Sub-stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-700 rounded-lg p-3 text-center">
              <p className="metric-label mb-1">Active</p>
              <p className="text-xl font-bold text-emerald-400">{data.active_customers}</p>
            </div>
            <div className="bg-surface-700 rounded-lg p-3 text-center">
              <p className="metric-label mb-1">Churned</p>
              <p className="text-xl font-bold text-rose-400">{data.churned_customers}</p>
            </div>
          </div>

          {/* Churned customers list */}
          {churned.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                Most At-Risk Churned Customers
              </p>
              <div className="bg-surface-700 rounded-lg max-h-[200px] overflow-y-auto">
                {visible.map((customer, idx) => (
                  <div
                    key={customer.customer_id}
                    className="flex items-center justify-between px-3 py-2 border-b border-surface-600 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{customer.name}</p>
                    </div>
                    <div className="text-xs text-slate-400 ml-3 shrink-0">
                      {customer.days_since_last_order} days
                    </div>
                  </div>
                ))}
              </div>
              {remaining > 0 && (
                <p className="text-xs text-slate-500 mt-2 text-center">
                  +{remaining} more churned customer{remaining !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {churned.length === 0 && (
            <div className="text-center py-6 text-slate-400">
              <p className="text-sm">🎉 No churned customers!</p>
              <p className="text-xs mt-1">All customers have ordered in the last 180 days.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
