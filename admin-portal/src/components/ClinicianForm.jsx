import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { usersAPI } from '../services/api';

export default function ClinicianForm({ onCancel, onSuccess, initialData }) {
  const isEditing = !!initialData;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    f_name: '', l_name: '', email: '', phone: '', password: '',
    about_doctor: '', education: '', license_no: '', 
    is_specialist: false, experience: '2 yrs', h_id_fk: 1,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        f_name: initialData.f_name || '',
        l_name: initialData.l_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        password: '',
        about_doctor: initialData.doctor_details?.about_doctor || '',
        education: initialData.doctor_details?.education || '',
        license_no: initialData.doctor_details?.license_no || '',
        is_specialist: initialData.doctor_details?.is_specialist || false,
        experience: initialData.doctor_details?.experience || '2 yrs',
        h_id_fk: initialData.doctor_details?.h_id_fk || 1,
      });
    }
  }, [initialData]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing && step < 2) { setStep(2); return; }

    try {
      setLoading(true);
      if (isEditing) {
        // Update user info
        await usersAPI.update(initialData.user_id, {
          f_name: form.f_name,
          l_name: form.l_name,
          email: form.email,
          phone: form.phone,
          ...(form.password && { password: form.password }),
        });
        toast.success('Clinician updated!');
      } else {
        // Create new clinician
        await usersAPI.create({
          f_name: form.f_name, l_name: form.l_name,
          email: form.email, phone: form.phone,
          password: form.password,
          ut_id_fk: 3, // clinician
          about_doctor: form.about_doctor,
          education: form.education,
          license_no: form.license_no,
          is_specialist: form.is_specialist,
          experience: form.experience,
          h_id_fk: form.h_id_fk,
        });
        toast.success('Clinician created!');
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save clinician');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border shadow-sm">
      <div className="flex items-center justify-center gap-2 p-4 border-b bg-slate-50">
        {[1, 2].map((s, idx, arr) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
              s <= step ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>{s}</div>
            <span className={`text-sm ${s <= step ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
              {s === 1 ? 'Basic Info' : 'Professional'}
            </span>
            {idx < arr.length - 1 && <div className="w-8 h-px bg-slate-300"></div>}
          </div>
        ))}
      </div>

      <div className="p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{isEditing ? 'Edit Information' : 'Basic Information'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">First Name *</label>
                <Input value={form.f_name} onChange={e => updateField('f_name', e.target.value)} required placeholder="John" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Last Name *</label>
                <Input value={form.l_name} onChange={e => updateField('l_name', e.target.value)} required placeholder="Doe" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email *</label>
                <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} required placeholder="doctor@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone *</label>
                <Input value={form.phone} onChange={e => updateField('phone', e.target.value)} required placeholder="1234567890" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Password {isEditing ? '(leave blank)' : '*'}
                </label>
                <Input type="password" value={form.password} onChange={e => updateField('password', e.target.value)}
                  required={!isEditing} placeholder={isEditing ? 'Leave blank' : 'Min 6 chars'} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">License Number *</label>
                <Input value={form.license_no} onChange={e => updateField('license_no', e.target.value)} required placeholder="LIC-001" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Experience</label>
                <Input value={form.experience} onChange={e => updateField('experience', e.target.value)} placeholder="5 yrs" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">About</label>
                <textarea value={form.about_doctor} onChange={e => updateField('about_doctor', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" 
                  placeholder="Brief description about the doctor..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Education</label>
                <Input value={form.education} onChange={e => updateField('education', e.target.value)} placeholder="MD, Harvard Medical School" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="specialist" checked={form.is_specialist} 
                  onChange={e => updateField('is_specialist', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300" />
                <label htmlFor="specialist" className="text-sm font-medium">Is Specialist</label>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-6 border-t mt-6">
          {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : step === 2 || isEditing ? (isEditing ? 'Update Clinician' : 'Create Clinician') : 'Next'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </form>
  );
}
