/**
 * RevenueChart — Monthly revenue trend as a line chart.
 * Data comes from GET /api/revenue/monthly
 *
 * Each row: { month: ISO timestamp string, revenue: number }
 */
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import useApi from '../hooks/useApi';
import { fetchMonthlyRevenue } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

// Format ISO date → "Jan 2024"
function formatMonth(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Format revenue number for the Y-axis tick
function formatYAxis(value) {
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
}

// Custom tooltip shown on hover
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-700 border border-surface-500 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-300 font-medium mb-1">{label}</p>
      <p className="text-primary-400 font-semibold">
        ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function RevenueChart() {
  const { data, loading, error, retry } = useApi(fetchMonthlyRevenue);

  // Shape data for Recharts
  const chartData = data?.map(row => ({
    month: formatMonth(row.month),
    revenue: row.revenue,
  })) ?? [];

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="section-title">Monthly Revenue Trend</h2>
          <p className="section-subtitle">Revenue from completed orders, grouped by month</p>
        </div>
        {data && (
          <span className="badge-neutral">{data.length} months</span>
        )}
      </div>

      {loading && <LoadingSpinner message="Loading revenue data…" />}
      {error && <ErrorMessage message={`Unable to load revenue data. ${error}`} onRetry={retry} />}
      {!loading && !error && chartData.length === 0 && (
        <EmptyState message="No revenue data found." icon="📊" />
      )}

      {!loading && !error && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#252d42" strokeOpacity={0.1} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#d97706"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={{ r: 3, fill: '#d97706', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
