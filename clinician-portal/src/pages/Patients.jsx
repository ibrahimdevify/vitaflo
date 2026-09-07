import { Filter, Search, UserPlus, Users, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PatientDetailModal from '../components/patients/PatientDetailModal';
import PatientsTable from '../components/patients/PatientsTable';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import Pagination from '../components/ui/pagination';
import { useAuth } from '../context/AuthContext';
import { patientsAPI } from '../services/api';

export default function Patients() {
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  // Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    first_name: '',
    last_name: '',
    dob_from: '',
    dob_to: '',
    chart_no: '',
    clinician_name: '',
    spirometry_date_from: '',
    spirometry_date_to: '',
    last_alert_from: '',
    last_alert_to: '',
    last_spirometry_from: '',
    last_spirometry_to: '',
  });

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

      // Build query params
      const params = {
        page,
        limit,
        search: debouncedSearch || undefined,
        assigned_clinician_id: user?.user_id || user?.id,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (
          params[key] === '' ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const res = await patientsAPI.getAll(params);
      setPatients(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      toast.error('Failed to load patients');
      console.error('Load patients error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, user, filters]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const viewPatient = async (id) => {
    // try {
    //   setLoadingDetail(true);
    //   setSelectedPatient(id);

    //   const detailRes = await patientsAPI.getById(id);
    //   setPatientDetail(detailRes.data.data || detailRes.data);

    //   // Get spirometry data
    //   try {
    //     const spiroRes = await spirometryAPI.getByUser(id, {
    //       start: "2020-01-01",
    //       end: "2030-12-31",
    //     });

    //     const spiroData = (spiroRes.data.data || []).map((d) => ({
    //       date: new Date(d.dbdate).toLocaleDateString(),
    //       fev1: d.fev1,
    //       fvc: d.fvc,
    //       pefr: d.pefr,
    //       fef2575: d.fef2575,
    //       fev1_perc: d.fev1_perc,
    //       is_post_bronchodilator: d.is_post_bronchodilator,
    //       quality_message: d.quality_message,
    //     }));

    //     setSpirometryData(spiroData);
    //   } catch (spiroErr) {
    //     console.error("Failed to load spirometry:", spiroErr);
    //     setSpirometryData([]);
    //   }
    // } catch (err) {
    //   toast.error("Failed to load patient details");
    // } finally {
    //   setLoadingDetail(false);
    // }
    navigate(`/patients/${id}`);
  };

  const closeModal = () => {
    setSelectedPatient(null);
    setPatientDetail(null);
    setSpirometryData([]);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      first_name: '',
      last_name: '',
      dob_from: '',
      dob_to: '',
      chart_no: '',
      clinician_name: '',
      spirometry_date_from: '',
      spirometry_date_to: '',
      last_alert_from: '',
      last_alert_to: '',
      last_spirometry_from: '',
      last_spirometry_to: '',
    });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            My Patients
          </h1>
          <p className="text-caption text-fg-muted mt-1 hidden sm:block">
            Manage and view all your assigned patients
          </p>
        </div>
        <Button
          onClick={() => navigate('/patients/add')}
          className="gap-2 bg-brand-600 hover:bg-brand-700"
        >
          <UserPlus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <PatientDetailModal
        open={!!selectedPatient}
        onClose={closeModal}
        patient={patientDetail}
        spirometryData={spirometryData}
        loading={loadingDetail}
      />

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-subheading font-semibold text-fg">
              <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
                {' '}
                <Users className="h-3.5 w-3.5 text-white" />{' '}
              </div>
              My Patients
            </CardTitle>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />

                <Input
                  placeholder="Search patients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`shrink-0 gap-2 ${
                  hasActiveFilters
                    ? 'border-brand-200 bg-brand-50 text-brand-700'
                    : 'border-border'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>

                {hasActiveFilters && (
                  <span className="h-2 w-2 rounded-full bg-brand-600" />
                )}
              </Button>
            </div>
          </div>
          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-surface-raised rounded-lg border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-body font-semibold text-fg">
                  Advanced Filters
                </h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-fg-muted hover:text-fg"
                  >
                    <X className="h-4 w-4 mr-1" /> Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-fg">
                    First Name
                  </label>
                  <Input
                    placeholder="Filter by first name"
                    value={filters.first_name}
                    onChange={(e) =>
                      handleFilterChange('first_name', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-fg">
                    Last Name
                  </label>
                  <Input
                    placeholder="Filter by last name"
                    value={filters.last_name}
                    onChange={(e) =>
                      handleFilterChange('last_name', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-fg">
                    Chart Number
                  </label>
                  <Input
                    placeholder="Filter by chart no"
                    value={filters.chart_no}
                    onChange={(e) =>
                      handleFilterChange('chart_no', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-fg">
                    Clinician Name
                  </label>
                  <Input
                    placeholder="Filter by clinician"
                    value={filters.clinician_name}
                    onChange={(e) =>
                      handleFilterChange('clinician_name', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-fg">
                    DOB From
                  </label>
                  <Input
                    type="date"
                    value={filters.dob_from}
                    onChange={(e) =>
                      handleFilterChange('dob_from', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-fg">DOB To</label>
                  <Input
                    type="date"
                    value={filters.dob_to}
                    onChange={(e) =>
                      handleFilterChange('dob_to', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-fg">
                    Spirometry Date From
                  </label>
                  <Input
                    type="date"
                    value={filters.spirometry_date_from}
                    onChange={(e) =>
                      handleFilterChange('spirometry_date_from', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-fg">
                    Spirometry Date To
                  </label>
                  <Input
                    type="date"
                    value={filters.spirometry_date_to}
                    onChange={(e) =>
                      handleFilterChange('spirometry_date_to', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-fg">
                    Last Alert From
                  </label>
                  <Input
                    type="date"
                    value={filters.last_alert_from}
                    onChange={(e) =>
                      handleFilterChange('last_alert_from', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-fg">
                    Last Alert To
                  </label>
                  <Input
                    type="date"
                    value={filters.last_alert_to}
                    onChange={(e) =>
                      handleFilterChange('last_alert_to', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-fg">
                    Last Spirometry From
                  </label>
                  <Input
                    type="date"
                    value={filters.last_spirometry_from}
                    onChange={(e) =>
                      handleFilterChange('last_spirometry_from', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-fg">
                    Last Spirometry To
                  </label>
                  <Input
                    type="date"
                    value={filters.last_spirometry_to}
                    onChange={(e) =>
                      handleFilterChange('last_spirometry_to', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}
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
