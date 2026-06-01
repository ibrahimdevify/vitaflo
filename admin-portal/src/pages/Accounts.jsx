import { useEffect, useState } from 'react';
import { accountsAPI } from '../services/api';
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
import { Plus, Building2, Check, X as XIcon, Eye, Edit, MoreHorizontal, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountDetail, setAccountDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [form, setForm] = useState({ name: '', breezometer: true, awair: true, bronchodilator_responsiveness_testing: true, clinical_decision_support_flowchart: false });
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const res = await accountsAPI.getAll();
      setAccounts(res.data.data || []);
    } catch (err) { toast.error('Failed to load accounts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAccounts(); }, []);

  const viewAccount = async (id) => {
    try {
      setLoadingDetail(true);
      setSelectedAccount(id);
      const [detailRes, statsRes] = await Promise.all([
        accountsAPI.getById(id),
        accountsAPI.getStats(id),
      ]);
      setAccountDetail({ ...detailRes.data.data, stats: statsRes.data.data });
    } catch (err) { toast.error('Failed to load account details'); }
    finally { setLoadingDetail(false); }
  };

  const startEdit = (account) => {
    setEditingAccount(account);
    const attrs = account.account_attributes || {};
    setForm({
      name: account.name || '',
      breezometer: attrs.breezometer ?? true,
      awair: attrs.awair ?? true,
      bronchodilator_responsiveness_testing: attrs.bronchodilator_responsiveness_testing ?? true,
      clinical_decision_support_flowchart: attrs.clinical_decision_support_flowchart ?? false,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingAccount) {
        await accountsAPI.update(editingAccount.id, form);
        toast.success('Account updated!');
      } else {
        await accountsAPI.create(form);
        toast.success('Account created!');
      }
      setShowForm(false);
      setEditingAccount(null);
      setForm({ name: '', breezometer: true, awair: true, bronchodilator_responsiveness_testing: true, clinical_decision_support_flowchart: false });
      loadAccounts();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <Button onClick={() => { setEditingAccount(null); setForm({ name: '', breezometer: true, awair: true, bronchodilator_responsiveness_testing: true, clinical_decision_support_flowchart: false }); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Account
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="mb-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              {editingAccount ? 'Edit Account' : 'Create Account'}
            </h3>
            <div>
              <label className="text-sm font-medium mb-1 block">Account Name *</label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Hospital Name" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Features</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { key: 'breezometer', label: 'Breezometer' },
                  { key: 'awair', label: 'Awair' },
                  { key: 'bronchodilator_responsiveness_testing', label: 'Bronchodilator Test' },
                  { key: 'clinical_decision_support_flowchart', label: 'Clinical Decision Support' },
                ].map(feat => (
                  <label key={feat.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[feat.key]} onChange={e => setForm({...form, [feat.key]: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300" />
                    <span className="text-sm">{feat.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingAccount ? 'Update Account' : 'Create Account'}</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingAccount(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Detail Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setSelectedAccount(null); setAccountDetail(null); }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{accountDetail?.name || 'Account'} Details</h2>
              <Button variant="ghost" size="icon" onClick={() => { setSelectedAccount(null); setAccountDetail(null); }}><X className="h-5 w-5" /></Button>
            </div>
            <div className="p-6">
              {loadingDetail ? (
                <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>
              ) : accountDetail ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">STATS</h3>
                      <div className="space-y-2">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-2xl font-bold text-blue-600">{accountDetail.stats?.total_patients || 0}</p>
                          <p className="text-xs text-blue-500">Total Patients</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-2xl font-bold text-green-600">{accountDetail.stats?.total_clinicians || 0}</p>
                          <p className="text-xs text-green-500">Total Clinicians</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">FEATURES</h3>
                      <div className="space-y-2">
                        {accountDetail.account_attributes ? (
                          <>
                            {[{ key: 'breezometer', label: 'Breezometer' }, { key: 'awair', label: 'Awair' }, { key: 'bronchodilator_responsiveness_testing', label: 'Bronchodilator Test' }, { key: 'clinical_decision_support_flowchart', label: 'Clinical Decision Support' }].map(f => (
                              <div key={f.key} className="flex items-center gap-2 text-sm">
                                {accountDetail.account_attributes[f.key] ? <Check className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 text-red-500" />}
                                {f.label}
                              </div>
                            ))}
                          </>
                        ) : <p className="text-sm text-slate-500">No attributes set</p>}
                      </div>
                    </div>
                  </div>
                  {accountDetail.patient_groups?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">PATIENT GROUPS ({accountDetail.patient_groups.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {accountDetail.patient_groups.map(g => (
                          <Badge key={g.id} variant="outline">{g.name} ({g._count?.patients || 0})</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {accountDetail.doctor_details?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 mb-2">CLINICIANS ({accountDetail.doctor_details.length})</h3>
                      <div className="space-y-2">
                        {accountDetail.doctor_details.map(d => (
                          <div key={d.user_id_fk} className="flex items-center gap-2 text-sm">
                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-xs text-green-600">{d.user?.f_name?.[0]}</div>
                            {d.user?.f_name} {d.user?.l_name}
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div><p className="mt-2 text-slate-500">Loading...</p></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Groups</TableHead>
                  <TableHead>Clinicians</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map(account => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><Building2 className="h-4 w-4 text-blue-600" /></div>
                        <p>{account.name}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{account._count?.patient_groups || 0}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{account._count?.doctor_details || 0}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {account.account_attributes?.breezometer && <Badge className="bg-green-500 text-xs">BZ</Badge>}
                        {account.account_attributes?.awair && <Badge className="bg-blue-500 text-xs">AW</Badge>}
                        {account.account_attributes?.bronchodilator_responsiveness_testing && <Badge className="bg-purple-500 text-xs">BD</Badge>}
                        {account.account_attributes?.clinical_decision_support_flowchart && <Badge className="bg-orange-500 text-xs">CD</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{new Date(account.creation_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewAccount(account.id)}><Eye className="h-4 w-4 mr-2" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => startEdit(account)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {accounts.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-500"><Building2 className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p className="text-lg">No accounts found</p></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
