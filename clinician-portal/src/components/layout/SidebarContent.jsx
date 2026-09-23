import { ArrowUpRight, Globe2 } from 'lucide-react';
import SidebarNav from './SidebarNav';

export default function SidebarContent({ items, onItemClick }) {
  return (
    <div
      className="flex h-full flex-col border border-border rounded-2xl p-4"
      style={{
        background: 'var(--menu-glow), var(--menu-background)',
        WebkitBackdropFilter: 'blur(18px) saturate(150%)',
        backdropFilter: 'blur(18px) saturate(150%)',
      }}
    >
      <SidebarNav items={items} onItemClick={onItemClick} />
      <div className="mt-auto px-1 pt-3">
        <a
          href="https://www.vitalflohealth.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-fg-muted transition-colors duration-200 hover:bg-surface-raised hover:text-fg"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-raised">
            <Globe2 className="h-3.5 w-3.5" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium">VitalFlo</span>

            <span className="block truncate text-[10px] text-fg-muted">
              Public website
            </span>
          </span>

          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-fg-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}
