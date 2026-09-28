/**
 * SummaryCard — displays a single KPI metric with label and icon.
 *
 * Props:
 *   label     {string}  — e.g. "Total Revenue"
 *   value     {string}  — formatted value e.g. "$451,777"
 *   icon      {ReactNode}
 *   accent    {string}  — Tailwind color class for the icon background, e.g. "bg-primary-600/20 text-primary-400"
 *   loading   {boolean}
 *   highlight {boolean} — adds a colored left border accent (optional)
 */
export default function SummaryCard({ label, value, icon, accent, loading, highlight }) {
  return (
    <div className={`card flex items-start gap-4 ${highlight ? 'border-l-2 border-l-primary-500' : ''}`}>
      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 opacity-70 ${accent}`}>
        {icon}
      </div>

      {/* Metric */}
      <div className="min-w-0">
        <p className="metric-label">{label}</p>
        {loading ? (
          <div className="mt-2 h-7 w-24 bg-surface-600 rounded animate-pulse" />
        ) : (
          <p className="metric-value mt-1">{value}</p>
        )}
      </div>
    </div>
  );
}
