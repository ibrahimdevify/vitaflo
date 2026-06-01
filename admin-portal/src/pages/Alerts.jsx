import { useEffect, useState, useCallback, useRef } from 'react';
import { alertsAPI, usersAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Plus, Search, AlertTriangle, Bell, Mail, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { toast } from 'sonner';

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [form, setForm] = useState({ user_id: '', message: '' });
  const [notifyForm, setNotifyForm] = useState({ user_id: '', title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(search); setPage(1); }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await alertsAPI.getAll({ page, limit, search: search || undefined });
      setAlerts(res.data.data || []);
      setTotal(res.data.pagination?.total || res.data.data?.length || 0);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) { toast.error('Failed to load alerts'); }
    finally { setLoading(false); }
  }, [page, limit, search]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await alertsAPI.create({ user_id: parseInt(form.user_id), message: form.message });
      toast.success('Alert created!');
      setShowForm(false);
      setForm({ user_id: '', message: '' });
      loadAlerts();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await alertsAPI.notify(parseInt(notifyForm.user_id), { title: notifyForm.title, body: notifyForm.body });
      toast.success('Notification sent!');
      setShowNotify(false);
      setNotifyForm({ user_id: '', title: '', body: '' });
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const getPageNumbers = () => {
    const pages = []; const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Alerts & Notifications</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNotify(true)}>
            <Send className="h-4 w-4 mr-2" /> Send Notification
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Alert
          </Button>
        </div>
      </div>

      {/* Create Alert Form */}
      {showForm && (
        <div className="mb-6">
          <form onSubmit={handleCreateAlert} className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-red-500" /> Create Alert</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">User ID *</label>
                <Input type="number" value={form.user_id} onChange={e => setForm({...form, user_id: e.target.value})} required placeholder="1" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Message *</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="FEV1 below threshold..." />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Alert'}</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Send Notification Form */}
      {showNotify && (
        <div className="mb-6">
          <form onSubmit={handleSendNotification} className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Bell className="h-5 w-5 text-blue-500" /> Send Push Notification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">User ID *</label>
                <Input type="number" value={notifyForm.user_id} onChange={e => setNotifyForm({...notifyForm, user_id: e.target.value})} required placeholder="1" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Title *</label>
                <Input value={notifyForm.title} onChange={e => setNotifyForm({...notifyForm, title: e.target.value})} required placeholder="Health Alert" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Body *</label>
                <textarea value={notifyForm.body} onChange={e => setNotifyForm({...notifyForm, body: e.target.value})} required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Your FEV1 dropped below 80%..." />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Send Notification'}</Button>
              <Button type="button" variant="outline" onClick={() => setShowNotify(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>All Alerts</CardTitle>
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Search alerts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div><p className="mt-2 text-slate-500">Loading...</p></div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Message</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map(alert => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-4 w-4 ${alert.is_read ? 'text-slate-300' : 'text-red-500'}`} />
                          <span>{alert.message}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {alert.user?.f_name} {alert.user?.l_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={alert.is_read ? 'bg-slate-500' : 'bg-red-500'}>
                          {alert.is_read ? 'Read' : 'Unread'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">{new Date(alert.created).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {alerts.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-12 text-slate-500"><Bell className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p className="text-lg">No alerts found</p></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Showing {alerts.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total}</span>
                    <select value={limit} onChange={e => { setLimit(parseInt(e.target.value)); setPage(1); }} className="w-20 rounded-md border border-input bg-background px-2 py-1 text-xs h-8">
                      {LIMIT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <span>per page</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                    {getPageNumbers().map(p => (<Button key={p} variant={p === page ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(p)}>{p}</Button>))}
                    <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
