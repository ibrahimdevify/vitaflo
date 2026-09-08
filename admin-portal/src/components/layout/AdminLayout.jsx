// import {
//   Activity,
//   AlertTriangle,
//   Brain,
//   Building2,
//   LayoutDashboard,
//   Smartphone,
//   Stethoscope,
//   TrendingUp,
//   UserRound,
//   Users,
// } from "lucide-react";
// import { Suspense, useState } from "react";
// import { Outlet } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import ThemeToggle from "../ThemeToggle";
// import PageLoader from "../ui/PageLoader";
// import AdminSidebar from "./AdminSidebar";
// import MobileSidebar from "./MobileSidebar";

// const menuItems = [
//   { path: "/", icon: LayoutDashboard, label: "Dashboard" },
//   { path: "/users", icon: Users, label: "Users" },
//   { path: "/patients", icon: UserRound, label: "Patients" },
//   { path: "/clinicians", icon: Stethoscope, label: "Clinicians" },
//   { path: "/spirometry", icon: Activity, label: "Spirometry" },
//   { path: "/trends", icon: TrendingUp, label: "Trends" },
//   { path: "/alerts", icon: AlertTriangle, label: "Alerts" },
//   { path: "/predicted", icon: Brain, label: "Predicted" },
//   // { path: '/devices', icon: Smartphone, label: 'Devices' },
//   { path: "/accounts", icon: Building2, label: "Accounts" },
// ];

// export default function AdminLayout() {
//   const { loading } = useAuth();
//   const [open, setOpen] = useState(false);

//   const sidebar = (
//     <AdminSidebar items={menuItems} onItemClick={() => setOpen(false)} />
//   );

//   return (
//     <div className="flex h-screen bg-surface">
//       {/* Desktop Sidebar */}
//       <aside className="hidden lg:block w-64 shrink-0">{sidebar}</aside>

//       {/* Mobile Sidebar */}
//       <MobileSidebar open={open} onOpenChange={setOpen}>
//         {sidebar}
//       </MobileSidebar>

//       {/* Main Content */}
//       <main className="flex-1 overflow-auto">
//         {/* Header with ThemeToggle */}
//         <div className="sticky top-0 z-10 flex items-center justify-end px-6 py-2 bg-surface/80 backdrop-blur-sm">
//           <ThemeToggle />
//         </div>
//         <div className="p-6">
//           {loading ? (
//             <PageLoader />
//           ) : (
//             <Suspense fallback={<PageLoader />}>
//               <Outlet />
//             </Suspense>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }
import {
  Activity,
  AlertTriangle,
  Brain,
  Building2,
  LayoutDashboard,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GlossaryModal from "../patients/GlossaryModal";
import ThemeToggle from "../ThemeToggle";
import PageLoader from "../ui/PageLoader";
import { hasViewAccess, ROUTE_MODULES } from "../../utils/permissions";
import AdminSidebar from "./AdminSidebar";
import MobileSidebar from "./MobileSidebar";

const menuItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/users", icon: Users, label: "Users" },
  { path: "/patients", icon: UserRound, label: "Patients" },
  { path: "/clinicians", icon: Stethoscope, label: "Clinicians" },
  { path: "/spirometry", icon: Activity, label: "Spirometry" },
  { path: "/trends", icon: TrendingUp, label: "Trends" },
  { path: "/alerts", icon: AlertTriangle, label: "Alerts" },
  { path: "/predicted", icon: Brain, label: "Predicted" },
  // { path: '/devices', icon: Smartphone, label: 'Devices' },
  { path: "/roles", icon: ShieldCheck, label: "Roles" },
  { path: "/accounts", icon: Building2, label: "Accounts" },
];

export default function AdminLayout() {
  const { loading, user, modules } = useAuth();
  const [open, setOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  // Same rule as ModuleGuard in App.jsx: hide items the user can't view.
  // Paths with no ROUTE_MODULES entry (e.g. "/") aren't gated and always show.
  // While auth is still resolving, show everything rather than flashing an
  // empty/partial sidebar that then pops items in once `modules` arrives.
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
    <div className="flex h-screen bg-surface">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">{sidebar}</aside>

      {/* Mobile Sidebar */}
      <MobileSidebar open={open} onOpenChange={setOpen}>
        {sidebar}
      </MobileSidebar>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header with ThemeToggle */}
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

      <GlossaryModal open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
    </div>
  );
}