import { Bell, Plus, Send } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import AlertsFilters from '../components/alerts/AlertsFilters';
import AlertsStats from '../components/alerts/AlertsStats';
import AlertsTable from '../components/alerts/AlertsTable';
import CreateAlertForm from '../components/alerts/CreateAlertForm';
import SendNotificationForm from '../components/alerts/SendNotificationForm';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import Pagination from '../components/ui/pagination';
import { alertsAPI } from '../services/api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterRead, setFilterRead] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear() - 1, 0, 1)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterRead === 'read') params.is_read = true;
      else if (filterRead === 'unread') params.is_read = false;
      if (dateRange.start) params.start_date = dateRange.start;
      if (dateRange.end) params.end_date = dateRange.end;
      const res = await alertsAPI.getAll(params);
      setAlerts(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterRead, dateRange]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleCreateAlert = async (data) => {
    try {
      setSubmitting(true);
      await alertsAPI.create({
        user_id: parseInt(data.user_id),
        message: data.message.trim(),
      });
      toast.success('Alert created!');
      setShowForm(false);
      loadAlerts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendNotification = async (data) => {
    try {
      setSubmitting(true);
      await alertsAPI.notify(parseInt(data.user_id), {
        title: data.title.trim(),
        body: data.body.trim(),
      });
      toast.success('Notification sent!');
      setShowNotify(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const unreadCount = alerts.filter((a) => !a.is_read).length;
  const readCount = alerts.filter((a) => a.is_read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            Alerts & Notifications
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            Manage system alerts and push notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowNotify(true);
              setShowForm(false);
            }}
            className="border-border gap-2"
          >
            <Send className="h-4 w-4" /> Send Notification
          </Button>
          <Button
            onClick={() => {
              setShowForm(true);
              setShowNotify(false);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Create Alert
          </Button>
        </div>
      </div>

      <AlertsStats
        total={total}
        unreadCount={unreadCount}
        readCount={readCount}
        pageCount={alerts.length}
      />

      {showForm && (
        <CreateAlertForm
          submitting={submitting}
          onSubmit={handleCreateAlert}
          onCancel={() => setShowForm(false)}
        />
      )}
      {showNotify && (
        <SendNotificationForm
          submitting={submitting}
          onSubmit={handleSendNotification}
          onCancel={() => setShowNotify(false)}
        />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-danger to-danger/70">
              <Bell className="h-3.5 w-3.5 text-white" />
            </div>
            All Alerts
            {total > 0 && <Badge variant="danger">{total}</Badge>}
          </CardTitle>
          <AlertsFilters
            search={search}
            onSearchChange={setSearch}
            filterRead={filterRead}
            onFilterReadChange={(v) => {
              setFilterRead(v);
              setPage(1);
            }}
          />
        </CardHeader>
        <CardContent className="pt-4">
          <AlertsTable alerts={alerts} loading={loading} />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            label="alerts"
            loading={loading}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
