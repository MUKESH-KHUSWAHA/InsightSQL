import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/ask',
    label: 'Ask AI',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
];

/**
 * Sidebar navigation — always visible on desktop, hidden on mobile.
 */
export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen bg-surface-800 border-r border-surface-600 px-3 py-6 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 8h6M9 16h4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">InsightSQL</p>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-none">Analytics Platform</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-3 pt-6 border-t border-surface-600">
        <p className="text-[10px] text-slate-600 leading-relaxed">
          Data sourced from Neon PostgreSQL. All analytics are computed live.
        </p>
      </div>
    </aside>
  );
}
