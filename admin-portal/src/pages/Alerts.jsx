import { Bell, Plus, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AlertsFilters from "../components/alerts/AlertsFilters";
import AlertsStats from "../components/alerts/AlertsStats";
import AlertsTable from "../components/alerts/AlertsTable";
import CreateAlertForm from "../components/alerts/CreateAlertForm";
import SendNotificationForm from "../components/alerts/SendNotificationForm";
import AnimatedText from "../components/ui/AnimatedText";
import { Button } from "../components/ui/button";
import Pagination from "../components/ui/pagination";
import { alertsAPI } from "../services/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterRead, setFilterRead] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear() - 1, 0, 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
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
      if (filterRead === "read") params.is_read = true;
      else if (filterRead === "unread") params.is_read = false;
      if (dateRange.start) params.start_date = dateRange.start;
      if (dateRange.end) params.end_date = dateRange.end;
      const res = await alertsAPI.getAll(params);
      setAlerts(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      toast.error("Failed to load alerts");
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
      toast.success("Alert created!");
      setShowForm(false);
      loadAlerts();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
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
      toast.success("Notification sent!");
      setShowNotify(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const unreadCount = alerts.filter((a) => !a.is_read).length;
  const readCount = alerts.filter((a) => a.is_read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header — Clinician jaisa layout */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            <AnimatedText speed={30}>Alerts & Notifications</AnimatedText>
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            Manage system alerts and push notifications
          </p>
        </div>

        {/* Action buttons — Clinician style (right side, responsive) */}
        <div className="flex gap-2 w-fit">
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

      {/* Filters — Clinician style (direct) */}
      <AlertsFilters
        search={search}
        onSearchChange={setSearch}
        filterRead={filterRead}
        onFilterReadChange={(v) => {
          setFilterRead(v);
          setPage(1);
        }}
      />

      {/* Table — direct render */}
      <AlertsTable alerts={alerts} loading={loading} />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        label="alerts"
        loading={loading}
        onPageChange={setPage}
      />
    </div>
  );
}
