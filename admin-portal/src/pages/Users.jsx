import { useEffect, useState, useCallback, useRef } from 'react';
import { usersAPI } from '../services/api';
import UserForm from '../components/UserForm';
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
import { Plus, Search, MoreHorizontal, Edit, Trash2, UserPlus, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
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
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
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
    } catch (err) { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, limit, debouncedSearch, filterType, filterStatus]);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => {
    usersAPI.getTypes().then(r => setUserTypes(r.data.data || [])).catch(() => {});
    usersAPI.getStatuses().then(r => setUserStatuses(r.data.data || [])).catch(() => {});
  }, []);

  const handleCreate = async (formData) => {
    try { await usersAPI.create(formData); toast.success('User created'); setShowForm(false); loadUsers(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };
  const handleUpdate = async (formData) => {
    try { await usersAPI.update(editingUser.user_id, formData); toast.success('User updated'); setEditingUser(null); setShowForm(false); loadUsers(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };
  const handleDelete = async (id) => {
    if (confirm('Deactivate this user?')) {
      try { await usersAPI.delete(id); toast.success('User deactivated'); loadUsers(); }
      catch (err) { toast.error('Failed'); }
    }
  };

  const getUserTypeName = (utId) => userTypes.find(t => t.ut_id === utId)?.name || 'Unknown';
  const getUserStatusName = (usId) => userStatuses.find(s => s.us_id === usId)?.name || 'Unknown';
  const typeColors = { technician: 'bg-purple-500', account_admin: 'bg-blue-500', clinician: 'bg-green-500', patient: 'bg-orange-500' };
  const statusColors = { active: 'bg-green-500', inactive: 'bg-red-500', suspended: 'bg-yellow-500', unverified: 'bg-gray-500' };

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
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => { setEditingUser(null); setShowForm(true); }}>
          <UserPlus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>
      {showForm && (
        <div className="mb-6">
          <UserForm userTypes={userTypes} userStatuses={userStatuses} onSubmit={editingUser ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingUser(null); }} initialData={editingUser} />
        </div>
      )}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
              </div>
              <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
                className="w-36 rounded-md border border-input bg-background px-3 py-2 text-sm h-10">
                <option value="all">All Types</option>
                {userTypes.map(t => <option key={t.ut_id} value={t.ut_id}>{t.name}</option>)}
              </select>
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-36 rounded-md border border-input bg-background px-3 py-2 text-sm h-10">
                <option value="all">All Status</option>
                {userStatuses.map(s => <option key={s.us_id} value={s.us_id}>{s.name}</option>)}
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
                    <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                            {user.f_name?.[0]}{user.l_name?.[0]}
                          </div>
                          {user.f_name} {user.l_name}
                        </div>
                      </TableCell>
                      <TableCell><Mail className="h-3 w-3 inline mr-1" />{user.email}</TableCell>
                      <TableCell><Phone className="h-3 w-3 inline mr-1" />{user.phone}</TableCell>
                      <TableCell><Badge className={typeColors[getUserTypeName(user.ut_id_fk)] || 'bg-gray-500'}>{getUserTypeName(user.ut_id_fk)}</Badge></TableCell>
                      <TableCell><Badge className={statusColors[getUserStatusName(user.us_id_fk)] || 'bg-gray-500'}>{getUserStatusName(user.us_id_fk)}</Badge></TableCell>
                      <TableCell className="text-sm text-slate-500">{new Date(user.reg_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingUser(user); setShowForm(true); }}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(user.user_id)} className="text-red-500"><Trash2 className="h-4 w-4 mr-2" /> Deactivate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-500">
                      <UserPlus className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-lg">No users found</p>
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>Showing {users.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, total)} of {total}</span>
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
