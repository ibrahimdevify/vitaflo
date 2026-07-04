import { Search, Users } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import PatientDetailModal from '../components/patients/PatientDetailModal';
import PatientsTable from '../components/patients/PatientsTable';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import Pagination from '../components/ui/pagination';
import { patientsAPI, spirometryAPI } from '../services/api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [spirometryData, setSpirometryData] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const debounceRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await patientsAPI.getAll({
        page,
        limit,
        search: debouncedSearch || undefined,
      });
      setPatients(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const viewPatient = async (id) => {
    try {
      setLoadingDetail(true);
      setSelectedPatient(id);
      const [detailRes, spiroRes] = await Promise.all([
        patientsAPI.getById(id),
        spirometryAPI.getByUser(id, { start: '2020-01-01', end: '2030-12-31' }),
      ]);
      setPatientDetail(detailRes.data.data || detailRes.data);
      setSpirometryData(
        (spiroRes.data.data || []).map((d) => ({
          date: new Date(d.dbdate).toLocaleDateString(),
          fev1: d.fev1,
          fvc: d.fvc,
          pefr: d.pefr,
        }))
      );
    } catch (err) {
      toast.error('Failed to load details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setSelectedPatient(null);
    setPatientDetail(null);
    setSpirometryData([]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-heading font-bold text-fg tracking-tight">
          My Patients
        </h1>
        <p className="text-caption text-fg-muted mt-1">
          Manage and view all your patients
        </p>
      </div>

      <PatientDetailModal
        open={!!selectedPatient}
        onClose={closeModal}
        patient={patientDetail}
        spirometryData={spirometryData}
        loading={loadingDetail}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
              <Users className="h-3.5 w-3.5 text-white" />
            </div>
            All Patients
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
            <Input
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="table-container">
            <PatientsTable
              patients={patients}
              loading={loading}
              onViewPatient={viewPatient}
            />
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            label="patients"
            loading={loading}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
