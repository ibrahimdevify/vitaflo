import {
  Activity,
  Bell,
  ClipboardList,
  FileText,
  LayoutDashboard,
  UserRound,
  Users,
} from 'lucide-react';
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';
import PageLoader from '../ui/PageLoader';
import MobileSidebar from './MobileSidebar';
import SidebarContent from './SidebarContent';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/patients', icon: Users, label: 'My Patients' },
  { path: '/spirometry', icon: Activity, label: 'Spirometry' },
  { path: '/prescriptions', icon: ClipboardList, label: 'Prescriptions' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/profile', icon: UserRound, label: 'Profile' },
];

export default function ClinicianLayout() {
  const { loading } = useAuth();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <SidebarContent items={menuItems} onItemClick={() => setOpen(false)} />
  );

  return (
    <div className="flex h-screen bg-surface">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">{sidebar}</aside>

      {/* Mobile Sidebar */}
      <MobileSidebar open={open} onOpenChange={setOpen}>
        {sidebar}
      </MobileSidebar>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 flex items-center justify-end px-6 py-2 bg-surface/80 backdrop-blur-sm">
          <ThemeToggle />
        </div>
        <div className="p-6">
          {loading ? (
            <PageLoader />
          ) : (
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}
