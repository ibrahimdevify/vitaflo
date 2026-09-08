import { TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EmptyState from "../components/shared/EmptyState";
import SpirometryChart from "../components/spirometry/SpirometryChart";
import SpirometrySearch from "../components/spirometry/SpirometrySearch";
import SpirometryStats from "../components/spirometry/SpirometryStats";
import SpirometryTable from "../components/spirometry/SpirometryTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Pagination from "../components/ui/pagination";
import { spirometryAPI } from "../services/api";

export default function Spirometry() {
  const [search, setSearch] = useState(""); // now an optional filter, not required
  const [spirometryData, setSpirometryData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [order, setOrder] = useState("desc");
  const [dateRange, setDateRange] = useState({ start: "", end: "" }); // empty = no date filter by default
  const [reportLoadingId, setReportLoadingId] = useState(null);

  // ✅ Fetches the clinic-wide list. `search`/`start`/`end` are optional filters;
  // when all are empty this returns ALL clinic patients' records.
  const fetchList = async (pageNum = 1, overrides = {}) => {
    const effective = {
      search: overrides.search ?? search,
      order: overrides.order ?? order,
      start: overrides.start ?? dateRange.start,
      end: overrides.end ?? dateRange.end,
    };
    try {
      setLoading(true);
      setPage(pageNum);

      const res = await spirometryAPI.getList({
        search: effective.search || undefined,
        start: effective.start || undefined,
        end: effective.end || undefined,
        order: effective.order,
        page: pageNum,
        limit,
      });

      const data = res.data.data || [];
      setSpirometryData(data);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);

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
    } catch (err) {
      toast.error("Failed to load spirometry data");
      setSpirometryData([]);
      setChartData([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load full clinic list on mount — no filter required
  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage) => fetchList(newPage);

  const handleManualSearch = () => fetchList(1);

  const handleOrderChange = (newOrder) => {
    setOrder(newOrder);
    fetchList(1, { order: newOrder });
  };

  // ✅ Clicking a row's trend icon filters the list down to that one patient
  const handleViewPatient = (userId, userName) => {
    const term = userName || String(userId);
    setSearch(term);
    fetchList(1, { search: term });
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

  const bestFEV1 = spirometryData.reduce((max, s) => (s.fev1 > max ? s.fev1 : max), 0);
  const bestFVC = spirometryData.reduce((max, s) => (s.fvc > max ? s.fvc : max), 0);
  const bestPEFR = spirometryData.reduce((max, s) => (s.pefr > max ? s.pefr : max), 0);

  // ✅ When every visible row belongs to the same patient (e.g. after filtering
  // by username), show the trend chart + patient header — otherwise it's a
  // clinic-wide multi-patient list and those don't apply.
  const distinctPatientIds = new Set(spirometryData.map((s) => s.patient_id));
  const isSinglePatientView = spirometryData.length > 0 && distinctPatientIds.size === 1;
  const singlePatient = isSinglePatientView ? spirometryData[0] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-heading font-bold text-fg tracking-tight">
          Spirometry
        </h1>
        <p className="text-caption text-fg-muted mt-1">
          Track and analyze lung function data across your clinic's patients
        </p>
      </div>

      <SpirometrySearch
        search={search}
        onSearchChange={setSearch}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        loading={loading}
        onSearch={handleManualSearch}
        order={order}
        onOrderChange={handleOrderChange}
      />

      {isSinglePatientView && (
        <Card>
          <CardContent className="p-4 flex items-center gap-4 flex-wrap">
            <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-linear-to-br from-brand-500 to-brand-700 text-white font-semibold">
              {singlePatient.patient_name?.[0] || "P"}
            </div>
            <div>
              <p className="font-semibold text-fg">{singlePatient.patient_name}</p>
              <p className="text-caption text-fg-muted">
                Username: {singlePatient.patient_username || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <SpirometryStats
        totalTests={total}
        bestFEV1={bestFEV1}
        bestFVC={bestFVC}
        bestPEFR={bestPEFR}
      />

      {isSinglePatientView && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
              <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
                <TrendingUp className="h-3.5 w-3.5 text-white" />
              </div>
              Lung Function Trends — {singlePatient.patient_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <SpirometryChart data={chartData} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-subheading font-semibold flex items-center gap-2 text-fg">
            <Users className="h-4 w-4 text-fg-muted" />
            Spirometry Records ({total})
          </CardTitle>
          {(dateRange.start || dateRange.end) && (
            <span className="text-caption text-fg-muted">
              {dateRange.start || "…"} → {dateRange.end || "…"}
            </span>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          {spirometryData.length === 0 && !loading ? (
            <EmptyState
              icon={Users}
              title="No spirometry records found"
              description="Try adjusting your search or date filters"
            />
          ) : (
            <>
              <SpirometryTable
                data={spirometryData}
                loading={loading}
                onViewPatient={handleViewPatient}
                onViewReport={handleViewReport}
                reportLoadingId={reportLoadingId}
                order={order}
                onToggleOrder={() =>
                  handleOrderChange(order === "desc" ? "asc" : "desc")
                }
                showPatientColumn={!isSinglePatientView} // ✅
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                label="records"
                loading={loading}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}