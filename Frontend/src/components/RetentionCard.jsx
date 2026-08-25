/**
 * RetentionCard — prominently displays the repeat-purchase retention rate.
 * Data comes from GET /api/retention
 *
 * { total_customers, repeat_customers, retention_rate_pct }
 *
 * Definition: % of customers who made at least one order AFTER their first order.
 */
import useApi from '../hooks/useApi';
import { fetchRetention } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function RetentionCard() {
  const { data, loading, error, retry } = useApi(fetchRetention);

  const rate = data?.retention_rate_pct ?? 0;

  // Colour based on rate
  const rateColor =
    rate >= 70 ? 'text-emerald-400' :
    rate >= 40 ? 'text-amber-400' :
    'text-rose-400';

  const ringColor =
    rate >= 70 ? '#34d399' :
    rate >= 40 ? '#fbbf24' :
    '#f87171';

  // SVG ring parameters
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <div className="card flex flex-col h-full">
      <div className="mb-4">
        <h2 className="section-title">Repeat-Purchase Retention</h2>
        <p className="section-subtitle">
          % of customers with at least one order after their first
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading retention data…" />}
      {error && <ErrorMessage message={`Unable to load retention data. ${error}`} onRetry={retry} />}

      {!loading && !error && data && (
        <div className="flex flex-col items-center justify-center flex-1 gap-6 py-4">
          {/* Ring gauge */}
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
              {/* Track */}
              <circle
                cx="70" cy="70" r={radius}
                fill="none"
                stroke="#1e2536"
                strokeWidth="12"
              />
              {/* Progress */}
              <circle
                cx="70" cy="70" r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${rateColor}`}>{rate}%</span>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-surface-700 rounded-lg p-3 text-center">
              <p className="metric-label mb-1">Total Customers</p>
              <p className="text-xl font-bold text-white">{data.total_customers}</p>
            </div>
            <div className="bg-surface-700 rounded-lg p-3 text-center">
              <p className="metric-label mb-1">Repeat Buyers</p>
              <p className={`text-xl font-bold ${rateColor}`}>{data.repeat_customers}</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            {data.repeat_customers} of {data.total_customers} customers placed more than one order.
          </p>
        </div>
      )}
    </div>
  );
}
