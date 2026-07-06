import { Activity, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import SpirometryDetailModal from '../components/spirometry/SpirometryDetailModal';
import SpirometryTable from '../components/spirometry/SpirometryTable';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import Pagination from '../components/ui/pagination';
import { spirometryAPI } from '../services/api';

export default function Spirometry() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSpirometry, setPatientSpirometry] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [latestBlows, setLatestBlows] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadReadings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await spirometryAPI.getReadings();
      const data = res.data.data || [];
      setReadings(data);
      const filtered = debouncedSearch
        ? data.filter((s) =>
            String(s.observation?.user_id || '').includes(debouncedSearch)
          )
        : data;
      setTotal(filtered.length);
      setTotalPages(Math.ceil(filtered.length / limit) || 1);
    } catch (err) {
      toast.error('Failed to load spirometry data');
    } finally {
      setLoading(false);
    }
  }, [limit, debouncedSearch]);

  useEffect(() => {
    loadReadings();
  }, [loadReadings]);
  useEffect(() => {
    spirometryAPI
      .getLatest()
      .then((res) => setLatestBlows(res.data.data || []))
      .catch(() => {});
  }, []);

  const viewPatientSpirometry = async (userId) => {
    try {
      setLoadingDetail(true);
      setSelectedPatient(userId);
      const res = await spirometryAPI.getByUser(userId, {
        start: '2020-01-01',
        end: '2030-12-31',
      });
      const data = res.data.data || [];
      setPatientSpirometry(data);
      setChartData(
        data
          .filter((d) => d.fev1 || d.fvc)
          .map((d) => ({
            date: new Date(d.dbdate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            fev1: d.fev1 ? parseFloat(d.fev1.toFixed(2)) : null,
            fvc: d.fvc ? parseFloat(d.fvc.toFixed(2)) : null,
            pefr: d.pefr ? parseFloat(d.pefr.toFixed(0)) : null,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
      );
    } catch (err) {
      toast.error('Failed to load patient spirometry');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setSelectedPatient(null);
    setPatientSpirometry([]);
    setChartData([]);
  };

  const filteredData = debouncedSearch
    ? readings.filter((s) =>
        String(s.observation?.user_id || '').includes(debouncedSearch)
      )
    : readings;
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);
  const getLatestBlow = (userId) =>
    latestBlows.find((b) => b.user_id === userId)
      ? new Date(
          latestBlows.find((b) => b.user_id === userId).lastblow
        ).toLocaleDateString()
      : 'Never';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            Spirometry
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            Monitor patient lung function data
          </p>
        </div>
        <Badge variant="info" className="gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          {readings.length} Records
        </Badge>
      </div>

      <SpirometryDetailModal
        open={!!selectedPatient}
        onClose={closeModal}
        patientId={selectedPatient}
        data={patientSpirometry}
        chartData={chartData}
        loading={loadingDetail}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
              <Activity className="h-3.5 w-3.5 text-white" />
            </div>
            All Spirometry Records
          </CardTitle>
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
            <Input
              placeholder="Search by Patient ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <SpirometryTable
            data={paginatedData}
            loading={loading}
            onViewPatient={viewPatientSpirometry}
            getLatestBlow={getLatestBlow}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            label="records"
            loading={loading}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
