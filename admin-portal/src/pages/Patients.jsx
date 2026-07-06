import { Plus, Users } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
// import PatientForm from '../components/PatientForm';
import PatientDetailModal from '../components/patients/PatientDetailModal';
import PatientForm from '../components/patients/PatientForm';
import PatientsFilters from '../components/patients/PatientsFilters';
import PatientsTable from '../components/patients/PatientsTable';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import Pagination from '../components/ui/pagination';
import { patientsAPI } from '../services/api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
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
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
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
    } catch (err) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterStatus]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const viewPatient = async (id) => {
    try {
      setLoadingDetail(true);
      setSelectedPatient(id);
      const res = await patientsAPI.getById(id);
      setPatientDetail(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to load patient details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setSelectedPatient(null);
    setPatientDetail(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            Patients
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            Manage all system patients
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPatient(null);
            setShowForm(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Patient
        </Button>
      </div>

      {showForm && (
        <PatientForm
          initialData={editingPatient}
          onCancel={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingPatient(null);
            loadPatients();
          }}
        />
      )}

      <PatientDetailModal
        open={!!selectedPatient}
        onClose={closeModal}
        patient={patientDetail}
        loading={loadingDetail}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
              <Users className="h-3.5 w-3.5 text-white" />
            </div>
            All Patients
          </CardTitle>
          <PatientsFilters
            search={search}
            onSearchChange={setSearch}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
          />
        </CardHeader>
        <CardContent className="pt-4">
          <PatientsTable
            patients={patients}
            loading={loading}
            onView={viewPatient}
            onEdit={(p) => {
              setEditingPatient(p);
              setShowForm(true);
            }}
          />
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
