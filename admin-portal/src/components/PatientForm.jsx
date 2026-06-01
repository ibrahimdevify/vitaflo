import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { usersAPI, patientsAPI } from '../services/api';

export default function PatientForm({ onCancel, onSuccess, initialData }) {
  const isEditing = !!initialData;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    f_name: '', l_name: '', email: '', phone: '', password: '',
    chart_no: '', blood_group: '', height: '', weight: '',
    dob: '', gender: 'M', status: 'active',
    patient_group_id: '', assigned_clinician_id: '',
  });

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        f_name: initialData.f_name || '',
        l_name: initialData.l_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        password: '', // Don't populate password for security
        chart_no: initialData.patient_details?.chart_no || '',
        blood_group: initialData.patient_details?.blood_group || '',
        height: initialData.patient_details?.attributes?.height || '',
        weight: initialData.patient_details?.attributes?.weight || '',
        dob: initialData.patient_details?.attributes?.dob || '',
        gender: initialData.patient_details?.attributes?.gender || 'M',
        status: initialData.patient_details?.status || 'active',
        patient_group_id: initialData.patient_details?.patient_group_id || '',
        assigned_clinician_id: initialData.patient_details?.assigned_clinician_id || '',
      });
    }
  }, [initialData]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isEditing && step < 3) { setStep(step + 1); return; }
    if (isEditing && step < 2) { setStep(step + 1); return; }

    try {
      setLoading(true);
      
      if (isEditing) {
        // Update user first
        const userData = {
          f_name: form.f_name,
          l_name: form.l_name,
          email: form.email,
          phone: form.phone,
          us_id_fk: form.status === 'active' ? 1 : 4,
        };
        if (form.password) userData.password = form.password;
        
        await usersAPI.update(initialData.user_id, userData);

        // Update patient details/attributes if pd_id exists
        if (initialData.patient_details?.pd_id) {
          try {
            await patientsAPI.updateAttributes(initialData.patient_details.pd_id, {
              first_name: form.f_name,
              last_name: form.l_name,
              phone: form.phone,
              dob: form.dob,
              height: form.height ? parseFloat(form.height) : undefined,
              weight: form.weight ? parseFloat(form.weight) : undefined,
              gender: form.gender,
            });
          } catch (attrErr) {
            // Attributes might not exist yet, try creating
            if (attrErr.response?.status === 404) {
              await patientsAPI.createAttributes(initialData.patient_details.pd_id, {
                first_name: form.f_name,
                last_name: form.l_name,
                phone: form.phone,
                dob: form.dob,
                height: form.height ? parseFloat(form.height) : undefined,
                weight: form.weight ? parseFloat(form.weight) : undefined,
                gender: form.gender,
              });
            }
          }
        }

        toast.success('Patient updated successfully!');
      } else {
        // Create new patient
        await usersAPI.create({
          f_name: form.f_name,
          l_name: form.l_name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          ut_id_fk: 4,
          dob: form.dob,
          chart_no: form.chart_no,
          blood_group: form.blood_group,
          patient_group_id: form.patient_group_id ? parseInt(form.patient_group_id) : undefined,
          assigned_clinician_id: form.assigned_clinician_id ? parseInt(form.assigned_clinician_id) : undefined,
          height: form.height ? parseFloat(form.height) : undefined,
          weight: form.weight ? parseFloat(form.weight) : undefined,
        });
        toast.success('Patient created successfully!');
      }
      
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = ['M', 'F'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const maxStep = isEditing ? 2 : 3;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border shadow-sm">
      <div className="flex items-center justify-center gap-2 p-4 border-b bg-slate-50">
        {[1, 2, 3].filter(s => isEditing ? s <= 2 : true).map((s, idx, arr) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
              s <= step ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>{s}</div>
            <span className={`text-sm ${s <= step ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
              {s === 1 ? 'Info' : s === 2 ? 'Medical' : 'Assign'}
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
                <label className="text-sm font-medium mb-1 block">Email</label>
                <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="patient@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone *</label>
                <Input value={form.phone} onChange={e => updateField('phone', e.target.value)} required placeholder="1234567890" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Password {isEditing ? '(leave blank to keep)' : '*'}
                </label>
                <Input type="password" value={form.password} onChange={e => updateField('password', e.target.value)} 
                  required={!isEditing} placeholder={isEditing ? 'Leave blank' : 'Min 6 characters'} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Date of Birth</label>
                <Input type="date" value={form.dob} onChange={e => updateField('dob', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Chart Number</label>
                <Input value={form.chart_no} onChange={e => updateField('chart_no', e.target.value)} placeholder="CH-001" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Blood Group</label>
                <select value={form.blood_group} onChange={e => updateField('blood_group', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10">
                  <option value="">Select</option>
                  {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Height (cm)</label>
                <Input type="number" value={form.height} onChange={e => updateField('height', e.target.value)} placeholder="170" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Weight (kg)</label>
                <Input type="number" value={form.weight} onChange={e => updateField('weight', e.target.value)} placeholder="70" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Gender</label>
                <select value={form.gender} onChange={e => updateField('gender', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10">
                  {genderOptions.map(g => <option key={g} value={g}>{g === 'M' ? 'Male' : 'Female'}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <select value={form.status} onChange={e => updateField('status', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10">
                  <option value="active">Active</option>
                  <option value="unverified">Unverified</option>
                  <option value="verifed">Verified</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && !isEditing && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Patient Group ID</label>
                <Input value={form.patient_group_id} onChange={e => updateField('patient_group_id', e.target.value)} placeholder="Group ID (optional)" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Assigned Clinician ID</label>
                <Input value={form.assigned_clinician_id} onChange={e => updateField('assigned_clinician_id', e.target.value)} placeholder="Clinician ID (optional)" />
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium">Summary</p>
              <p>Name: {form.f_name} {form.l_name}</p>
              <p>Email: {form.email || 'N/A'} | Phone: {form.phone}</p>
              <p>Chart: {form.chart_no || 'N/A'} | Blood: {form.blood_group || 'N/A'}</p>
              <p>Height: {form.height || 'N/A'}cm | Weight: {form.weight || 'N/A'}kg</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-6 border-t mt-6">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : step >= maxStep ? (isEditing ? 'Update Patient' : 'Create Patient') : 'Next'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </form>
  );
}
