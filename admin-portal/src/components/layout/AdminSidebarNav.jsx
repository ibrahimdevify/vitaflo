import { Link, useLocation } from 'react-router-dom';

export default function AdminSidebarNav({ items, onItemClick }) {
  const location = useLocation();

  return (
    <nav className="flex-1 space-y-0.5 p-3 pt-4 overflow-auto">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-400/70">
        Main Menu
      </p>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              isActive
                ? 'bg-white/10 text-white'
                : 'text-brand-300 hover:bg-white/5 hover:text-white'
            }`}
            onClick={onItemClick}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-brand-400" />
            )}
            <item.icon
              className={`h-4 w-4 shrink-0 transition-colors ${
                isActive
                  ? 'text-brand-400'
                  : 'text-brand-400/60 group-hover:text-brand-400'
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
