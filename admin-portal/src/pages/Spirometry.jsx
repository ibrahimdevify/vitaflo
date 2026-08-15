import {
  Activity,
  Calendar,
  Search,
  TrendingUp,
  UserRound,
  Wind,
  Gauge,
  Timer,
  X, // ✅ Changed from Clear to X
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import Pagination from "../components/ui/pagination";
import EmptyState from "../components/shared/EmptyState";
import SpirometryTableSkeleton from "../components/spirometry/SpirometryTableSkeleton";
import { spirometryAPI } from "../services/api";

export default function Spirometry() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const [spirometryData, setSpirometryData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState({
    start: "2020-01-01",
    end: "2030-12-31",
  });

  const searchPatient = async (pageNum = 1) => {
    const query = search.trim();
    if (!query) {
      toast.error("Please enter a Patient Username");
      return;
    }
    try {
      setLoading(true);
      setPage(pageNum);

      const res = await spirometryAPI.getByUser(query, {
        start: dateRange.start,
        end: dateRange.end,
        page: pageNum,
        limit,
      });

      const data = res.data.data || [];
      setSpirometryData(data);
      setPatientInfo(res.data.patient || null);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);

      const chart = data
        .filter((d) => d.fev1 || d.fvc)
        .map((d) => ({
          date: new Date(d.dbdate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "2-digit",
          }),
          fev1: d.fev1 ? parseFloat(d.fev1.toFixed(2)) : null,
          fvc: d.fvc ? parseFloat(d.fvc.toFixed(2)) : null,
          pefr: d.pefr ? parseFloat(d.pefr.toFixed(0)) : null,
          fef2575: d.fef2575 ? parseFloat(d.fef2575.toFixed(2)) : null,
          fullDate: new Date(d.dbdate),
        }))
        .sort((a, b) => a.fullDate - b.fullDate);

      setChartData(chart);

      if (data.length === 0) {
        toast.info("No spirometry data found for this patient");
      }
    } catch (err) {
      toast.error("Failed to load spirometry data");
      setSpirometryData([]);
      setChartData([]);
      setPatientInfo(null);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearch("");
    setPatientInfo(null);
    setSpirometryData([]);
    setChartData([]);
    setTotal(0);
    setTotalPages(1);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchPatient(1);
  };

  const handlePageChange = (newPage) => {
    if (patientInfo) {
      searchPatient(newPage);
    }
  };

  // KPI calculations
  const bestFEV1 = spirometryData.reduce(
    (max, s) => (s.fev1 > max ? s.fev1 : max),
    0,
  );
  const bestFVC = spirometryData.reduce(
    (max, s) => (s.fvc > max ? s.fvc : max),
    0,
  );
  const bestPEFR = spirometryData.reduce(
    (max, s) => (s.pefr > max ? s.pefr : max),
    0,
  );
  const avgFEV1 =
    spirometryData.length > 0
      ? spirometryData.reduce((sum, s) => sum + (s.fev1 || 0), 0) /
        spirometryData.length
      : 0;
  const lastRecord = spirometryData.length > 0 ? spirometryData[0] : null;
  const postBDCount = spirometryData.filter(
    (s) => s.is_post_bronchodilator,
  ).length;

  const kpis = [
    {
      title: "Total Tests",
      value: total,
      icon: Activity,
      gradient: "from-brand-500 to-brand-700",
      wash: "from-brand-500/10",
      suffix: "",
    },
    {
      title: "Best FEV1",
      value: bestFEV1 ? bestFEV1.toFixed(2) : "—",
      icon: Wind,
      gradient: "from-info to-info/70",
      wash: "from-info/10",
      suffix: "L",
    },
    {
      title: "Best FVC",
      value: bestFVC ? bestFVC.toFixed(2) : "—",
      icon: Gauge,
      gradient: "from-success to-success/70",
      wash: "from-success/10",
      suffix: "L",
    },
    {
      title: "Best PEFR",
      value: bestPEFR ? bestPEFR.toFixed(0) : "—",
      icon: Timer,
      gradient: "from-warning to-warning/70",
      wash: "from-warning/10",
      suffix: "L/s",
    },
    {
      title: "Avg FEV1",
      value: avgFEV1 ? avgFEV1.toFixed(2) : "—",
      icon: TrendingUp,
      gradient: "from-danger to-danger/70",
      wash: "from-danger/10",
      suffix: "L",
    },
    {
      title: "Post-BD Tests",
      value: postBDCount,
      icon: Activity,
      gradient: "from-purple-500 to-purple-700",
      wash: "from-purple-500/10",
      suffix: "",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-heading font-bold text-fg tracking-tight">
          Spirometry
        </h1>
        <p className="text-caption text-fg-muted mt-1">
          Search patient by username to view their lung function data and trends
        </p>
      </div>

      {/* Search Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
              <Input
                placeholder="Search by Patient Username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="w-36 h-9 text-caption"
              />
              <span className="text-caption text-fg-muted">to</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="w-36 h-9 text-caption"
              />
            </div>
            <Button onClick={() => searchPatient(1)} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Loading..." : "Search"}
            </Button>
            {patientInfo && (
              <Button
                variant="outline"
                onClick={clearSearch}
                className="border-border gap-2"
              >
                <X className="h-4 w-4" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Empty state when no patient selected */}
      {!patientInfo && !loading && (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Activity}
              title="Search for a Patient"
              description="Enter a Patient Username above to view their spirometry data, KPIs, and trends"
            />
          </CardContent>
        </Card>
      )}

      {/* Patient Info + KPIs + Chart + Table */}
      {patientInfo && (
        <>
          {/* Patient Info Card */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4 flex-wrap">
              <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-linear-to-br from-brand-500 to-brand-700 text-white font-semibold text-lg">
                {patientInfo.name?.[0] || "P"}
              </div>
              <div>
                <p className="font-semibold text-fg text-lg">
                  {patientInfo.name}
                </p>
                <p className="text-caption text-fg-muted flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" />
                  Username: {patientInfo.userName || "N/A"}
                </p>
              </div>
              {patientInfo.email && (
                <Badge variant="outline">{patientInfo.email}</Badge>
              )}
              {patientInfo.dob && (
                <Badge variant="secondary">
                  <Calendar className="h-3 w-3 mr-1" />
                  DOB: {patientInfo.dob}
                </Badge>
              )}
              {patientInfo.gender && (
                <Badge variant="secondary">
                  Gender: {patientInfo.gender === "M" ? "Male" : "Female"}
                </Badge>
              )}
              {lastRecord && (
                <Badge variant="info" className="ml-auto">
                  Last Test: {new Date(lastRecord.dbdate).toLocaleDateString()}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map((kpi, i) => (
              <Card key={i} className="relative overflow-hidden">
                <div
                  className={`absolute inset-x-0 top-0 h-16 bg-linear-to-b ${kpi.wash} to-transparent pointer-events-none`}
                />
                <CardContent className="relative p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-(--radius-control) bg-linear-to-br ${kpi.gradient}`}
                    >
                      <kpi.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-caption text-fg-muted">{kpi.title}</p>
                  <p className="text-subheading font-bold text-fg tabular-nums mt-0.5">
                    {kpi.value}
                    {kpi.suffix && kpi.value !== "—" && (
                      <span className="text-caption text-fg-muted ml-1">
                        {kpi.suffix}
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
                  <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
                    <TrendingUp className="h-3.5 w-3.5 text-white" />
                  </div>
                  Lung Function Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div
                  className="bg-surface-raised rounded-card p-4"
                  style={{ height: 300 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "var(--color-fg-muted)" }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "var(--color-fg-muted)" }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-card)",
                          fontSize: "12px",
                          color: "var(--color-fg)",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="fev1"
                        stroke="var(--color-info)"
                        name="FEV1 (L)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="fvc"
                        stroke="var(--color-success)"
                        name="FVC (L)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="pefr"
                        stroke="var(--color-warning)"
                        name="PEFR (L/s)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Records Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-subheading font-semibold text-fg">
                Spirometry Records ({total})
              </CardTitle>
              <span className="text-caption text-fg-muted">
                {dateRange.start} → {dateRange.end}
              </span>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? (
                <SpirometryTableSkeleton />
              ) : spirometryData.length > 0 ? (
                <>
                  <div className="table-container">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>FEV1 (L)</TableHead>
                          <TableHead>FVC (L)</TableHead>
                          <TableHead>PEFR</TableHead>
                          <TableHead>FEF25-75</TableHead>
                          <TableHead>FEV6</TableHead>
                          <TableHead>FEV1%</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Quality</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {spirometryData.map((s, i) => (
                          <TableRow key={s.id || i}>
                            <TableCell className="text-caption text-fg-muted whitespace-nowrap">
                              {new Date(s.dbdate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="font-medium text-fg tabular-nums">
                              {s.fev1?.toFixed(2) || "—"}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {s.fvc?.toFixed(2) || "—"}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {s.pefr?.toFixed(0) || "—"}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {s.fef2575?.toFixed(2) || "—"}
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {s.fev6?.toFixed(2) || "—"}
                            </TableCell>
                            <TableCell>
                              {s.fev1_perc ? (
                                <Badge
                                  variant={
                                    s.fev1_perc >= 80
                                      ? "success"
                                      : s.fev1_perc >= 60
                                        ? "warning"
                                        : "danger"
                                  }
                                >
                                  {s.fev1_perc.toFixed(0)}%
                                </Badge>
                              ) : (
                                <span className="text-fg-muted">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {s.is_post_bronchodilator ? (
                                <Badge variant="info">Post-BD</Badge>
                              ) : (
                                <Badge variant="secondary">Pre-BD</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-caption text-fg-muted">
                              {s.quality_message === 1
                                ? "Good"
                                : s.quality_message === 2
                                  ? "Acceptable"
                                  : s.quality_message === 3
                                    ? "Poor"
                                    : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    label="records"
                    loading={loading}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                <EmptyState
                  icon={Activity}
                  title="No spirometry data found"
                  description="Try a different date range or patient username"
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
