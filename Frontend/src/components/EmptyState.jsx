/**
 * EmptyState — shown when a query returns zero rows.
 * Accepts `message` and optional `icon`.
 */
export default function EmptyState({ message = 'No data available.', icon = '📭' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-slate-500">
      <span className="text-3xl" aria-hidden="true">{icon}</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}
