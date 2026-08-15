import {
  FileText,
  Stethoscope,
  TrendingUp,
  UserRound,
  Users,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";
import DashboardStats from "../components/dashboard/DashboardStats";
import PatientsList from "../components/dashboard/PatientsList";
import PrescriptionsList from "../components/dashboard/PrescriptionsList";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            {isAdmin ? "Admin Dashboard" : "Dashboard"}
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            {isAdmin
              ? "System-wide overview and management"
              : "Your patient overview at a glance"}
          </p>
        </div>
        <Badge variant="info" className="gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          {isAdmin ? "System Overview" : "Clinician View"}
        </Badge>
      </div>

      <DashboardStats cards={statCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-subheading font-semibold flex items-center gap-2 text-fg">
              <Users className="h-4 w-4 text-brand-500" />
              {isAdmin ? "Recent Patients" : "My Patients"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <PatientsList
              patients={stats?.my_patients || stats?.recent_registrations || []}
              isAdmin={isAdmin}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-subheading font-semibold flex items-center gap-2 text-fg">
              <FileText className="h-4 w-4 text-info" />
              Recent Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <PrescriptionsList
              prescriptions={stats?.recent_prescriptions || []}
            />
          </CardContent>
        </Card>
      </div>

      {/* Users by Type */}
      {isAdmin && stats?.users_by_type && stats.users_by_type.length > 0 && (
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-subheading font-semibold text-fg">
              Users by Type
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
