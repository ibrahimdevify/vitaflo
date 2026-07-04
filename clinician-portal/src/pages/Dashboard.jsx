import { Activity, FileText, UserRound, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import MyPatients from '../components/dashboard/MyPatients';
import RecentPrescriptions from '../components/dashboard/RecentPrescriptions';
import StatCards from '../components/dashboard/StatCards';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI
      .getClinicianDashboard()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: 'Total Patients',
      value: stats?.counts?.total_patients || 0,
      icon: Users,
      tone: 'info',
    },
    {
      title: 'Active Patients',
      value: stats?.counts?.active_patients || 0,
      icon: UserRound,
      tone: 'success',
    },
    {
      title: 'Unverified',
      value: stats?.counts?.unverified_patients || 0,
      icon: Activity,
      tone: 'warning',
    },
    {
      title: 'Prescriptions',
      value: stats?.recent_prescriptions?.length || 0,
      icon: FileText,
      tone: 'brand',
    },
  ];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            Welcome back, Dr. {user?.f_name || 'Doctor'}
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            Here's what's happening with your patients today
          </p>
        </div>
        <div className="flex items-center gap-2 text-caption text-fg-muted">
          <span className="h-2 w-2 rounded-pill bg-success animate-pulse" />
          Live data
        </div>
      </div>

      {/* Stat Cards */}
      <StatCards cards={cards} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentPrescriptions prescriptions={stats?.recent_prescriptions} />
        <MyPatients patients={stats?.my_patients} />
      </div>
    </div>
  );
}
