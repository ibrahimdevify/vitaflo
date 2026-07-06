import { Plus, Stethoscope } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ClinicianDetailModal from '../components/clinicians/ClinicianDetailModal';
import ClinicianForm from '../components/clinicians/ClinicianForm';
import CliniciansFilters from '../components/clinicians/CliniciansFilters';
import CliniciansTable from '../components/clinicians/CliniciansTable';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import Pagination from '../components/ui/pagination';
import { cliniciansAPI } from '../services/api';

export default function Clinicians() {
  const [clinicians, setClinicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
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
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
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
    } catch (err) {
      toast.error('Failed to load clinicians');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterSpecialist]);

  useEffect(() => {
    loadClinicians();
  }, [loadClinicians]);

  const viewClinician = async (id) => {
    try {
      setLoadingDetail(true);
      setSelectedClinician(id);
      const res = await cliniciansAPI.getById(id);
      setClinicianDetail(res.data.data || res.data);
    } catch (err) {
      toast.error('Failed to load clinician details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setSelectedClinician(null);
    setClinicianDetail(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            Clinicians
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            Manage all system clinicians
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingClinician(null);
            setShowForm(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Clinician
        </Button>
      </div>

      {showForm && (
        <ClinicianForm
          initialData={editingClinician}
          onCancel={() => {
            setShowForm(false);
            setEditingClinician(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingClinician(null);
            loadClinicians();
          }}
        />
      )}

      <ClinicianDetailModal
        open={!!selectedClinician}
        onClose={closeModal}
        clinician={clinicianDetail}
        loading={loadingDetail}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
              <Stethoscope className="h-3.5 w-3.5 text-white" />
            </div>
            All Clinicians
          </CardTitle>
          <CliniciansFilters
            search={search}
            onSearchChange={setSearch}
            filterSpecialist={filterSpecialist}
            onFilterSpecialistChange={(v) => {
              setFilterSpecialist(v);
              setPage(1);
            }}
          />
        </CardHeader>
        <CardContent className="pt-4">
          <CliniciansTable
            clinicians={clinicians}
            loading={loading}
            onView={viewClinician}
            onEdit={(c) => {
              setEditingClinician(c);
              setShowForm(true);
            }}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            label="clinicians"
            loading={loading}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
