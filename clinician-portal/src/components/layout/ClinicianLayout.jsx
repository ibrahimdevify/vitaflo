import {
  Activity,
  Bell,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Menu,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';
import { Link, Outlet } from 'react-router';
import desktopLogo from '../../assets/vitalflo-text-logo.png';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';
import PageLoader from '../ui/PageLoader';
import { Sheet, SheetTrigger } from '../ui/sheet';
import HeaderProfile from './HeaderProfile';
import MobileSidebar from './MobileSidebar';
import SidebarContent from './SidebarContent';
const BASE_MENU_ITEMS = [
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

const filterByRole = (items, utId) =>
  items
    .filter((item) => !item.requiredUtId || utId === item.requiredUtId)
    .map((item) =>
      item.children
        ? { ...item, children: filterByRole(item.children, utId) }
        : item
    );

export default function ClinicianLayout() {
  const { loading, user } = useAuth();
  const [open, setOpen] = useState(false);

  const menuItems = useMemo(
    () => filterByRole(BASE_MENU_ITEMS, user?.ut_id_fk),
    [user?.ut_id_fk]
  );

  const sidebar = (
    <SidebarContent items={menuItems} onItemClick={() => setOpen(false)} />
  );

  return (
    <div
      className="bg-surface"
      style={{
        backgroundImage: 'var(--glow)',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <header
        className="fixed top-0 z-30 w-full max-w-(--shell-max) h-(--header-h)"
        style={{
          paddingTop: '12px',
          paddingInline: 'var(--shell-offset-vw)',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div
          className="rounded-2xl border border-border h-full backdrop-blur-[14px] backdrop-saturate-160"
          style={{
            backgroundImage: 'var(--header-glow)',
            background: 'var(--header-glow), var(--header-background)',
          }}
        >
          <div className="flex h-full items-center justify-between px-6">
            {/* Mobile menu trigger — lg pe hide */}
            <div className="block lg:hidden">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-colors hover:bg-surface-raised lg:hidden"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                </SheetTrigger>
              </Sheet>
            </div>

            <Link to="/" className="flex items-center gap-2.5">
              <img
                src={desktopLogo}
                alt="VitalFlow Health"
                className="h-10 w-auto"
              />
            </Link>

            <div className="flex items-center gap-1.5 ">
              <ThemeToggle />

              <div className="h-6 w-px bg-border/70" />

              <HeaderProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Layout body — below header */}
      <div
        className="mx-auto flex max-w-(--shell-max) pt-(--header-h)"
        style={{ paddingInline: 'var(--shell-offset-vw)' }}
      >
        <aside
          className="fixed bottom-0 hidden w-(--sidebar-width) shrink-0 overflow-y-auto py-3 lg:block scrollbar-none!"
          style={{
            top: 'var(--header-h)',
          }}
        >
          {sidebar}
        </aside>

        {/* Sidebar spacer — pushes main content right */}
        <div className="hidden w-(--sidebar-width) shrink-0 lg:block" />

        {/* Mobile Sidebar */}
        <MobileSidebar open={open} onOpenChange={setOpen}>
          {sidebar}
        </MobileSidebar>

        {/* Main */}
        <main className="min-w-0 flex-1">
          <div className="p-3 sm:p-6">
            <Suspense fallback={<PageLoader />}>
              {loading ? <PageLoader /> : <Outlet />}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
