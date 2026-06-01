import { useEffect, useState, useCallback, useRef } from 'react';
import PatientForm from '../components/PatientForm';
import { patientsAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Eye, Edit, UserRound, Mail, Phone, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

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
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterStatus !== 'all') params.status = filterStatus;
      const res = await patientsAPI.getAll(params);
      setPatients(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) { toast.error('Failed to load patients'); }
    finally { setLoading(false); }
  }, [page, limit, debouncedSearch, filterStatus]);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  const viewPatient = async (id) => {
    try {
      setLoadingDetail(true);
      setSelectedPatient(id);
      const res = await patientsAPI.getById(id);
      setPatientDetail(res.data.data || res.data);
    } catch (err) { toast.error('Failed to load patient details'); }
    finally { setLoadingDetail(false); }
  };

  const startEdit = (patient) => { setEditingPatient(patient); setShowForm(true); };

  const closeModal = () => { setSelectedPatient(null); setPatientDetail(null); };

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Button onClick={() => { setEditingPatient(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Patient
        </Button>
      </div>

      {/* Add Patient Form */}
      {showForm && (
        <div className="mb-6">
          <PatientForm initialData={editingPatient} 
            onCancel={() => setShowForm(false)} 
            onSuccess={() => { setShowForm(false); setEditingPatient(null); loadPatients(); }} 
          />
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-auto m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Patient Details</h2>
              <Button variant="ghost" size="icon" onClick={closeModal}><X className="h-5 w-5" /></Button>
            </div>
            <div className="p-6">
              {loadingDetail ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : patientDetail ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
                      {patientDetail.f_name?.[0]}{patientDetail.l_name?.[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{patientDetail.f_name} {patientDetail.l_name}</h2>
                      <div className="flex gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {patientDetail.email || 'N/A'}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {patientDetail.phone || 'N/A'}</span>
                      </div>
                      <Badge className={patientDetail.patient_details?.status === 'active' ? 'bg-green-500 mt-2' : 'bg-yellow-500 mt-2'}>
                        {patientDetail.patient_details?.status || 'unknown'}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">MEDICAL INFO</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-slate-500">Chart No:</span> {patientDetail.patient_details?.chart_no || 'N/A'}</p>
                        <p><span className="text-slate-500">Blood:</span> {patientDetail.patient_details?.blood_group || 'N/A'}</p>
                        <p><span className="text-slate-500">RPM:</span> {patientDetail.patient_details?.rpm_consent ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">GROUP & CLINICIAN</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-slate-500">Group:</span> {patientDetail.patient_details?.patient_group?.name || 'N/A'}</p>
                        <p><span className="text-slate-500">Clinician:</span> {patientDetail.patient_details?.assigned_clinician?.f_name || 'Not assigned'}</p>
                        <p><span className="text-slate-500">Joined:</span> {new Date(patientDetail.reg_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  {patientDetail.patient_details?.attributes && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">ATTRIBUTES</h3>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <p><span className="text-slate-500">DOB:</span> {patientDetail.patient_details.attributes.dob || 'N/A'}</p>
                        <p><span className="text-slate-500">Gender:</span> {patientDetail.patient_details.attributes.gender || 'N/A'}</p>
                        <p><span className="text-slate-500">Height:</span> {patientDetail.patient_details.attributes.height ? `${patientDetail.patient_details.attributes.height}cm` : 'N/A'}</p>
                        <p><span className="text-slate-500">Weight:</span> {patientDetail.patient_details.attributes.weight ? `${patientDetail.patient_details.attributes.weight}kg` : 'N/A'}</p>
                        <p><span className="text-slate-500">Smoking:</span> {patientDetail.patient_details.attributes.smoking ? 'Yes' : 'No'}</p>
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
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {p.medicines?.map((m, j) => (
                                <Badge key={j} variant="outline" className="text-xs">{m.drug} {m.dosage}</Badge>
                              ))}
                            </div>
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

      {/* Patient Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>All Patients</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
              </div>
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-36 rounded-md border border-input bg-background px-3 py-2 text-sm h-10">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="unverified">Unverified</option>
                <option value="verifed">Verified</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-slate-500">Loading...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Chart No</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Clinician</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map(patient => (
                    <TableRow key={patient.user_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                            {patient.f_name?.[0]}{patient.l_name?.[0]}
                          </div>
                          <div>
                            <p>{patient.f_name} {patient.l_name}</p>
                            <p className="text-xs text-slate-500">{patient.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{patient.patient_details?.chart_no || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={patient.patient_details?.status === 'active' ? 'bg-green-500' : patient.patient_details?.status === 'verifed' ? 'bg-blue-500' : 'bg-yellow-500'}>
                          {patient.patient_details?.status || 'unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{patient.patient_details?.patient_group?.name || 'N/A'}</TableCell>
                      <TableCell>{patient.patient_details?.assigned_clinician?.f_name || 'Unassigned'}</TableCell>
                      <TableCell className="text-sm text-slate-500">{new Date(patient.reg_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewPatient(patient.user_id)}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => startEdit(patient)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {patients.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-500">
                      <UserRound className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-lg">No patients found</p>
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Showing {patients.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total}</span>
                  <select value={limit} onChange={e => { setLimit(parseInt(e.target.value)); setPage(1); }}
                    className="w-20 rounded-md border border-input bg-background px-2 py-1 text-xs h-8">
                    {LIMIT_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <span>per page</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                  {getPageNumbers().map(p => (
                    <Button key={p} variant={p === page ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setPage(p)}>{p}</Button>
                  ))}
                  <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
