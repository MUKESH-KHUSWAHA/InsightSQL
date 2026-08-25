import { NavLink } from 'react-router-dom';

/**
 * Top header bar — shows on mobile and as a page-level header on desktop.
 */
export default function Header({ title, subtitle }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-surface-600 bg-surface-800 md:bg-transparent md:border-0 md:py-6">
      {/* Mobile logo (hidden on desktop where sidebar has it) */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-6 h-6 rounded bg-primary-600 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 8h6M9 16h4" />
          </svg>
        </div>
        <span className="text-sm font-bold text-white">InsightSQL</span>
      </div>

      {/* Page title (desktop only) */}
      <div className="hidden md:block">
        {title && <h1 className="text-xl font-bold text-white">{title}</h1>}
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Mobile nav pills */}
      <nav className="flex items-center gap-1 md:hidden">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? 'bg-primary-600/20 text-primary-400'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/ask"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? 'bg-primary-600/20 text-primary-400'
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          Ask AI
        </NavLink>
      </nav>

      {/* Desktop right-side badge */}
      <div className="hidden md:flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-900/30 border border-emerald-800/50 rounded-full text-[10px] font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Data
        </span>
      </div>
    </header>
  );
}
