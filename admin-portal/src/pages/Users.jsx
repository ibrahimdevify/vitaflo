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
import { usersAPI } from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [userTypes, setUserTypes] = useState([]);
  const [userStatuses, setUserStatuses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit, sort_by: 'reg_date', sort_dir: 'desc' };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterType !== 'all') params.ut_id_fk = parseInt(filterType);
      if (filterStatus !== 'all') params.us_id_fk = parseInt(filterStatus);
      const res = await usersAPI.getAll(params);
      setUsers(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterType, filterStatus]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  useEffect(() => {
    usersAPI
      .getTypes()
      .then((r) => setUserTypes(r.data.data || []))
      .catch(() => {});
    usersAPI
      .getStatuses()
      .then((r) => setUserStatuses(r.data.data || []))
      .catch(() => {});
  }, []);

  const handleCreate = async (data) => {
    try {
      await usersAPI.create(data);
      toast.success('User created');
      setShowForm(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await usersAPI.update(editingUser.user_id, data);
      toast.success('User updated');
      setEditingUser(null);
      setShowForm(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Deactivate this user?')) {
      try {
        await usersAPI.delete(id);
        toast.success('User deactivated');
        loadUsers();
      } catch (err) {
        toast.error('Failed');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            Users
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            Manage system users and their roles
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {showForm && (
        <UserForm
          userTypes={userTypes}
          userStatuses={userStatuses}
          onSubmit={editingUser ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingUser(null);
          }}
          initialData={editingUser}
        />
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
              <UsersIcon className="h-3.5 w-3.5 text-white" />
            </div>
            All Users
          </CardTitle>
          <UsersFilters
            search={search}
            onSearchChange={setSearch}
            filterType={filterType}
            onFilterTypeChange={(v) => {
              setFilterType(v);
              setPage(1);
            }}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
            userTypes={userTypes}
            userStatuses={userStatuses}
          />
        </CardHeader>
        <CardContent className="pt-4">
          <UsersTable
            users={users}
            loading={loading}
            userTypes={userTypes}
            userStatuses={userStatuses}
            onEdit={(user) => {
              setEditingUser(user);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            label="users"
            loading={loading}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
