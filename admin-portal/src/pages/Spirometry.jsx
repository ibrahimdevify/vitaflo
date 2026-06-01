import { useEffect, useState, useCallback, useRef } from 'react';
import { spirometryAPI, patientsAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import { Search, Activity, TrendingUp, UserRound, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function Spirometry() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSpirometry, setPatientSpirometry] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [latestBlows, setLatestBlows] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadReadings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await spirometryAPI.getReadings();
      const data = res.data.data || [];
      setReadings(data);
      setTotal(data.length);
      setTotalPages(Math.ceil(data.length / limit));
    } catch (err) { toast.error('Failed to load spirometry data'); }
    finally { setLoading(false); }
  }, [limit]);

  useEffect(() => { loadReadings(); }, [loadReadings]);

  useEffect(() => {
    spirometryAPI.getLatest().then(res => setLatestBlows(res.data.data || [])).catch(() => {});
  }, []);

  const viewPatientSpirometry = async (userId) => {
    try {
      setLoadingDetail(true);
      setSelectedPatient(userId);
      const res = await spirometryAPI.getByUser(userId, { start: '2020-01-01', end: '2030-12-31' });
      const data = res.data.data || [];
      setPatientSpirometry(data);
      
      // Format for chart
      const chartData = data.map(d => ({
        date: new Date(d.dbdate).toLocaleDateString(),
        fev1: d.fev1,
        fvc: d.fvc,
        pefr: d.pefr,
      }));
      setTrendData(chartData);
    } catch (err) { toast.error('Failed to load patient spirometry'); }
    finally { setLoadingDetail(false); }
  };

  const paginatedData = readings.slice((page - 1) * limit, page * limit);

  const getPageNumbers = () => {
    const pages = []; const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const getLatestBlow = (userId) => {
    const blow = latestBlows.find(b => b.user_id === userId);
    return blow ? new Date(blow.lastblow).toLocaleDateString() : 'Never';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Spirometry</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm py-1.5">
            <Activity className="h-4 w-4 mr-1" /> {readings.length} Total Records
          </Badge>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setSelectedPatient(null); setPatientSpirometry([]); setTrendData([]); }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-auto m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" /> Patient Spirometry
              </h2>
              <Button variant="ghost" size="icon" onClick={() => { setSelectedPatient(null); setPatientSpirometry([]); setTrendData([]); }}><X className="h-5 w-5" /></Button>
            </div>
            <div className="p-6">
              {loadingDetail ? (
                <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>
              ) : (
                <div className="space-y-6">
                  {/* Trend Chart */}
                  {trendData.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Spirometry Trends
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-4" style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="fev1" stroke="#3b82f6" name="FEV1 (L)" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="fvc" stroke="#10b981" name="FVC (L)" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="pefr" stroke="#f59e0b" name="PEFR (L/s)" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Data Table */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-3">Spirometry Records ({patientSpirometry.length})</h3>
                    {patientSpirometry.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>FEV1 (L)</TableHead>
                            <TableHead>FVC (L)</TableHead>
                            <TableHead>PEFR (L/s)</TableHead>
                            <TableHead>FEF25-75</TableHead>
                            <TableHead>FEV6</TableHead>
                            <TableHead>FEV1%</TableHead>
                            <TableHead>Symptom</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patientSpirometry.map((s, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-sm">{new Date(s.dbdate).toLocaleDateString()}</TableCell>
                              <TableCell className="font-medium">{s.fev1?.toFixed(2) || '-'}</TableCell>
                              <TableCell>{s.fvc?.toFixed(2) || '-'}</TableCell>
                              <TableCell>{s.pefr?.toFixed(0) || '-'}</TableCell>
                              <TableCell>{s.fef2575?.toFixed(2) || '-'}</TableCell>
                              <TableCell>{s.fev6?.toFixed(2) || '-'}</TableCell>
                              <TableCell>{s.fev1_perc ? `${s.fev1_perc.toFixed(0)}%` : '-'}</TableCell>
                              <TableCell className="text-sm text-slate-500 max-w-[150px] truncate">{s.symptom || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Activity className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                        <p>No spirometry records found for this patient</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spirometry Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>All Spirometry Records</CardTitle>
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Search by user ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div><p className="mt-2 text-slate-500">Loading...</p></div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>FEV1 (L)</TableHead>
                    <TableHead>FVC (L)</TableHead>
                    <TableHead>PEFR</TableHead>
                    <TableHead>FEV1%</TableHead>
                    <TableHead>Last Blow</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{new Date(s.dbdate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <UserRound className="h-3 w-3 text-slate-400" />
                          <span className="text-xs font-mono">{s.observation?.user_id?.substring(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{s.fev1?.toFixed(2) || '-'}</TableCell>
                      <TableCell>{s.fvc?.toFixed(2) || '-'}</TableCell>
                      <TableCell>{s.pefr?.toFixed(0) || '-'}</TableCell>
                      <TableCell>{s.fev1_perc ? `${s.fev1_perc.toFixed(0)}%` : '-'}</TableCell>
                      <TableCell className="text-xs text-slate-500">{getLatestBlow(s.observation?.user_id)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => viewPatientSpirometry(s.observation?.user_id)} title="View patient trends">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedData.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center py-12 text-slate-500"><Activity className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p className="text-lg">No spirometry data found</p></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Showing {paginatedData.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total}</span>
                    <select value={limit} onChange={e => { setLimit(parseInt(e.target.value)); setPage(1); }} className="w-20 rounded-md border border-input bg-background px-2 py-1 text-xs h-8">
                      {LIMIT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <span>per page</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                    {getPageNumbers().map(p => (<Button key={p} variant={p === page ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(p)}>{p}</Button>))}
                    <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
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
