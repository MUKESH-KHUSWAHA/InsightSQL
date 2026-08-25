/**
 * Dashboard page — the main analytics view.
 *
 * Layout:
 *   Row 1: 4 Summary Cards (Revenue, Orders, Customers, Retention)
 *   Row 2: Revenue Trend Chart (full width)
 *   Row 3: Top Products Chart (60%) | Retention Ring (40%)
 *   Row 4: Top Customers Table (50%) | At-Risk Table (50%)
 *
 * Every section fetches its own data via useApi → no prop-drilling.
 */
import Header from '../components/Header';
import SummaryCard from '../components/SummaryCard';
import RevenueChart from '../components/RevenueChart';
import TopProductsChart from '../components/TopProductsChart';
import TopCustomersTable from '../components/TopCustomersTable';
import AtRiskTable from '../components/AtRiskTable';
import RetentionCard from '../components/RetentionCard';
import useApi from '../hooks/useApi';
import { fetchSummary, fetchRetention } from '../services/api';

// ---- Icon helpers (inline SVG keeps zero extra deps) ----

const Icons = {
  revenue: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  orders: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  customers: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  retention: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
};

// ---- Summary cards section ----

function SummaryCards() {
  const { data: summary, loading: sLoading } = useApi(fetchSummary);
  const { data: retention, loading: rLoading } = useApi(fetchRetention);

  const revenue = summary
    ? `$${summary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : '—';
  const orders = summary ? summary.total_orders.toLocaleString('en-US') : '—';
  const customers = summary ? summary.total_customers.toLocaleString('en-US') : '—';
  const retentionRate = retention ? `${retention.retention_rate_pct}%` : '—';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        label="Total Revenue"
        value={revenue}
        icon={Icons.revenue}
        accent="bg-primary-600/20 text-primary-400"
        loading={sLoading}
      />
      <SummaryCard
        label="Total Orders"
        value={orders}
        icon={Icons.orders}
        accent="bg-sky-600/20 text-sky-400"
        loading={sLoading}
      />
      <SummaryCard
        label="Total Customers"
        value={customers}
        icon={Icons.customers}
        accent="bg-violet-600/20 text-violet-400"
        loading={sLoading}
      />
      <SummaryCard
        label="Retention Rate"
        value={retentionRate}
        icon={Icons.retention}
        accent="bg-emerald-600/20 text-emerald-400"
        loading={rLoading}
      />
    </div>
  );
}

// ---- Main Dashboard ----

export default function Dashboard() {
  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Dashboard"
        subtitle="Business analytics from your Neon PostgreSQL database"
      />

      <div className="flex-1 p-4 md:p-6 space-y-6">
        {/* Row 1: KPI Summary Cards */}
        <SummaryCards />

        {/* Row 2: Revenue Trend */}
        <RevenueChart />

        {/* Row 3: Top Products + Retention */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <TopProductsChart />
          </div>
          <div className="lg:col-span-2">
            <RetentionCard />
          </div>
        </div>

        {/* Row 4: Top Customers + At-Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopCustomersTable />
          <AtRiskTable />
        </div>
      </div>
    </div>
  );
}
