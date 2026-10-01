import {
  Activity,
  Calendar,
  Search,
  SlidersHorizontal,
  TrendingUp,
  UserRound,
  Wind,
  Gauge,
  Timer,
  X,
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EmptyState from "../components/shared/EmptyState";
import SpirometryTable from "../components/spirometry/SpirometryTable";
import AnimatedText from "../components/ui/AnimatedText";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import Pagination from "../components/ui/pagination";
import { spirometryAPI } from "../services/api";
import { useSearchParams } from "react-router-dom";

export default function Spirometry() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reportLoadingId, setReportLoadingId] = useState(null);
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

  const searchPatient = async (pageNum = 1, overrideQuery) => {
    const query = (overrideQuery ?? search).trim();
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

  const handleViewReport = async (observationId) => {
    if (!observationId) {
      toast.error("This record has no observation to report on");
      return;
    }
    try {
      setReportLoadingId(observationId);
      const res = await spirometryAPI.getReportPDF(observationId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      toast.error("Failed to generate report");
    } finally {
      setReportLoadingId(null);
    }
  };

  useEffect(() => {
    const usernameFromUrl = searchParams.get("username");
    if (usernameFromUrl) {
      setSearch(usernameFromUrl);
      searchPatient(1, usernameFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearSearch = () => {
    setSearch("");
    setPatientInfo(null);
    setSpirometryData([]);
    setChartData([]);
    setTotal(0);
    setTotalPages(1);
    setPage(1);
    setSearchParams({});
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchPatient(1);
  };

  const handleSearchClick = () => {
    if (search.trim()) {
      setSearchParams({ username: search.trim() });
    }
    searchPatient(1);
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

  // ✅ KPI cards — 4 cards, no icons (Clinician jaisa)
  const avgFEV1 =
    spirometryData.length > 0
      ? spirometryData.reduce((sum, s) => sum + (s.fev1 || 0), 0) /
        spirometryData.length
      : 0;
  const postBDCount = spirometryData.filter(
    (s) => s.is_post_bronchodilator,
  ).length;

  const kpis = [
    {
      title: "Total Tests",
      value: total,
      wash: "from-brand-500/10",
      suffix: "",
    },
    {
      title: "Best FEV1",
      value: bestFEV1 ? bestFEV1.toFixed(2) : "—",
      wash: "from-info/10",
      suffix: "L",
    },
    {
      title: "Best FVC",
      value: bestFVC ? bestFVC.toFixed(2) : "—",
      wash: "from-success/10",
      suffix: "L",
    },
    {
      title: "Best PEFR",
      value: bestPEFR ? bestPEFR.toFixed(0) : "—",
      wash: "from-warning/10",
      suffix: "L/s",
    },
    {
      title: "Avg FEV1",
      value: avgFEV1 ? avgFEV1.toFixed(2) : "—",
      wash: "from-danger/10",
      suffix: "L",
    },
    {
      title: "Post-BD Tests",
      value: postBDCount,
      wash: "from-purple-500/10",
      suffix: "",
    },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header — Clinician jaisa */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            <AnimatedText speed={30}>Spirometry</AnimatedText>
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            Search patient by username to view their lung function data and
            trends
          </p>
        </div>
      </div>

      {/* Search Card — Clinician jaisa design */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
              <Input
                placeholder="Search by Patient Username, email, or phone..."
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
                  setDateRange((prev) => ({
                    ...prev,
                    start: e.target.value,
                  }))
                }
                className="w-36 h-9 text-caption"
              />
              <span className="text-caption text-fg-muted">to</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    end: e.target.value,
                  }))
                }
                className="w-36 h-9 text-caption"
              />
            </div>
            <Button onClick={handleSearchClick} disabled={loading}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {loading ? "Loading..." : "Filter"}
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
        <Card className="flex-1 flex flex-col min-h-[400px]">
          <CardContent className="flex-1 flex items-center justify-center py-12">
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
          {/* Patient Info Card — Clinician jaisa simple */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4 flex-wrap">
              <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-linear-to-br from-brand-500 to-brand-700 text-white font-semibold">
                {patientInfo.name?.[0] || "P"}
              </div>
              <div>
                <p className="font-semibold text-fg">{patientInfo.name}</p>
                <p className="text-caption text-fg-muted">
                  Username: {patientInfo.userName || "N/A"}
                </p>
              </div>
              {patientInfo.email && (
                <Badge variant="outline">{patientInfo.email}</Badge>
              )}
            </CardContent>
          </Card>

          {/* KPI Cards — 4 cards, no icons (Clinician jaisa) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map((kpi, i) => (
              <Card key={i} className="relative overflow-hidden">
                <div
                  className={`absolute inset-x-0 top-0 h-16 bg-linear-to-b ${kpi.wash} to-transparent pointer-events-none`}
                />
                <CardContent className="relative p-4">
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

          {/* Chart — with patient name in title */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
                  <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
                    <TrendingUp className="h-3.5 w-3.5 text-white" />
                  </div>
                  Lung Function Trends — {patientInfo.name}
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
                        tick={{
                          fontSize: 11,
                          fill: "var(--color-fg-muted)",
                        }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "var(--color-fg-muted)",
                        }}
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
              <CardTitle className="text-subheading font-semibold flex items-center gap-2 text-fg">
                <UserRound className="h-4 w-4 text-fg-muted" />
                Spirometry Records ({total})
              </CardTitle>
              <span className="text-caption text-fg-muted">
                {dateRange.start} → {dateRange.end}
              </span>
            </CardHeader>
            <CardContent className="pt-4">
              <SpirometryTable
                data={spirometryData}
                loading={loading}
                onViewReport={handleViewReport}
                reportLoadingId={reportLoadingId}
              />

              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                label="records"
                loading={loading}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
