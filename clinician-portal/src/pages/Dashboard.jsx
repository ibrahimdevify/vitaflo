import { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Users, UserRound, Activity, FileText, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getClinicianDashboard()
      .then(res => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div></div>;

  const cards = [
    { title: 'My Patients', value: stats?.counts?.total_patients || 0, icon: Users, color: 'bg-green-500' },
    { title: 'Active', value: stats?.counts?.active_patients || 0, icon: UserRound, color: 'bg-blue-500' },
    { title: 'Unverified', value: stats?.counts?.unverified_patients || 0, icon: UserRound, color: 'bg-yellow-500' },
    { title: 'Prescriptions', value: stats?.recent_prescriptions?.length || 0, icon: FileText, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`p-3 rounded-lg ${card.color}`}><card.icon className="h-6 w-6 text-white" /></div>
              <div><p className="text-sm text-slate-500">{card.title}</p><p className="text-2xl font-bold">{card.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Prescriptions</CardTitle></CardHeader>
        <CardContent>
          {stats?.recent_prescriptions?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_prescriptions.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div><p className="font-medium">{p.patient?.f_name} {p.patient?.l_name}</p><p className="text-sm text-slate-500">{p.diagnosis}</p></div>
                  <div className="flex gap-1">{p.medicines?.map((m, j) => <Badge key={j} variant="outline" className="text-xs">{m.drug}</Badge>)}</div>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-500">No recent prescriptions</p>}
        </CardContent>
      </Card>
    </div>
  );
}
