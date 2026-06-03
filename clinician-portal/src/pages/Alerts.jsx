import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Bell, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAlerts(data.data || []);
    } catch (err) { toast.error('Failed to load alerts'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Alerts</h1>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-red-500" /> All Alerts ({alerts.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div></div>
          ) : alerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead><TableHead>User</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map(alert => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${alert.is_read ? 'text-slate-300' : 'text-red-500'}`} />
                        {alert.message}
                      </div>
                    </TableCell>
                    <TableCell>{alert.user?.f_name} {alert.user?.l_name}</TableCell>
                    <TableCell><Badge className={alert.is_read ? 'bg-slate-500' : 'bg-red-500'}>{alert.is_read ? 'Read' : 'Unread'}</Badge></TableCell>
                    <TableCell className="text-sm text-slate-500">{new Date(alert.created).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-slate-500"><Bell className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p className="text-lg">No alerts found</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
