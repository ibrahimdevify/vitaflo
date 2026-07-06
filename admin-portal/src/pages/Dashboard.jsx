import {
  FileText,
  Stethoscope,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import DashboardStats from '../components/dashboard/DashboardStats';
import PatientsList from '../components/dashboard/PatientsList';
import PrescriptionsList from '../components/dashboard/PrescriptionsList';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.user_type === 'admin' || user?.ut_id_fk === 2;

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = isAdmin
        ? await dashboardAPI.getSystemStats()
        : await dashboardAPI.getClinicianDashboard();
      setStats(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const counts = stats?.counts || {};

  const statCards = [
    {
      title: 'Total Patients',
      value: counts.total_patients || 0,
      icon: Users,
      gradient: 'from-info to-info/70',
      wash: 'from-info/10',
    },
    {
      title: 'Active',
      value: counts.active_patients || 0,
      icon: UserRound,
      gradient: 'from-success to-success/70',
      wash: 'from-success/10',
    },
    {
      title: 'Unverified',
      value: counts.unverified_patients || 0,
      icon: UserRound,
      gradient: 'from-warning to-warning/70',
      wash: 'from-warning/10',
    },
    ...(isAdmin
      ? [
          {
            title: 'Clinicians',
            value: counts.total_clinicians || 0,
            icon: Stethoscope,
            gradient: 'from-brand-500 to-brand-700',
            wash: 'from-brand-500/10',
          },
          {
            title: 'Prescriptions',
            value: counts.total_prescriptions || 0,
            icon: FileText,
            gradient: 'from-danger to-danger/70',
            wash: 'from-danger/10',
          },
          {
            title: 'This Month',
            value: counts.prescriptions_this_month || 0,
            icon: TrendingUp,
            gradient: 'from-info to-info/70',
            wash: 'from-info/10',
          },
        ]
      : [
          {
            title: 'Prescriptions',
            value: stats?.recent_prescriptions?.length || 0,
            icon: FileText,
            gradient: 'from-brand-500 to-brand-700',
            wash: 'from-brand-500/10',
          },
        ]),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-heading font-bold text-fg tracking-tight">
          {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-caption text-fg-muted mt-1">
          {isAdmin
            ? 'System-wide overview and management'
            : 'Your patient overview at a glance'}
        </p>
      </div>

      <DashboardStats cards={statCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientsList
          patients={stats?.my_patients || stats?.recent_registrations || []}
          isAdmin={isAdmin}
        />
        <PrescriptionsList prescriptions={stats?.recent_prescriptions || []} />
      </div>

      {/* Users by Type */}
      {isAdmin && stats?.users_by_type && (
        <Card>
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
