import {
  Activity,
  Bell,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Stethoscope,
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

const baseMenuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/patients', icon: Users, label: 'My Patients' },
  { path: '/users', icon: UserRound, label: 'My Clinics', requiredUtId: 6 },
  {
    icon: Stethoscope,
    label: 'Clinical Records',
    children: [
      { path: '/spirometry', icon: Activity, label: 'Spirometry' },
      { path: '/prescriptions', icon: ClipboardList, label: 'Prescriptions' },
      { path: '/notes', icon: FileText, label: 'Notes' },
      { path: '/alerts', icon: Bell, label: 'Alerts' },
    ],
  },
];

export default function ClinicianLayout() {
  const { loading, user } = useAuth();
  const [open, setOpen] = useState(false);

  const filterItems = (items) =>
    items
      .filter((item) => !item.requiredUtId || user?.ut_id_fk === item.requiredUtId)
      .map((item) =>
        item.children
          ? { ...item, children: filterItems(item.children) }
          : item
      );

  const menuItems = filterItems(baseMenuItems);

  const sidebar = (
    <SidebarContent items={menuItems} onItemClick={() => setOpen(false)} />
  );

  return (
    <div className="flex h-screen bg-surface">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 scrollbar-none!">
        {sidebar}
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar open={open} onOpenChange={setOpen}>
        {sidebar}
      </MobileSidebar>

      {/* Main Content */}
      <main
        className="flex-1 overflow-auto"
        style={{
          scrollbarColor: '#9ca3af transparent',
        }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-end px-3 sm:px-6 py-2 bg-surface/80 backdrop-blur-sm">
          <ThemeToggle />
        </div>
        <div className="sm:p-6 p-3">
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