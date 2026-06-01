import { useEffect, useState, useCallback, useRef } from 'react';
import { patientsAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Search, MoreHorizontal, Eye, UserRound, Mail, Phone, ChevronLeft, ChevronRight, X, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { spirometryAPI } from '../services/api';

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [spirometryData, setSpirometryData] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadPatients = useCallback(async () => {
    try { setLoading(true);
      const res = await patientsAPI.getAll({ page, limit, search: debouncedSearch || undefined });
      setPatients(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) { toast.error('Failed to load patients'); }
    finally { setLoading(false); }
  }, [page, limit, debouncedSearch]);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  const viewPatient = async (id) => {
    try {
      setLoadingDetail(true); setSelectedPatient(id);
      const [detailRes, spiroRes] = await Promise.all([
        patientsAPI.getById(id),
        spirometryAPI.getByUser(id, { start: '2020-01-01', end: '2030-12-31' }),
      ]);
      setPatientDetail(detailRes.data.data || detailRes.data);
      setSpirometryData((spiroRes.data.data || []).map(d => ({
        date: new Date(d.dbdate).toLocaleDateString(),
        fev1: d.fev1, fvc: d.fvc, pefr: d.pefr,
      })));
    } catch (err) { toast.error('Failed to load details'); }
    finally { setLoadingDetail(false); }
  };

  const getPageNumbers = () => {
    const pages = []; const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Patients</h1>

      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setSelectedPatient(null); setPatientDetail(null); }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-auto m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{patientDetail?.f_name} {patientDetail?.l_name}</h2>
              <Button variant="ghost" size="icon" onClick={() => { setSelectedPatient(null); setPatientDetail(null); }}><X className="h-5 w-5" /></Button>
            </div>
            <div className="p-6">
              {loadingDetail ? <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div></div> : patientDetail ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">PATIENT INFO</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-slate-500">Email:</span> {patientDetail.email || 'N/A'}</p>
                        <p><span className="text-slate-500">Phone:</span> {patientDetail.phone || 'N/A'}</p>
                        <p><span className="text-slate-500">Chart:</span> {patientDetail.patient_details?.chart_no || 'N/A'}</p>
                        <p><span className="text-slate-500">Blood:</span> {patientDetail.patient_details?.blood_group || 'N/A'}</p>
                        <Badge className={patientDetail.patient_details?.status === 'active' ? 'bg-green-500 mt-1' : 'bg-yellow-500 mt-1'}>{patientDetail.patient_details?.status || 'unknown'}</Badge>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">ATTRIBUTES</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-slate-500">DOB:</span> {patientDetail.patient_details?.attributes?.dob || 'N/A'}</p>
                        <p><span className="text-slate-500">Gender:</span> {patientDetail.patient_details?.attributes?.gender || 'N/A'}</p>
                        <p><span className="text-slate-500">Height:</span> {patientDetail.patient_details?.attributes?.height ? `${patientDetail.patient_details.attributes.height}cm` : 'N/A'}</p>
                        <p><span className="text-slate-500">Weight:</span> {patientDetail.patient_details?.attributes?.weight ? `${patientDetail.patient_details.attributes.weight}kg` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  {spirometryData.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2"><Activity className="h-4 w-4" /> SPIROMETRY TRENDS</h3>
                      <div className="bg-slate-50 rounded-lg p-4" style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={spirometryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="fev1" stroke="#3b82f6" name="FEV1" strokeWidth={2} dot={{ r: 2 }} />
                            <Line type="monotone" dataKey="fvc" stroke="#10b981" name="FVC" strokeWidth={2} dot={{ r: 2 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  {patientDetail.prescriptions_patient?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">PRESCRIPTIONS ({patientDetail.prescriptions_patient.length})</h3>
                      <div className="space-y-2">
                        {patientDetail.prescriptions_patient.map((p, i) => (
                          <div key={i} className="bg-slate-50 rounded p-3 text-sm">
                            <p className="font-medium">{p.diagnosis}</p>
                            <p className="text-slate-500">{p.pharmacy_instruction}</p>
                            <div className="flex gap-1 mt-1">{p.medicines?.map((m, j) => <Badge key={j} variant="outline" className="text-xs">{m.drug}</Badge>)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Patients</CardTitle>
            <div className="relative w-64"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div></div> : (
            <>
              <Table>
                <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Chart No</TableHead><TableHead>Status</TableHead><TableHead>Group</TableHead><TableHead>Joined</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {patients.map(patient => (
                    <TableRow key={patient.user_id}>
                      <TableCell className="font-medium"><div className="flex items-center gap-2"><div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-600">{patient.f_name?.[0]}{patient.l_name?.[0]}</div><div><p>{patient.f_name} {patient.l_name}</p><p className="text-xs text-slate-500">{patient.email}</p></div></div></TableCell>
                      <TableCell>{patient.patient_details?.chart_no || 'N/A'}</TableCell>
                      <TableCell><Badge className={patient.patient_details?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>{patient.patient_details?.status || 'unknown'}</Badge></TableCell>
                      <TableCell>{patient.patient_details?.patient_group?.name || 'N/A'}</TableCell>
                      <TableCell className="text-sm text-slate-500">{new Date(patient.reg_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewPatient(patient.user_id)}><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {patients.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-500"><UserRound className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p className="text-lg">No patients found</p></TableCell></TableRow>}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-slate-500">Page {page} of {totalPages} ({total} total)</span>
                  <div className="flex gap-1">
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
