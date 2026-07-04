import { TrendingUp, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import EmptyState from '../components/shared/EmptyState';
import SpirometryChart from '../components/spirometry/SpirometryChart';
import SpirometrySearch from '../components/spirometry/SpirometrySearch';
import SpirometryStats from '../components/spirometry/SpirometryStats';
import SpirometryTable from '../components/spirometry/SpirometryTable';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { spirometryAPI } from '../services/api';

export default function Spirometry() {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [spirometryData, setSpirometryData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '2020-01-01',
    end: '2030-12-31',
  });

  const searchPatient = async () => {
    const query = search.trim();
    if (!query) {
      toast.error('Please enter a Patient ID, Username, or Email');
      return;
    }
    try {
      setLoading(true);
      setSelectedPatient(query);
      const res = await spirometryAPI.getByUser(query, dateRange);
      const data = res.data.data || [];
      setSpirometryData(data);

      const chart = data
        .map((d) => ({
          date: new Date(d.dbdate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit',
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
        toast.info('No spirometry data found for this patient');
      } else {
        toast.success(`Loaded ${data.length} spirometry records`);
      }
    } catch (err) {
      toast.error('Failed to load spirometry data');
      setSpirometryData([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const bestFEV1 = spirometryData.reduce(
    (max, s) => (s.fev1 > max ? s.fev1 : max),
    0
  );
  const bestFVC = spirometryData.reduce(
    (max, s) => (s.fvc > max ? s.fvc : max),
    0
  );
  const bestPEFR = spirometryData.reduce(
    (max, s) => (s.pefr > max ? s.pefr : max),
    0
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
        onSearch={searchPatient}
      />

      {selectedPatient && spirometryData.length > 0 && (
        <>
          <SpirometryStats
            totalTests={spirometryData.length}
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
                Lung Function Trends — {selectedPatient}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <SpirometryChart data={chartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-subheading font-semibold text-fg">
                Spirometry Records ({spirometryData.length})
              </CardTitle>
              <span className="text-caption text-fg-muted">
                {dateRange.start} → {dateRange.end}
              </span>
            </CardHeader>
            <CardContent className="pt-4">
              <SpirometryTable data={spirometryData} loading={loading} />
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
              description="Enter a Patient ID, Username, or Email above to view their spirometry data and trends"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
