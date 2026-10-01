import {
  Activity,
  FileText,
  Stethoscope,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import DashboardStats from "../components/dashboard/DashboardStats";
import PatientsList from "../components/dashboard/PatientsList";
import PrescriptionsList from "../components/dashboard/PrescriptionsList";
import AnimatedText from "../components/ui/AnimatedText";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin =
    user?.user_type === "admin" ||
    user?.ut_id_fk === 2 ||
    user?.user_type?.name === "admin";

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = isAdmin
        ? await dashboardAPI.getSystemStats()
        : await dashboardAPI.getClinicianDashboard();
      setStats(res.data?.data || res.data || {});
    } catch (err) {
      console.error("Dashboard load error:", err);
      toast.error("Failed to load dashboard");
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const counts = stats?.counts || {};

  // ✅ Admin ka DashboardStats format (gradient + wash)
  const statCards = [
    {
      title: "Total Patients",
      value: counts.total_patients || 0,
      icon: Users,
      gradient: "from-info to-info/70",
      wash: "from-info/10",
    },
    {
      title: "Active Patients",
      value: counts.active_patients || 0,
      icon: UserRound,
      gradient: "from-success to-success/70",
      wash: "from-success/10",
    },
    ...(isAdmin
      ? [
          {
            title: "Clinicians",
            value: counts.total_clinicians || 0,
            icon: Stethoscope,
            gradient: "from-brand-500 to-brand-700",
            wash: "from-brand-500/10",
          },
          {
            title: "Total Prescriptions",
            value: counts.total_prescriptions || 0,
            icon: FileText,
            gradient: "from-danger to-danger/70",
            wash: "from-danger/10",
          },
          {
            title: "This Month",
            value: counts.prescriptions_this_month || 0,
            icon: TrendingUp,
            gradient: "from-warning to-warning/70",
            wash: "from-warning/10",
          },
        ]
      : [
          {
            title: "My Prescriptions",
            value: counts.total_prescriptions || 0,
            icon: FileText,
            gradient: "from-brand-500 to-brand-700",
            wash: "from-brand-500/10",
          },
        ]),
  ];

  return (
    <div className="animate-fade-in">
      {/* Header — Clinician jaisa */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading font-bold tracking-tight text-fg">
            <AnimatedText speed={10}>
              {isAdmin
                ? `Welcome back, ${user?.f_name || "Admin"}`
                : `Welcome back, Dr. ${user?.f_name || "Doctor"}`}
            </AnimatedText>
          </h1>
          <p className="mt-1 text-caption text-fg-muted">
            {isAdmin
              ? "System-wide overview and management"
              : "Here's what's happening with your patients today"}
          </p>
        </div>

        <Badge variant="info" className="gap-1.5 w-fit">
          <Activity className="h-3.5 w-3.5" />
          {isAdmin ? "System Overview" : "Clinician View"}
        </Badge>
      </div>

      {/* Stat Cards — Admin ka DashboardStats (gradient + wash) */}
      <DashboardStats cards={statCards} />

      {/* Main Grid — Clinician jaisa 3-col (2 + 1) */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescriptions — bada */}
        <div className="lg:col-span-2">
          <PrescriptionsList
            prescriptions={stats?.recent_prescriptions || []}
          />
        </div>

        {/* Patients — chhota */}
        <div className="lg:col-span-1">
          <PatientsList
            patients={stats?.my_patients || stats?.recent_registrations || []}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      {/* Users by Type — Admin only */}
      {isAdmin && stats?.users_by_type && stats.users_by_type.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-subheading font-semibold text-fg mb-4">
            Users by Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.users_by_type.map((item, i) => (
              <div
                key={i}
                className="text-center p-4 bg-surface-raised rounded-card"
              >
                <p className="text-subheading font-bold text-brand-600 tabular-nums">
                  {item.count}
                </p>
                <p className="text-caption text-fg-muted capitalize mt-1">
                  {item.type?.replace("_", " ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
