import { Stethoscope } from 'lucide-react';
import AdminSidebarNav from './AdminSidebarNav';
import AdminSidebarProfile from './AdminSidebarProfile';

export default function AdminSidebar({ items, onItemClick }) {
  return (
    <div className="flex h-full flex-col bg-linear-to-b from-brand-900 to-brand-950 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/20 ring-1 ring-brand-500/30">
          <Stethoscope className="h-5 w-5 text-brand-400" />
        </div>
        <div>
          <span className="text-base font-bold leading-tight block">
            Admin Portal
          </span>
          <span className="text-xs text-brand-400">VitalFlow Health</span>
        </div>
      </div>

      <div className="mx-5 h-px bg-white/5" />

      <AdminSidebarNav items={items} onItemClick={onItemClick} />
      <AdminSidebarProfile />
    </div>
  );
}
