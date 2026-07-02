import { useEffect, useState, useCallback, useRef } from "react";
import { alertsAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Plus,
  Search,
  AlertTriangle,
  Bell,
  Mail,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  Loader2,
  Filter,
  CheckCircle,
  Clock,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [form, setForm] = useState({ user_id: "", message: "" });
  const [notifyForm, setNotifyForm] = useState({
    user_id: "",
    title: "",
    body: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterRead, setFilterRead] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear() - 1, 0, 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const debounceRef = useRef(null);

  // Debounced search
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

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!form.user_id || !form.message.trim()) {
      toast.error("All fields are required");
      return;
    }
    try {
      setSubmitting(true);
      await alertsAPI.create({
        user_id: parseInt(form.user_id),
        message: form.message.trim(),
      });
      toast.success("Alert created successfully!");
      setShowForm(false);
      setForm({ user_id: "", message: "" });
      loadAlerts();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create alert");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (
      !notifyForm.user_id ||
      !notifyForm.title.trim() ||
      !notifyForm.body.trim()
    ) {
      toast.error("All fields are required");
      return;
    }
    try {
      setSubmitting(true);
      await alertsAPI.notify(parseInt(notifyForm.user_id), {
        title: notifyForm.title.trim(),
        body: notifyForm.body.trim(),
      });
      toast.success("Notification sent successfully!");
      setShowNotify(false);
      setNotifyForm({ user_id: "", title: "", body: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send notification");
    } finally {
      setSubmitting(false);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alerts & Notifications</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowNotify(true);
              setShowForm(false);
            }}
          >
            <Send className="h-4 w-4 mr-2" /> Send Notification
          </Button>
          <Button
            onClick={() => {
              setShowForm(true);
              setShowNotify(false);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Alert
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Alerts",
            value: total,
            icon: Bell,
            color: "bg-blue-500",
            textColor: "text-blue-600",
          },
          {
            label: "Unread",
            value: unreadCount,
            icon: AlertTriangle,
            color: "bg-red-500",
            textColor: "text-red-600",
          },
          {
            label: "Read",
            value: alerts.filter((a) => a.is_read).length,
            icon: CheckCircle,
            color: "bg-green-500",
            textColor: "text-green-600",
          },
          {
            label: "This Page",
            value: alerts.length,
            icon: Clock,
            color: "bg-purple-500",
            textColor: "text-purple-600",
          },
        ].map((card, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-3 pt-4 pb-4">
              <div className={`p-2.5 rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className={`text-xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Alert Form */}
      {showForm && (
        <Card className="border-green-200 border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                Create Alert
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Patient ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={form.user_id}
                    onChange={(e) =>
                      setForm({ ...form, user_id: e.target.value })
                    }
                    required
                    placeholder="Enter patient ID"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    required
                    placeholder="e.g., FEV1 below 80% threshold"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-1" />
                  )}
                  {submitting ? "Creating..." : "Create Alert"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Send Notification Form */}
      {showNotify && (
        <Card className="border-blue-200 border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100">
                  <Bell className="h-5 w-5 text-blue-500" />
                </div>
                Send Push Notification
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotify(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Patient ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={notifyForm.user_id}
                    onChange={(e) =>
                      setNotifyForm({ ...notifyForm, user_id: e.target.value })
                    }
                    required
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={notifyForm.title}
                    onChange={(e) =>
                      setNotifyForm({ ...notifyForm, title: e.target.value })
                    }
                    required
                    placeholder="e.g., Health Alert"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">
                    Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={notifyForm.body}
                    onChange={(e) =>
                      setNotifyForm({ ...notifyForm, body: e.target.value })
                    }
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] resize-y"
                    placeholder="e.g., Your FEV1 has dropped below 80%. Please contact your doctor."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Send className="h-4 w-4 mr-1" />
                  )}
                  {submitting ? "Sending..." : "Send Notification"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNotify(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500" />
              All Alerts
              {total > 0 && (
                <Badge className="bg-red-100 text-red-800 ml-2">{total}</Badge>
              )}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search alerts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterRead}
                onChange={(e) => {
                  setFilterRead(e.target.value);
                  setPage(1);
                }}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto" />
              <p className="mt-2 text-slate-500">Loading alerts...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Status</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow
                        key={alert.id}
                        className={
                          !alert.is_read ? "bg-red-50 hover:bg-red-100" : ""
                        }
                      >
                        <TableCell>
                          <AlertTriangle
                            className={`h-5 w-5 ${alert.is_read ? "text-slate-300" : "text-red-500"}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <p className={!alert.is_read ? "font-semibold" : ""}>
                            {alert.message}
                          </p>
                        </TableCell>
                        <TableCell>
                          {alert.user ? (
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                                {alert.user.f_name?.[0]}
                                {alert.user.l_name?.[0]}
                              </div>
                              <span className="text-sm">
                                {alert.user.f_name} {alert.user.l_name}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-400">
                                User #{alert.user_id}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                          {new Date(alert.created).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {alerts.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-16 text-slate-500"
                        >
                          <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                          <p className="text-lg">No alerts found</p>
                          <p className="text-sm">
                            Try adjusting your search or filters
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>
                      Showing {alerts.length > 0 ? (page - 1) * limit + 1 : 0}-
                      {Math.min(page * limit, total)} of {total}
                    </span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(parseInt(e.target.value));
                        setPage(1);
                      }}
                      className="w-20 rounded-md border border-input bg-background px-2 py-1 text-xs h-8"
                    >
                      {LIMIT_OPTIONS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <span>per page</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {getPageNumbers().map((p) => (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="icon"
                        className={`h-8 w-8 ${p === page ? "bg-green-600" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
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
