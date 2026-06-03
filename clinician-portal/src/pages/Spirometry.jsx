import { useEffect, useState } from 'react';
import { spirometryAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Search, Activity, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Spirometry() {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [spirometryData, setSpirometryData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [latestBlows, setLatestBlows] = useState([]);

  useEffect(() => {
    spirometryAPI.getLatest().then(res => setLatestBlows(res.data.data || [])).catch(() => {});
  }, []);

  const searchPatient = async () => {
    if (!search) return;
    try {
      setLoading(true);
      setSelectedPatient(search);
      const res = await spirometryAPI.getByUser(search, { start: '2020-01-01', end: '2030-12-31' });
      const data = res.data.data || [];
      setSpirometryData(data);
      setChartData(data.map(d => ({
        date: new Date(d.dbdate).toLocaleDateString(),
        fev1: d.fev1, fvc: d.fvc, pefr: d.pefr, fef2575: d.fef2575,
      })));
    } catch (err) { toast.error('Failed to load spirometry'); }
    finally { setLoading(false); }
  };

  const getLatestBlow = (userId) => {
    const blow = latestBlows.find(b => b.user_id === userId);
    return blow ? new Date(blow.lastblow).toLocaleDateString() : 'Never';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Spirometry</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Enter Patient User ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={searchPatient} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <Activity className="h-4 w-4 mr-2" /> View Spirometry
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedPatient && (
        <div className="space-y-6">
          {chartData.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-500" /> FEV1, FVC, PEFR Trends</CardTitle></CardHeader>
              <CardContent>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="fev1" stroke="#3b82f6" name="FEV1 (L)" strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="fvc" stroke="#10b981" name="FVC (L)" strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="pefr" stroke="#f59e0b" name="PEFR (L/s)" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Spirometry Records ({spirometryData.length})</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div></div>
              ) : spirometryData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead><TableHead>FEV1 (L)</TableHead><TableHead>FVC (L)</TableHead>
                      <TableHead>PEFR</TableHead><TableHead>FEF25-75</TableHead><TableHead>FEV6</TableHead>
                      <TableHead>FEV1%</TableHead><TableHead>Symptom</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spirometryData.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{new Date(s.dbdate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{s.fev1?.toFixed(2) || '-'}</TableCell>
                        <TableCell>{s.fvc?.toFixed(2) || '-'}</TableCell>
                        <TableCell>{s.pefr?.toFixed(0) || '-'}</TableCell>
                        <TableCell>{s.fef2575?.toFixed(2) || '-'}</TableCell>
                        <TableCell>{s.fev6?.toFixed(2) || '-'}</TableCell>
                        <TableCell><Badge className={s.fev1_perc >= 80 ? 'bg-green-500' : s.fev1_perc >= 60 ? 'bg-yellow-500' : 'bg-red-500'}>{s.fev1_perc ? `${s.fev1_perc.toFixed(0)}%` : '-'}</Badge></TableCell>
                        <TableCell className="text-sm text-slate-500 max-w-[120px] truncate">{s.symptom || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-slate-500"><Activity className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p>No spirometry data found for this patient</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedPatient && (
        <Card>
          <CardHeader><CardTitle>Latest Spirometry Records</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <Search className="h-10 w-10 mx-auto mb-2 text-slate-300" />
              <p className="text-lg">Enter a Patient User ID to view spirometry data</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
