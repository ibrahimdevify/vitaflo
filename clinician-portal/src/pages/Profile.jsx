import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  Shield,
  Clock,
  Save,
  X,
  Edit,
  CheckCircle,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [changingPassword, setChangingPassword] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [profileForm, setProfileForm] = useState({
    f_name: "",
    l_name: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // If user exists in context, use it
      if (user?.user_id) {
        setProfileData(user);
        setProfileForm({
          f_name: user.f_name || "",
          l_name: user.l_name || "",
          phone: user.phone || "",
        });
        setPageLoading(false);
        return;
      }
      // Otherwise fetch from API
      const res = await api.get("/auth/me");
      // API returns { user: {...} }
      const userData = res.data?.user || res.data;
      if (userData?.user_id) {
        setProfileData(userData);
        setProfileForm({
          f_name: userData.f_name || "",
          l_name: userData.l_name || "",
          phone: userData.phone || "",
        });
        if (setUser) setUser(userData);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setPageLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error("All fields are required");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post("/auth/change-password", {
        current_password: passwordForm.current,
        new_password: passwordForm.new,
      });
      toast.success(res.data?.message || "Password changed!");
      setChangingPassword(false);
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileForm.f_name.trim() || !profileForm.l_name.trim()) {
      toast.error("First and last name are required");
      return;
    }
    try {
      setSubmitting(true);
      const userId = profileData?.user_id;
      const res = await api.put(`/users/${userId}`, {
        f_name: profileForm.f_name.trim(),
        l_name: profileForm.l_name.trim(),
        phone: profileForm.phone.trim(),
      });
      toast.success(res.data?.message || "Profile updated!");
      setEditingProfile(false);
      // Update local state
      setProfileData((prev) => ({
        ...prev,
        f_name: profileForm.f_name.trim(),
        l_name: profileForm.l_name.trim(),
        phone: profileForm.phone.trim(),
      }));
      if (setUser) {
        setUser((prev) => ({
          ...prev,
          f_name: profileForm.f_name.trim(),
          l_name: profileForm.l_name.trim(),
          phone: profileForm.phone.trim(),
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = () => {
    const first = profileData?.f_name?.[0] || "";
    const last = profileData?.l_name?.[0] || "";
    return (first + last).toUpperCase() || "?";
  };

  // Loading state
  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  // No user found
  if (!profileData) {
    return (
      <div className="text-center py-12">
        <UserRound className="h-12 w-12 mx-auto mb-3 text-slate-300" />
        <p className="text-lg text-slate-500">Unable to load profile</p>
        <p className="text-sm text-slate-400">Please try logging in again</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6 text-center">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-3xl font-bold text-green-600 mx-auto mb-4 ring-4 ring-green-50">
              {getInitials()}
            </div>
            <h2 className="text-xl font-bold">
              {profileData.f_name} {profileData.l_name}
            </h2>
            <p className="text-slate-500 capitalize">
              {profileData.user_type?.name || profileData.user_type || "User"}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge className="bg-green-500 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Active
              </Badge>
            </div>
            {profileData.reg_date && (
              <p className="text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                Since {new Date(profileData.reg_date).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5 text-blue-500" />
                Account Information
              </CardTitle>
              {!editingProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProfile(true)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingProfile ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      First Name
                    </label>
                    <Input
                      value={profileForm.f_name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          f_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Last Name
                    </label>
                    <Input
                      value={profileForm.l_name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          l_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Phone
                    </label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    {submitting ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingProfile(false)}
                  >
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium">{profileData.email || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Phone className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="font-medium">{profileData.phone || "N/A"}</p>
                  </div>
                </div>
                {profileData.doctor_details && (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Shield className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-500">License</p>
                        <p className="font-medium">
                          {profileData.doctor_details.license_no || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-orange-400" />
                      <div>
                        <p className="text-xs text-slate-500">Hospital</p>
                        <p className="font-medium">
                          {profileData.doctor_details.hospital?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Clock className="h-5 w-5 text-teal-400" />
                      <div>
                        <p className="text-xs text-slate-500">Experience</p>
                        <p className="font-medium">
                          {profileData.doctor_details.experience || "N/A"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" /> Security
              </CardTitle>
              {!changingPassword && (
                <Button
                  variant="outline"
                  onClick={() => setChangingPassword(true)}
                >
                  Change Password
                </Button>
              )}
            </div>
          </CardHeader>
          {changingPassword && (
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Current Password *
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          current: e.target.value,
                        })
                      }
                      required
                      placeholder="Current password"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      New Password *
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.new}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new: e.target.value,
                        })
                      }
                      required
                      placeholder="Min. 6 characters"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Confirm Password *
                    </label>
                    <Input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirm: e.target.value,
                        })
                      }
                      required
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    {submitting ? "Updating..." : "Update Password"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setChangingPassword(false);
                      setPasswordForm({ current: "", new: "", confirm: "" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
