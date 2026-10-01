import {
  Activity,
  AlertTriangle,
  Brain,
  Building2,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { Suspense, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import desktopLogo from "../../assets/vitalflo-text-logo.png";
import { useAuth } from "../../context/AuthContext";
import GlossaryModal from "../patients/GlossaryModal";
import ThemeToggle from "../ThemeToggle";
import PageLoader from "../ui/PageLoader";
import { Sheet, SheetTrigger } from "../ui/sheet";
import { hasViewAccess, ROUTE_MODULES } from "../../utils/permissions";
import AdminSidebar from "./AdminSidebar";
import HeaderProfile from "./HeaderProfile";
import MobileSidebar from "./MobileSidebar";

// ✅ FLAT menuItems — dropdown hata diya
const menuItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/users", icon: Users, label: "Users" },
  { path: "/patients", icon: UserRound, label: "Patients" },
  { path: "/clinicians", icon: Stethoscope, label: "Clinicians" },
  { path: "/spirometry", icon: Activity, label: "Spirometry" },
  { path: "/trends", icon: TrendingUp, label: "Trends" },
  { path: "/alerts", icon: AlertTriangle, label: "Alerts" },
  { path: "/predicted", icon: Brain, label: "Predicted" },
  { path: "/roles", icon: ShieldCheck, label: "Roles" },
  { path: "/accounts", icon: Building2, label: "Accounts" },
];

export default function AdminLayout() {
  const { loading, user, modules } = useAuth();
  const [open, setOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  // ✅ Simple filter (children nahi hain ab)
  const visibleMenuItems = loading
    ? menuItems
    : menuItems.filter((item) => {
        const moduleName = ROUTE_MODULES[item.path];
        return !moduleName || hasViewAccess(user, modules, moduleName);
      });

  const sidebar = (
    <AdminSidebar
      items={visibleMenuItems}
      onItemClick={() => setOpen(false)}
      onGlossaryClick={() => setGlossaryOpen(true)}
    />
  );

  return (
    <div
      className="bg-surface"
      style={{
        backgroundImage: "var(--glow)",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <header
        className="fixed top-0 z-30 w-full max-w-(--shell-max) h-(--header-h)"
        style={{
          paddingTop: "12px",
          paddingInline: "var(--shell-offset-vw)",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div
          className="rounded-2xl border border-border h-full backdrop-blur-[14px] backdrop-saturate-160"
          style={{
            backgroundImage: "var(--header-glow)",
            background: "var(--header-glow), var(--header-background)",
          }}
        >
          <div className="flex h-full items-center justify-between px-6">
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

            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <div className="h-6 w-px bg-border/70" />
              <HeaderProfile />
            </div>
          </div>
        </div>
      </header>

      <div
        className="mx-auto flex max-w-(--shell-max) pt-(--header-h)"
        style={{ paddingInline: "var(--shell-offset-vw)" }}
      >
        <aside
          className="fixed bottom-0 hidden w-(--sidebar-width) shrink-0 overflow-y-auto py-3 lg:block scrollbar-none!"
          style={{ top: "var(--header-h)" }}
        >
          {sidebar}
        </aside>

        <div className="hidden w-(--sidebar-width) shrink-0 lg:block" />

        <MobileSidebar open={open} onOpenChange={setOpen}>
          {sidebar}
        </MobileSidebar>

        <main className="min-w-0 flex-1">
          <div className="p-3 sm:p-6">
            <Suspense fallback={<PageLoader />}>
              {loading ? <PageLoader /> : <Outlet />}
            </Suspense>
          </div>
        </main>
      </div>

      <GlossaryModal
        open={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
      />
    </div>
  );
}
