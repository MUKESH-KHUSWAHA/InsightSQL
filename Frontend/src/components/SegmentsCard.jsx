/**
 * SegmentsCard — displays customer lifecycle segmentation.
 * Data comes from GET /api/customers/segments
 *
 * { new, active, dormant, lost, segments }
 *
 * Segments: New (0-30 days), Active (31-90), Dormant (91-180), Lost (180+)
 */
import useApi from '../hooks/useApi';
import { fetchCustomerSegments } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function SegmentsCard() {
  const { data, loading, error, retry } = useApi(fetchCustomerSegments);

  const segments = [
    {
      key: 'new',
      label: 'New',
      description: '0-30 days',
      color: 'bg-blue-600',
      textColor: 'text-blue-400',
    },
    {
      key: 'active',
      label: 'Active',
      description: '31-90 days',
      color: 'bg-emerald-600',
      textColor: 'text-emerald-400',
    },
    {
      key: 'dormant',
      label: 'Dormant',
      description: '91-180 days',
      color: 'bg-amber-600',
      textColor: 'text-amber-400',
    },
    {
      key: 'lost',
      label: 'Lost',
      description: '180+ days',
      color: 'bg-rose-600',
      textColor: 'text-rose-400',
    },
  ];

  const total = data ? data.new + data.active + data.dormant + data.lost : 0;

  return (
    <div className="card flex flex-col h-full">
      <div className="mb-4">
        <h2 className="section-title">Customer Lifecycle Segments</h2>
        <p className="section-subtitle">
          Customers grouped by days since last order
        </p>
      </div>

      {loading && <LoadingSpinner message="Loading segment data…" />}
      {error && <ErrorMessage message={`Unable to load segment data. ${error}`} onRetry={retry} />}

      {!loading && !error && data && (
        <div className="flex flex-col gap-4">
          {/* Segment counts as tiles */}
          <div className="grid grid-cols-2 gap-3">
            {segments.map((segment) => {
              const count = data[segment.key] ?? 0;
              const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
              
              return (
                <div
                  key={segment.key}
                  className="bg-surface-700 rounded-lg p-4 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      {segment.label}
                    </p>
                  </div>
                  <p className={`text-2xl font-bold ${segment.textColor} mb-1`}>
                    {count}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {segment.description} • {percentage}%
                  </p>
                </div>
              );
            })}
          </div>

          {/* Total count */}
          <div className="bg-surface-800 rounded-lg p-3 text-center border border-surface-600">
            <p className="metric-label mb-1">Total Customers</p>
            <p className="text-xl font-bold text-white">{total}</p>
          </div>

          {/* Visual bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex">
            {segments.map((segment) => {
              const count = data[segment.key] ?? 0;
              const widthPct = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div
                  key={segment.key}
                  className={segment.color}
                  style={{ width: `${widthPct}%` }}
                  title={`${segment.label}: ${count} (${widthPct.toFixed(0)}%)`}
                />
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Lifecycle stage based on days since last completed order
          </p>
        </div>
      )}
    </div>
  );
}
