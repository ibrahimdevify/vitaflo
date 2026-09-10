import { UserPlus, Users as UsersIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import Pagination from '../components/ui/pagination';
import UserForm from '../components/users/UserForm';
import UsersFilters from '../components/users/UsersFilters';
import UsersTable from '../components/users/UsersTable';
import { cliniciansAPI } from '../services/api';

// NOTE: renamed from the generic "Users" page to "Clinicians" because every
// wired endpoint (GET/POST/PUT /patients/clinicians) only ever operates on
// ut_id_fk=3 (clinician) records, scoped server-side to the calling
// clinician_admin. There is currently no general "manage all user types"
// backend to match the original page's framing.
export default function Clinicians() {
  const [clinicians, setClinicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingClinician, setEditingClinician] = useState(null);
  const debounceRef = useRef(null);

  // Removed: filterType (ut_id_fk). getAllClinicians hardcodes ut_id_fk: 3
  // server-side and doesn't read a ut_id_fk query param, so a type filter
  // has nothing meaningful to switch between on this page.

  // Removed: filterStatus / usersAPI.getStatuses(). There's no
  // /patients/clinicians status-list endpoint yet, so there's nothing to
  // populate a status dropdown with. Add back once that endpoint exists —
  // wiring `us_id_fk` into the where clause on the backend is a small
  // addition if you want it.

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
      const params = { page, limit, sort_by: 'reg_date', sort_dir: 'desc' };
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await cliniciansAPI.getAllClinicians(params);
      setClinicians(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to load clinicians';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    loadClinicians();
  }, [loadClinicians]);

  const handleCreate = async (data) => {
    try {
      // ut_id_fk is intentionally not sent — the backend hardcodes
      // ut_id_fk: 3 for this endpoint and ignores/ should never trust a
      // client-supplied role. If UserForm currently includes a "type"
      // field for this flow, it should be removed for this page.
      await cliniciansAPI.create(data);
      toast.success('Clinician created');
      setShowForm(false);
      loadClinicians();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create clinician');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await cliniciansAPI.update(editingClinician.user_id, data);
      toast.success('Clinician updated');
      setEditingClinician(null);
      setShowForm(false);
      loadClinicians();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update clinician');
    }
  };

  // No DELETE /patients/clinicians/:id endpoint exists yet. Rather than
  // call something that doesn't exist (and fail silently or with a
  // confusing 404), this is disabled until we decide the deactivation
  // path: most likely PUT /patients/clinicians/:id with us_id_fk set to
  // whatever your "inactive" status id is.
  const handleDelete = async (_id) => {
    toast.error(
      'Deactivating clinicians isn\u2019t wired up yet \u2014 let\u2019s confirm the inactive us_id_fk value first.'
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            Clinicians
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            Manage clinicians under your account
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingClinician(null);
            setShowForm(true);
          }}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" /> Add Clinician
        </Button>
      </div>

      {showForm && (
        <UserForm
          onSubmit={editingClinician ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingClinician(null);
          }}
          initialData={editingClinician}
        />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
              <UsersIcon className="h-3.5 w-3.5 text-white" />
            </div>
            All Clinicians
          </CardTitle>
          <UsersFilters search={search} onSearchChange={setSearch} />
        </CardHeader>
        <CardContent className="pt-4">
          <UsersTable
            users={clinicians}
            loading={loading}
            onEdit={(clinician) => {
              setEditingClinician(clinician);
              setShowForm(true);
            }}
            onDelete={handleDelete}
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