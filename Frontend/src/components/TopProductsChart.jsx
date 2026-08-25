/**
 * TopProductsChart — Horizontal bar chart of top revenue-generating products.
 * Data comes from GET /api/products/top?limit=10
 *
 * Each row: { product_id, name, category, total_revenue }
 */
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import useApi from '../hooks/useApi';
import { fetchTopProducts } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

const LIMIT = 8;

// Gradient colour for bars — fade from indigo to violet
const BAR_COLORS = [
  '#6366f1', '#7c3aed', '#8b5cf6', '#6366f1',
  '#818cf8', '#a5b4fc', '#c7d2fe', '#818cf8',
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface-700 border border-surface-500 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-200 font-medium mb-0.5">{d.name}</p>
      <p className="text-slate-400 mb-1">{d.category}</p>
      <p className="text-primary-400 font-semibold">
        ${d.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function TopProductsChart() {
  const { data, loading, error, retry } = useApi(() => fetchTopProducts(LIMIT));

  // Truncate long names for the Y-axis
  const chartData = data?.map(row => ({
    ...row,
    shortName: row.name.length > 18 ? row.name.slice(0, 18) + '…' : row.name,
  })) ?? [];

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="section-title">Top Products by Revenue</h2>
          <p className="section-subtitle">Highest-grossing products from completed orders</p>
        </div>
        <span className="badge-neutral">Top {LIMIT}</span>
      </div>

      {loading && <LoadingSpinner message="Loading product data…" />}
      {error && <ErrorMessage message={`Unable to load products. ${error}`} onRetry={retry} />}
      {!loading && !error && chartData.length === 0 && (
        <EmptyState message="No product data found." icon="📦" />
      )}

      {!loading && !error && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#252d42" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              tick={{ fill: '#cbd5e1', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
            <Bar dataKey="total_revenue" radius={[0, 4, 4, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
