import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { UserRound, Mail, Phone, Building2, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [submitting, setSubmitting] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Passwords do not match'); return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: passwordForm.current, new_password: passwordForm.new }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password changed!');
        setChangingPassword(false);
        setPasswordForm({ current: '', new: '', confirm: '' });
      } else {
        toast.error(data.error || 'Failed');
      }
    } catch (err) { toast.error('Failed to change password'); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 text-center">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-3xl font-bold text-green-600 mx-auto mb-4">
              {user?.f_name?.[0]}{user?.l_name?.[0]}
            </div>
            <h2 className="text-xl font-bold">{user?.f_name} {user?.l_name}</h2>
            <p className="text-slate-500">{user?.user_type || 'Clinician'}</p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge className="bg-green-500">Active</Badge>
              {user?.is_guardian && <Badge className="bg-purple-500">Guardian</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-slate-400" />
              <div><p className="text-sm text-slate-500">Email</p><p className="font-medium">{user?.email || 'N/A'}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-slate-400" />
              <div><p className="text-sm text-slate-500">Phone</p><p className="font-medium">{user?.phone || 'N/A'}</p></div>
            </div>
            {user?.doctor_details && (
              <>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-slate-400" />
                  <div><p className="text-sm text-slate-500">License</p><p className="font-medium">{user.doctor_details.license_no || 'N/A'}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-slate-400" />
                  <div><p className="text-sm text-slate-500">Hospital</p><p className="font-medium">{user.doctor_details.hospital?.name || 'N/A'}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <div><p className="text-sm text-slate-500">Experience</p><p className="font-medium">{user.doctor_details.experience || 'N/A'}</p></div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Security</CardTitle>
              {!changingPassword && <Button variant="outline" onClick={() => setChangingPassword(true)}>Change Password</Button>}
            </div>
          </CardHeader>
          {changingPassword && (
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Current Password</label>
                    <Input type="password" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">New Password</label>
                    <Input type="password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Confirm Password</label>
                    <Input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} required />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">{submitting ? 'Changing...' : 'Update Password'}</Button>
                  <Button type="button" variant="outline" onClick={() => setChangingPassword(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
