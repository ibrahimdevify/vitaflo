import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Users,
  UserRound,
  FileText,
  Activity,
  ClipboardList,
  Loader2,
  Stethoscope,
  Pill,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.user_type === "admin" || user?.ut_id_fk === 2;

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Admin sees system-wide stats, clinician sees their own
      const res = isAdmin
        ? await dashboardAPI.getSystemStats()
        : await dashboardAPI.getClinicianDashboard();
      setStats(res.data.data || res.data);
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  const counts = stats?.counts || {};

  const cards = [
    {
      title: "Total Patients",
      value: counts.total_patients || 0,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Active",
      value: counts.active_patients || 0,
      icon: UserRound,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Unverified",
      value: counts.unverified_patients || 0,
      icon: UserRound,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
    ...(isAdmin
      ? [
          {
            title: "Clinicians",
            value: counts.total_clinicians || 0,
            icon: Stethoscope,
            color: "bg-indigo-500",
            textColor: "text-indigo-600",
          },
          {
            title: "Prescriptions",
            value: counts.total_prescriptions || 0,
            icon: FileText,
            color: "bg-purple-500",
            textColor: "text-purple-600",
          },
          {
            title: "This Month",
            value: counts.prescriptions_this_month || 0,
            icon: TrendingUp,
            color: "bg-teal-500",
            textColor: "text-teal-600",
          },
        ]
      : [
          {
            title: "Prescriptions",
            value: stats?.recent_prescriptions?.length || 0,
            icon: FileText,
            color: "bg-purple-500",
            textColor: "text-purple-600",
          },
        ]),
  ];

  const getInitials = (f, l) => `${f?.[0] || ""}${l?.[0] || ""}`.toUpperCase();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {isAdmin ? "Admin Dashboard" : "Dashboard"}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-3 pt-4 pb-4">
              <div className={`p-2.5 rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{card.title}</p>
                <p className={`text-xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              {isAdmin ? "Recent Registrations" : "My Patients"}
              <Badge className="ml-2 bg-blue-100 text-blue-800">
                {
                  (stats?.my_patients || stats?.recent_registrations || [])
                    .length
                }
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(stats?.my_patients || stats?.recent_registrations || []).length >
            0 ? (
              <div className="space-y-2">
                {(stats?.my_patients || stats?.recent_registrations || []).map(
                  (p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                          {getInitials(p.f_name, p.l_name)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {p.f_name} {p.l_name}
                          </p>
                          <p className="text-xs text-slate-400">{p.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {p.patient_details ? (
                          <Badge
                            className={
                              p.patient_details?.status === "active"
                                ? "bg-green-100 text-green-700"
                                : p.patient_details?.status === "unverified"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-slate-100 text-slate-700"
                            }
                          >
                            {p.patient_details.status}
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-700">
                            {p.ut_id_fk === 3
                              ? "Clinician"
                              : p.ut_id_fk === 4
                                ? "Patient"
                                : "User"}
                          </Badge>
                        )}
                        {p.reg_date && (
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(p.reg_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No patients yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-purple-500" />
              Recent Prescriptions
              <Badge className="ml-2 bg-purple-100 text-purple-800">
                {stats?.recent_prescriptions?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recent_prescriptions?.length > 0 ? (
              <div className="space-y-2">
                {stats.recent_prescriptions.map((p, i) => (
                  <div
                    key={i}
                    className="p-3 hover:bg-slate-50 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">
                        {p.patient?.f_name} {p.patient?.l_name}
                      </p>
                      <span className="text-xs text-slate-400">
                        {new Date(p.pr_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{p.diagnosis}</p>
                    {p.medicines?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.medicines.slice(0, 3).map((m, j) => (
                          <Badge
                            key={j}
                            className="bg-green-50 text-green-700 text-xs"
                          >
                            <Pill className="h-3 w-3 mr-1" />
                            {m.drug}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No prescriptions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin: Users by Type Chart */}
      {isAdmin && stats?.users_by_type && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-500" />
              Users by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.users_by_type.map((item, i) => (
                <div key={i} className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {item.count}
                  </p>
                  <p className="text-sm text-slate-500 capitalize">
                    {item.type}
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
