import { TrendingUp, User } from "lucide-react";
import { useEffect, useState } from "react"; // ✅ add useEffect
import { useSearchParams } from "react-router-dom"; // ✅ add this
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
import { Badge } from "../components/ui/badge";
import Pagination from "../components/ui/pagination";
import { spirometryAPI } from "../services/api";

export default function Spirometry() {
  const [searchParams, setSearchParams] = useSearchParams(); // ✅ add this
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [spirometryData, setSpirometryData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState({
    start: "2020-01-01",
    end: "2030-12-31",
  });

  const searchPatient = async (pageNum = 1, overrideQuery) => {
    const query = (overrideQuery ?? search).trim(); // ✅ allow direct query
    if (!query) {
      toast.error("Please enter a Patient Username");
      return;
    }
    try {
      setLoading(true);
      setSelectedPatient(query);
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
        toast.success(
          `Loaded ${data.length} of ${res.data.total || data.length} records`,
        );
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

  // ✅ On mount: read ?username=ibbi from URL and auto-search
  useEffect(() => {
    const usernameFromUrl = searchParams.get("username");
    if (usernameFromUrl) {
      setSearch(usernameFromUrl);
      searchPatient(1, usernameFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const handlePageChange = (newPage) => {
    searchPatient(newPage);
  };

  // ✅ wrap the search box's onSearch so manual searches sync the URL too
  const handleManualSearch = () => {
    if (search.trim()) {
      setSearchParams({ username: search.trim() });
    }
    searchPatient(1);
  };

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-heading font-bold text-fg tracking-tight">
          Spirometry
        </h1>
        <p className="text-caption text-fg-muted mt-1">
          Track and analyze lung function data for your patients
        </p>
      </div>

      <SpirometrySearch
        search={search}
        onSearchChange={setSearch}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        loading={loading}
        onSearch={handleManualSearch} // ✅ changed from () => searchPatient(1)
      />

      {selectedPatient && patientInfo && (
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
            {patientInfo.dob && (
              <Badge variant="secondary">DOB: {patientInfo.dob}</Badge>
            )}
            {patientInfo.gender && (
              <Badge variant="secondary">Gender: {patientInfo.gender}</Badge>
            )}
          </CardContent>
        </Card>
      )}

      {selectedPatient && spirometryData.length > 0 && (
        <>
          <SpirometryStats
            totalTests={total}
            bestFEV1={bestFEV1}
            bestFVC={bestFVC}
            bestPEFR={bestPEFR}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
                <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
                  <TrendingUp className="h-3.5 w-3.5 text-white" />
                </div>
                Lung Function Trends — {patientInfo?.name || selectedPatient}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <SpirometryChart data={chartData} />
            </CardContent>
          </Card>

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
              <SpirometryTable data={spirometryData} loading={loading} />

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

      {!selectedPatient && (
        <Card>
          <CardContent className="pt-4">
            <EmptyState
              icon={User}
              title="Search for a Patient"
              description="Enter a Patient Username above to view their spirometry data and trends"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
