import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AlertsFilterBar from '../components/alerts/AlertsFilterBar';
import AlertsStats from '../components/alerts/AlertsStats';
import AlertsTable from '../components/alerts/AlertsTable';
import Pagination from '../components/ui/pagination';
import api from '../services/api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const limit = 10;

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [filterRead, setFilterRead] = useState('all');

  useEffect(() => {
    loadAlerts(1);
  }, []);

  const loadAlerts = async (pageNum = 1) => {
    try {
      setLoading(true);
      setPage(pageNum);

      const params = {
        page: pageNum,
        limit,
        start_date: dateRange.start,
        end_date: dateRange.end,
      };

      if (search.trim()) params.search = search.trim();
      if (filterRead === 'read') params.is_read = true;
      else if (filterRead === 'unread') params.is_read = false;

      const res = await api.get('/alerts', { params });
      const data = res.data.data || [];
      const pagination = res.data.pagination || {};

      setAlerts(data);
      setTotalPages(pagination.pages || 1);
      setTotalAlerts(pagination.total || data.length);
    } catch (err) {
      toast.error('Failed to load alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      await api.put(`/alerts/${alertId}`, { is_read: true });
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a))
      );
      toast.success('Alert marked as read');
    } catch (err) {
      toast.error('Failed to update alert');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/alerts/read-all');
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      toast.success('All alerts marked as read');
    } catch (err) {
      toast.error('Failed to update alerts');
    }
  };

  const unreadCount = alerts.filter((a) => !a.is_read).length;
  const readCount = alerts.filter((a) => a.is_read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-heading font-bold text-fg tracking-tight">
          Alerts
        </h1>
        <p className="text-caption text-fg-muted mt-1">
          Stay on top of patient activity that needs your attention
        </p>
      </div>

      <AlertsStats
        totalAlerts={totalAlerts}
        unreadCount={unreadCount}
        readCount={readCount}
        page={page}
        totalPages={totalPages}
      />

      <AlertsFilterBar
        search={search}
        onSearchChange={setSearch}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        filterRead={filterRead}
        onFilterReadChange={setFilterRead}
        loading={loading}
        unreadCount={unreadCount}
        onSearch={loadAlerts}
        onMarkAllAsRead={markAllAsRead}
      />

      <AlertsTable
        alerts={alerts}
        loading={loading}
        onMarkAsRead={markAsRead}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={totalAlerts}
        label="alerts"
        loading={loading}
        onPageChange={loadAlerts}
      />
    </div>
  );
}
