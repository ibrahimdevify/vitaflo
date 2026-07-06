import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ProfileContact from '../components/profile/ProfileContact';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import ProfileEmpty from '../components/profile/ProfileEmpty';
import ProfileHero from '../components/profile/ProfileHero';
import ProfileSecurity from '../components/profile/ProfileSecurity';
import ProfileSkeleton from '../components/profile/ProfileSkeleton';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [changingPassword, setChangingPassword] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (user?.user_id) {
        setProfileData(user);
        setPageLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      const userData = res.data?.user || res.data;
      if (userData?.user_id) {
        setProfileData(userData);
        if (setUser) setUser(userData);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setPageLoading(false);
    }
  };

  const handlePasswordChange = async (data) => {
    try {
      setSubmittingPassword(true);
      const res = await api.post('/auth/change-password', {
        current_password: data.current,
        new_password: data.new,
      });
      toast.success(res.data?.message || 'Password changed!');
      setChangingPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleProfileUpdate = async (data) => {
    try {
      setSubmittingProfile(true);
      const userId = profileData?.user_id;
      const res = await api.put(`/users/${userId}`, data);
      toast.success(res.data?.message || 'Profile updated!');
      setEditingProfile(false);
      const updated = { ...profileData, ...data };
      setProfileData(updated);
      if (setUser) setUser((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const getInitials = () => {
    const first = profileData?.f_name?.[0] || '';
    const last = profileData?.l_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  if (pageLoading) return <ProfileSkeleton />;
  if (!profileData) return <ProfileEmpty />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in px-4">
      <div className="pt-2">
        <p className="text-caption text-fg-muted font-medium uppercase tracking-wider">
          Profile Settings
        </p>
      </div>

      <ProfileHero profileData={profileData} initials={getInitials()} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProfileContact profileData={profileData} />

        <div className="lg:col-span-2 space-y-6">
          <ProfileEditForm
            editing={editingProfile}
            onStartEdit={() => setEditingProfile(true)}
            onCancel={() => setEditingProfile(false)}
            profileData={profileData}
            submitting={submittingProfile}
            onSubmit={handleProfileUpdate}
          />

          <ProfileSecurity
            changing={changingPassword}
            onStartChange={() => setChangingPassword(true)}
            onCancel={() => setChangingPassword(false)}
            submitting={submittingPassword}
            onSubmit={handlePasswordChange}
          />
        </div>
      </div>
    </div>
  );
}
