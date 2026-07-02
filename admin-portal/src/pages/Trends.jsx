import { useEffect, useState } from "react";
import { trendsAPI } from "../services/api";
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
  TrendingUp,
  Activity,
  Wind,
  Search,
  Loader2,
  Calendar,
  Filter,
  UserRound,
  ChevronDown,
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

export default function Trends() {
  const [userId, setUserId] = useState("");
  const [spirometryTrends, setSpirometryTrends] = useState([]);
  const [iaqTrends, setIaqTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("spirometry");
  const [stats, setStats] = useState(null);

  // Date range
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear() - 1, 0, 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const loadTrends = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a Patient ID, Username, or Email");
      return;
    }
    try {
      setLoading(true);
      if (activeTab === "spirometry") {
        const res = await trendsAPI.getSpirometry(
          userId.trim(),
          dateRange.start,
          dateRange.end,
        );
        const data = (res.data.data || []).filter((d) => d.fev1 || d.fvc);

        // Calculate stats
        if (data.length > 0) {
          const latest = data[data.length - 1];
          const bestFev1 = Math.max(...data.map((d) => d.fev1 || 0));
          const bestFvc = Math.max(...data.map((d) => d.fvc || 0));
          const bestPefr = Math.max(...data.map((d) => d.pefr || 0));
          setStats({ latest, bestFev1, bestFvc, bestPefr, total: data.length });
        } else {
          setStats(null);
        }

        setSpirometryTrends(
          data.map((d) => ({
            date: new Date(d.dbdate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "2-digit",
            }),
            fev1: d.fev1 ? parseFloat(d.fev1.toFixed(2)) : null,
            fvc: d.fvc ? parseFloat(d.fvc.toFixed(2)) : null,
            pefr: d.pefr ? parseFloat(d.pefr.toFixed(0)) : null,
            fef2575: d.fef2575 ? parseFloat(d.fef2575.toFixed(2)) : null,
            fev1_perc: d.fev1_perc ? parseFloat(d.fev1_perc.toFixed(1)) : null,
          })),
        );
        if (data.length === 0) toast.info("No spirometry data found");
      } else if (activeTab === "iaq") {
        const res = await trendsAPI.getIAQ(
          userId.trim(),
          dateRange.start,
          dateRange.end,
        );
        const data = res.data.data || [];
        setIaqTrends(
          data.map((d) => ({
            date: new Date(d.dbdate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            pm25: d.pm25,
            pm10: d.pm10,
            temperature: d.temperature,
            humidity: d.humidity,
          })),
        );
        if (data.length === 0) toast.info("No air quality data found");
      }
    } catch (err) {
      toast.error("Failed to load trends");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") loadTrends();
  };

  // Quick select presets
  const presets = [
    {
      label: "1M",
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    {
      label: "3M",
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    {
      label: "6M",
      start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    {
      label: "1Y",
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
    { label: "All", start: "2020-01-01" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trends & Analytics</h1>
        {stats && (
          <Badge variant="outline" className="text-sm py-1.5">
            <Activity className="h-4 w-4 mr-1" /> {stats.total} Records
          </Badge>
        )}
      </div>

      {/* Search & Filter Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Patient ID, Username, or Email..."
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={loadTrends}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                {loading ? "Loading..." : "Load Trends"}
              </Button>
            </div>

            {/* Date Range + Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-500">Date Range:</span>
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
              <div className="flex gap-1 ml-2">
                {presets.map((p) => (
                  <Button
                    key={p.label}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() =>
                      setDateRange((prev) => ({ ...prev, start: p.start }))
                    }
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Supports: Patient ID, Username, or Email
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && activeTab === "spirometry" && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            {
              label: "Latest FEV1",
              value: stats.latest?.fev1?.toFixed(2),
              unit: "L",
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Latest FVC",
              value: stats.latest?.fvc?.toFixed(2),
              unit: "L",
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Best FEV1",
              value: stats.bestFev1?.toFixed(2),
              unit: "L",
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            {
              label: "Best FVC",
              value: stats.bestFvc?.toFixed(2),
              unit: "L",
              color: "text-teal-600",
              bg: "bg-teal-50",
            },
            {
              label: "Best PEFR",
              value: stats.bestPefr?.toFixed(0),
              unit: "L/s",
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
          ].map((s, i) => (
            <Card key={i} className={`${s.bg} border-0`}>
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>
                  {s.value || "-"}{" "}
                  <span className="text-xs font-normal">{s.unit}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b pb-3">
        {[
          {
            key: "spirometry",
            label: "Spirometry",
            icon: Activity,
            desc: "Lung function trends",
          },
          {
            key: "iaq",
            label: "Air Quality",
            icon: Wind,
            desc: "IAQ sensor data",
          },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-col h-auto py-3 px-5 ${activeTab === tab.key ? "bg-green-600 text-white" : "text-slate-500 hover:text-slate-700"}`}
          >
            <div className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </div>
            <span className="text-xs opacity-70 mt-0.5">{tab.desc}</span>
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-green-500 mx-auto" />
          <p className="mt-3 text-slate-500">Loading trends...</p>
        </div>
      ) : (
        <>
          {activeTab === "spirometry" && (
            <div className="space-y-6">
              {spirometryTrends.length > 0 ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-100">
                          <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        FEV1, FVC & PEFR Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div style={{ height: 380 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={spirometryTrends}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f1f5f9"
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 11 }}
                              angle={-45}
                              textAnchor="end"
                              height={70}
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="fev1"
                              stroke="#3b82f6"
                              name="FEV1 (L)"
                              strokeWidth={2.5}
                              dot={{ r: 2 }}
                              connectNulls={false}
                              activeDot={{ r: 5 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="fvc"
                              stroke="#10b981"
                              name="FVC (L)"
                              strokeWidth={2.5}
                              dot={{ r: 2 }}
                              connectNulls={false}
                              activeDot={{ r: 5 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="pefr"
                              stroke="#f59e0b"
                              name="PEFR (L/s)"
                              strokeWidth={2.5}
                              dot={{ r: 2 }}
                              connectNulls={false}
                              activeDot={{ r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-purple-100">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        FEV1% & FEF25-75
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={spirometryTrends}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f1f5f9"
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 11 }}
                              angle={-45}
                              textAnchor="end"
                              height={70}
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="fev1_perc"
                              stroke="#8b5cf6"
                              name="FEV1%"
                              strokeWidth={2.5}
                              dot={{ r: 2 }}
                              connectNulls={false}
                              activeDot={{ r: 5 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="fef2575"
                              stroke="#ec4899"
                              name="FEF25-75 (L/s)"
                              strokeWidth={2.5}
                              dot={{ r: 2 }}
                              connectNulls={false}
                              activeDot={{ r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : userId ? (
                <Card>
                  <CardContent className="text-center py-16 text-slate-500">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-lg">No spirometry trends found</p>
                    <p className="text-sm">Try adjusting the date range</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-16 text-slate-500">
                    <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-lg">Enter a Patient ID to view trends</p>
                    <p className="text-sm">
                      Supports: Patient ID, Username, or Email
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "iaq" && (
            <div className="space-y-6">
              {iaqTrends.length > 0 ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-100">
                          <Wind className="h-5 w-5 text-amber-600" />
                        </div>
                        PM2.5 & PM10
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div style={{ height: 380 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={iaqTrends}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f1f5f9"
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 11 }}
                              angle={-45}
                              textAnchor="end"
                              height={70}
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                              }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="pm25"
                              stroke="#f59e0b"
                              name="PM2.5"
                              strokeWidth={2.5}
                              dot={{ r: 2 }}
                              activeDot={{ r: 5 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="pm10"
                              stroke="#ef4444"
                              name="PM10"
                              strokeWidth={2.5}
                              dot={{ r: 2 }}
                              activeDot={{ r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Temperature & Humidity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={iaqTrends}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f1f5f9"
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 11 }}
                              angle={-45}
                              textAnchor="end"
                              height={70}
                            />
                            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              tick={{ fontSize: 11 }}
                            />
                            <Tooltip
                              contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                              }}
                            />
                            <Legend />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="temperature"
                              stroke="#f97316"
                              name="Temp (°C)"
                              strokeWidth={2.5}
                              dot={{ r: 2 }}
                              activeDot={{ r: 5 }}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="humidity"
                              stroke="#06b6d4"
                              name="Humidity (%)"
                              strokeWidth={2.5}
                              dot={{ r: 2 }}
                              activeDot={{ r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : userId ? (
                <Card>
                  <CardContent className="text-center py-16 text-slate-500">
                    <Wind className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-lg">No air quality data found</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-16 text-slate-500">
                    <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-lg">Enter a Patient ID to view trends</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
