import { useEffect, useState } from "react";
import { spirometryAPI } from "../services/api";
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
  Search,
  Activity,
  TrendingUp,
  User,
  Calendar,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Spirometry() {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [spirometryData, setSpirometryData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [latestBlows, setLatestBlows] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: "2020-01-01",
    end: "2030-12-31",
  });

  useEffect(() => {
    spirometryAPI
      .getLatest()
      .then((res) => setLatestBlows(res.data.data || []))
      .catch(() => {});
  }, []);

  const searchPatient = async () => {
    const query = search.trim();
    if (!query) {
      toast.error("Please enter a Patient ID, Username, or Email");
      return;
    }
    try {
      setLoading(true);
      setSelectedPatient(query);
      // Backend now supports: numeric ID, username, email, or phone
      const res = await spirometryAPI.getByUser(query, dateRange);
      const data = res.data.data || [];
      setSpirometryData(data);

      // Build chart data from spirometry records
      const chart = data
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
        .filter((d) => d.fev1 || d.fvc)
        .sort((a, b) => a.fullDate - b.fullDate);

      setChartData(chart);

      if (data.length === 0) {
        toast.info("No spirometry data found for this patient");
      } else {
        toast.success(`Loaded ${data.length} spirometry records`);
      }
    } catch (err) {
      toast.error("Failed to load spirometry data");
      setSpirometryData([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const latestRecord = spirometryData[spirometryData.length - 1];
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchPatient();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Spirometry</h1>

      {/* Search Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by Patient ID, Username, or Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="w-36 text-sm"
              />
              <span className="self-center text-slate-400">to</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="w-36 text-sm"
              />
            </div>
            <Button
              onClick={searchPatient}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Activity className="h-4 w-4 mr-2" />
              {loading ? "Loading..." : "View Spirometry"}
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Supports: Patient ID, Username, or Email address
          </p>
        </CardContent>
      </Card>

      {selectedPatient && (
        <div className="space-y-6">
          {/* Stats Cards */}
          {spirometryData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-slate-500">Total Tests</p>
                  <p className="text-2xl font-bold text-green-600">
                    {spirometryData.length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-slate-500">Best FEV1</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {bestFEV1 ? bestFEV1.toFixed(2) : "-"}{" "}
                    <span className="text-xs">L</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-slate-500">Best FVC</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {bestFVC ? bestFVC.toFixed(2) : "-"}{" "}
                    <span className="text-xs">L</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-slate-500">Best PEFR</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {bestPEFR ? bestPEFR.toFixed(0) : "-"}{" "}
                    <span className="text-xs">L/s</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Lung Function Trends - {selectedPatient}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="fev1"
                        stroke="#3b82f6"
                        name="FEV1 (L)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="fvc"
                        stroke="#10b981"
                        name="FVC (L)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="pefr"
                        stroke="#f59e0b"
                        name="PEFR (L/s)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Spirometry Records ({spirometryData.length})</span>
                <span className="text-sm font-normal text-slate-500">
                  {dateRange.start} → {dateRange.end}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : spirometryData.length > 0 ? (
                <div className="overflow-x-auto">
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
                        <TableHead>Quality</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spirometryData.map((s, i) => (
                        <TableRow
                          key={s.id || i}
                          className={i % 2 === 0 ? "bg-slate-50" : ""}
                        >
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(s.dbdate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "2-digit",
                            })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {s.fev1?.toFixed(2) || "-"}
                          </TableCell>
                          <TableCell>{s.fvc?.toFixed(2) || "-"}</TableCell>
                          <TableCell>{s.pefr?.toFixed(0) || "-"}</TableCell>
                          <TableCell>{s.fef2575?.toFixed(2) || "-"}</TableCell>
                          <TableCell>{s.fev6?.toFixed(2) || "-"}</TableCell>
                          <TableCell>
                            {s.fev1_perc ? (
                              <Badge
                                className={
                                  s.fev1_perc >= 80
                                    ? "bg-green-500"
                                    : s.fev1_perc >= 60
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }
                              >
                                {s.fev1_perc.toFixed(0)}%
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-slate-500">
                            {s.quality_message || s.symptom || "Good"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-lg">No spirometry data found</p>
                  <p className="text-sm">
                    Try a different date range or patient
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Default state - no patient selected */}
      {!selectedPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Search for a Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <User className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-lg">
                Enter a Patient ID, Username, or Email above
              </p>
              <p className="text-sm">
                to view their spirometry data and trends
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
