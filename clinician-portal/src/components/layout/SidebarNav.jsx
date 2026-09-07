import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// [CONFIG] Add a new resource by adding one line here + dropping the
// matching PDF into `public/resources/` in the frontend project.
const RESOURCES = [
  { label: 'Assessing Asthma', file: 'assessing-asthma.pdf' },
  { label: 'Asthma Action Plan', file: 'asthma-action-plan.pdf' },
  { label: 'Spirometry Summary', file: 'spirometry-summary.pdf' },
  { label: 'ATS 2019 Update', file: 'ats-2019-update.pdf' },
  { label: 'Interpretation of PFTs', file: 'interpretation-of-pfts.pdf' },
];

export default function SidebarNav({ items, onItemClick }) {
  const location = useLocation();
  const [resourcesOpen, setResourcesOpen] = useState(true);
  const isDark = document.documentElement.classList.contains('dark');
  return (
    <nav
      className="flex-1 space-y-0.5 p-3 pt-4 overflow-auto"
      style={{
        scrollbarColor: isDark ? '#4b5563 transparent' : '#d1d5db transparent',
        scrollbarWidth: 'thin',
      }}
    >
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

      {/* [ADDED] Resources section — collapsible, each link opens its PDF
          in a new tab. Files live in `public/resources/` (see RESOURCES
          above). This does not use <Link> since these aren't app routes. */}
      <div className="pt-3">
        <button
          type="button"
          onClick={() => setResourcesOpen((o) => !o)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-300 transition-all hover:bg-white/5 hover:text-white"
        >
          <FileText className="h-4 w-4 shrink-0 text-brand-400/60" />
          <span className="flex-1 text-left">Resources</span>
          {resourcesOpen ? (
            <ChevronUp className="h-4 w-4 text-brand-400/60" />
          ) : (
            <ChevronDown className="h-4 w-4 text-brand-400/60" />
          )}
        </button>

        {resourcesOpen && (
          <div className="mt-0.5 space-y-0.5 pl-4">
            {RESOURCES.map((r) => (
              <a
                key={r.file}
                href={`/resources/${r.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-300 transition-all hover:bg-white/5 hover:text-white"
              >
                <FileText className="h-4 w-4 shrink-0 text-brand-400/60 transition-colors group-hover:text-brand-400" />
                {r.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
