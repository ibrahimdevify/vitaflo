import { useEffect, useState } from "react";
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
  Bell,
  AlertTriangle,
  Search,
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  Mail,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const limit = 10;

  // Filters
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [filterRead, setFilterRead] = useState("all"); // all, read, unread

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
      if (filterRead === "read") params.is_read = true;
      else if (filterRead === "unread") params.is_read = false;

      const res = await api.get("/alerts", { params });
      const data = res.data.data || [];
      const pagination = res.data.pagination || {};

      setAlerts(data);
      setTotalPages(pagination.pages || 1);
      setTotalAlerts(pagination.total || data.length);
    } catch (err) {
      toast.error("Failed to load alerts");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      await api.put(`/alerts/${alertId}`, { is_read: true });
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a)),
      );
      toast.success("Alert marked as read");
    } catch (err) {
      toast.error("Failed to update alert");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/alerts/read-all");
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      toast.success("All alerts marked as read");
    } catch (err) {
      toast.error("Failed to update alerts");
    }
  };

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Alerts</h1>

      {/* Search & Filter Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search alerts by message or patient name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadAlerts(1)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => loadAlerts(1)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Loading..." : "Search"}
              </Button>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="h-4 w-4 text-slate-400" />

              {/* Date Range */}
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="w-40 h-9 text-sm"
              />
              <span className="text-slate-400 text-sm">to</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="w-40 h-9 text-sm"
              />

              {/* Read/Unread Filter */}
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm h-9"
              >
                <option value="all">All Alerts</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadAlerts(1)}
                className="text-green-600"
              >
                Apply Filters
              </Button>

              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-blue-600"
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark All Read (
                  {unreadCount})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-500">Total Alerts</p>
            <p className="text-2xl font-bold text-slate-700">{totalAlerts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-500">Unread</p>
            <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-500">Read</p>
            <p className="text-2xl font-bold text-green-600">
              {alerts.filter((a) => a.is_read).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-slate-500">Page</p>
            <p className="text-2xl font-bold text-blue-600">
              {page}/{totalPages}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-red-500" />
            Alerts{" "}
            {totalAlerts > 0 && (
              <Badge className="bg-red-100 text-red-800">{totalAlerts}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-slate-500 mt-2">Loading alerts...</p>
            </div>
          ) : alerts.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow
                        key={alert.id}
                        className={!alert.is_read ? "bg-red-50" : ""}
                      >
                        <TableCell>
                          <AlertTriangle
                            className={`h-5 w-5 ${alert.is_read ? "text-slate-300" : "text-red-500"}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <p
                              className={!alert.is_read ? "font-semibold" : ""}
                            >
                              {alert.message}
                            </p>
                            {alert.type && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {alert.type}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {alert.user ? (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-slate-400" />
                              <span>
                                {alert.user.f_name} {alert.user.l_name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
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
                        <TableCell>
                          {!alert.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(alert.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Mail className="h-4 w-4 mr-1" /> Read
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <span className="text-sm text-slate-500">
                    Page {page} of {totalPages} ({totalAlerts} alerts)
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadAlerts(page - 1)}
                      disabled={page <= 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = page <= 3 ? i + 1 : page - 2 + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => loadAlerts(pageNum)}
                          disabled={loading}
                          className={pageNum === page ? "bg-green-600" : ""}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadAlerts(page + 1)}
                      disabled={page >= totalPages || loading}
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-lg">No alerts found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
