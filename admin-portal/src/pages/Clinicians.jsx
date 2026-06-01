import { useEffect, useState, useCallback, useRef } from 'react';
import ClinicianForm from '../components/ClinicianForm';
import { cliniciansAPI } from '../services/api';
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
import { Plus, Search, MoreHorizontal, Eye, Edit, Stethoscope, Mail, Phone, Building2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function Clinicians() {
  const [clinicians, setClinicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterSpecialist, setFilterSpecialist] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingClinician, setEditingClinician] = useState(null);
  const [selectedClinician, setSelectedClinician] = useState(null);
  const [clinicianDetail, setClinicianDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadClinicians = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterSpecialist !== 'all') params.is_specialist = filterSpecialist;
      const res = await cliniciansAPI.getAll(params);
      setClinicians(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) { toast.error('Failed to load clinicians'); }
    finally { setLoading(false); }
  }, [page, limit, debouncedSearch, filterSpecialist]);

  useEffect(() => { loadClinicians(); }, [loadClinicians]);

  const viewClinician = async (id) => {
    try {
      setLoadingDetail(true);
      setSelectedClinician(id);
      const res = await cliniciansAPI.getById(id);
      setClinicianDetail(res.data.data || res.data);
    } catch (err) { toast.error('Failed to load clinician details'); }
    finally { setLoadingDetail(false); }
  };

  const startEdit = (c) => { setEditingClinician(c); setShowForm(true); };
  const closeModal = () => { setSelectedClinician(null); setClinicianDetail(null); };

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
        <h1 className="text-2xl font-bold">Clinicians</h1>
        <Button onClick={() => { setEditingClinician(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Clinician
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6">
          <ClinicianForm 
            initialData={editingClinician} 
            onCancel={() => { setShowForm(false); setEditingClinician(null); }} 
            onSuccess={() => { setShowForm(false); setEditingClinician(null); loadClinicians(); }} 
          />
        </div>
      )}

      {/* Detail Modal */}
      {selectedClinician && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-auto m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Clinician Details</h2>
              <Button variant="ghost" size="icon" onClick={closeModal}><X className="h-5 w-5" /></Button>
            </div>
            <div className="p-6">
              {loadingDetail ? (
                <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>
              ) : clinicianDetail ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-xl font-bold text-green-600">
                      {clinicianDetail.f_name?.[0]}{clinicianDetail.l_name?.[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{clinicianDetail.f_name} {clinicianDetail.l_name}</h2>
                      <div className="flex gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {clinicianDetail.email || 'N/A'}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {clinicianDetail.phone || 'N/A'}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {clinicianDetail.doctor_details?.is_specialist && <Badge className="bg-purple-500">Specialist</Badge>}
                        <Badge className={clinicianDetail.is_availible ? 'bg-green-500' : 'bg-red-500'}>{clinicianDetail.is_availible ? 'Available' : 'Offline'}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">PROFESSIONAL INFO</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-slate-500">License:</span> {clinicianDetail.doctor_details?.license_no || 'N/A'}</p>
                        <p><span className="text-slate-500">Experience:</span> {clinicianDetail.doctor_details?.experience || 'N/A'}</p>
                        <p><span className="text-slate-500">Education:</span> {clinicianDetail.doctor_details?.education || 'N/A'}</p>
                        <p><span className="text-slate-500">Hospital:</span> {clinicianDetail.doctor_details?.hospital?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">ABOUT</h3>
                      <p className="text-sm">{clinicianDetail.doctor_details?.about_doctor || 'No description'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-2">ASSIGNED PATIENTS ({clinicianDetail.stats?.total_patients || 0})</h3>
                    {clinicianDetail.data?.assigned_patients?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {clinicianDetail.data.assigned_patients.map((p, i) => (
                          <div key={i} className="bg-slate-50 rounded p-2 text-sm flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600">{p.user?.f_name?.[0]}</div>
                            <div><p className="font-medium">{p.user?.f_name} {p.user?.l_name}</p><p className="text-xs text-slate-500">Chart: {p.chart_no} | {p.status}</p></div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-slate-500">No patients assigned</p>}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>All Clinicians</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input placeholder="Search clinicians..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
              </div>
              <select value={filterSpecialist} onChange={e => { setFilterSpecialist(e.target.value); setPage(1); }}
                className="w-40 rounded-md border border-input bg-background px-3 py-2 text-sm h-10">
                <option value="all">All Types</option>
                <option value="true">Specialist</option>
                <option value="false">Non-Specialist</option>
              </select>
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
                    <TableHead>Clinician</TableHead><TableHead>License</TableHead><TableHead>Hospital</TableHead>
                    <TableHead>Specialist</TableHead><TableHead>Patients</TableHead><TableHead>Status</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinicians.map(clinician => (
                    <TableRow key={clinician.user_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-600">{clinician.f_name?.[0]}{clinician.l_name?.[0]}</div>
                          <div><p>{clinician.f_name} {clinician.l_name}</p><p className="text-xs text-slate-500">{clinician.email}</p></div>
                        </div>
                      </TableCell>
                      <TableCell>{clinician.doctor_details?.license_no || 'N/A'}</TableCell>
                      <TableCell><div className="flex items-center gap-1"><Building2 className="h-3 w-3 text-slate-400" />{clinician.doctor_details?.hospital?.name || 'N/A'}</div></TableCell>
                      <TableCell><Badge className={clinician.doctor_details?.is_specialist ? 'bg-purple-500' : 'bg-gray-500'}>{clinician.doctor_details?.is_specialist ? 'Yes' : 'No'}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{clinician._count?.assigned_patients || 0}</Badge></TableCell>
                      <TableCell><Badge className={clinician.is_availible ? 'bg-green-500' : 'bg-red-500'}>{clinician.is_availible ? 'Available' : 'Offline'}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewClinician(clinician.user_id)}><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => startEdit(clinician)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {clinicians.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-500"><Stethoscope className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p className="text-lg">No clinicians found</p></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Showing {clinicians.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total}</span>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
