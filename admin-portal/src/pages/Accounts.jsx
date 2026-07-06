import { Building2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AccountDetailModal from '../components/accounts/AccountDetailModal';
import AccountForm from '../components/accounts/AccountForm';
import AccountsTable from '../components/accounts/AccountsTable';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { accountsAPI } from '../services/api';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountDetail, setAccountDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const res = await accountsAPI.getAll();
      setAccounts(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const viewAccount = async (id) => {
    try {
      setLoadingDetail(true);
      setSelectedAccount(id);
      const [detailRes, statsRes] = await Promise.all([
        accountsAPI.getById(id),
        accountsAPI.getStats(id),
      ]);
      setAccountDetail({ ...detailRes.data.data, stats: statsRes.data.data });
    } catch (err) {
      toast.error('Failed to load account details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      if (editingAccount) {
        await accountsAPI.update(editingAccount.id, data);
        toast.success('Account updated!');
      } else {
        await accountsAPI.create(data);
        toast.success('Account created!');
      }
      setShowForm(false);
      setEditingAccount(null);
      loadAccounts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-fg tracking-tight">
            Accounts
          </h1>
          <p className="text-caption text-fg-muted mt-1">
            Manage organization accounts and features
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAccount(null);
            setShowForm(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Account
        </Button>
      </div>

      {showForm && (
        <AccountForm
          initialData={editingAccount}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAccount(null);
          }}
        />
      )}

      <AccountDetailModal
        open={!!selectedAccount}
        onClose={() => {
          setSelectedAccount(null);
          setAccountDetail(null);
        }}
        account={accountDetail}
        loading={loadingDetail}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            All Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <AccountsTable
            accounts={accounts}
            loading={loading}
            onView={viewAccount}
            onEdit={(a) => {
              setEditingAccount(a);
              setShowForm(true);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
