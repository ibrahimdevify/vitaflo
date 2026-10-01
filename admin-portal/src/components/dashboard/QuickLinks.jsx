import {
  ArrowUpRight,
  Bell,
  FileText,
  StickyNote,
  UserPlus,
  Users,
  Wind,
} from "lucide-react";
import { Link } from "react-router-dom";

// Matches the routes defined in App.jsx exactly.
const QUICK_LINKS = [
  {
    label: "Patients",
    icon: Users,
    to: "/patients",
  },
  {
    label: "Add Patient",
    icon: UserPlus,
    to: "/patients/add",
  },
  {
    label: "Spirometry",
    icon: Wind,
    to: "/spirometry",
  },
  {
    label: "Prescriptions",
    icon: FileText,
    to: "/prescriptions",
  },
  {
    label: "Notes",
    icon: StickyNote,
    to: "/notes",
  },
  {
    label: "Alerts",
    icon: Bell,
    to: "/alerts",
  },
];

const ICON_STYLES = [
  "text-blue-600 bg-blue-500/10",
  "text-emerald-600 bg-emerald-500/10",
  "text-cyan-600 bg-cyan-500/10",
  "text-violet-600 bg-violet-500/10",
  "text-amber-600 bg-amber-500/10",
  "text-rose-600 bg-rose-500/10",
];

export default function QuickLinks() {
  return (
    <div className="mb-8">
      <div className="mb-3">
        <h2 className="text-body font-semibold text-fg">Quick Links</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_LINKS.map(({ label, icon: Icon, to }, index) => (
            <Link
              key={to}
              to={to}
              className={`group relative flex min-h-[88px] items-center gap-3 px-4 py-4 transition-colors duration-200 hover:bg-surface-raised ${
                index > 0
                  ? "border-t border-border sm:border-l sm:border-t-0"
                  : ""
              } ${index === 3 ? "lg:border-l" : ""}`}
              title={label}
            >
              {/* subtle active glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(180px 90px at 0% 50%, rgba(99,102,241,0.06), transparent 70%)",
                }}
              />

              <span
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ICON_STYLES[index]}`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.9} />
              </span>

              <span className="relative z-10 min-w-0 flex-1">
                <span className="block truncate text-caption font-semibold text-fg">
                  {label}
                </span>
              </span>

              <ArrowUpRight
                className="relative z-10 h-3.5 w-3.5 shrink-0 text-fg-muted opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                strokeWidth={1.8}
              />

              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 left-4 right-4 h-px scale-x-0 bg-brand-500/40 transition-transform duration-200 group-hover:scale-x-100"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
