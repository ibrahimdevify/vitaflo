import { useEffect, useState } from 'react';
import { patientsAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Search, ClipboardList, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Prescriptions() {
  const [search, setSearch] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [form, setForm] = useState({ diagnosis: '', pharmacy_instruction: '', medicines: [{ drug: '', dosage: '', frequency: '', direction: '' }] });
  const [submitting, setSubmitting] = useState(false);

  const searchPrescriptions = async () => {
    if (!search) return;
    try {
      setLoading(true); setPatientId(search);
      const res = await patientsAPI.getPrescriptions(search);
      setPrescriptions(res.data.data || []);
    } catch (err) { toast.error('Failed to load prescriptions'); }
    finally { setLoading(false); }
  };

  const addMedicine = () => setForm({...form, medicines: [...form.medicines, { drug: '', dosage: '', frequency: '', direction: '' }]});
  const removeMedicine = (idx) => setForm({...form, medicines: form.medicines.filter((_, i) => i !== idx)});
  const updateMedicine = (idx, field, value) => {
    const meds = [...form.medicines];
    meds[idx] = {...meds[idx], [field]: value};
    setForm({...form, medicines: meds});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await patientsAPI.createPrescription(patientId, {
        diagnosis: form.diagnosis,
        pharmacy_instruction: form.pharmacy_instruction,
        doctor_id_fk: 1,
        medicines: form.medicines.filter(m => m.drug),
      });
      toast.success('Prescription created!');
      setShowForm(false);
      setForm({ diagnosis: '', pharmacy_instruction: '', medicines: [{ drug: '', dosage: '', frequency: '', direction: '' }] });
      searchPrescriptions();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Prescriptions</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Enter Patient User ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={searchPrescriptions} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <ClipboardList className="h-4 w-4 mr-2" /> Load
            </Button>
            {patientId && (
              <Button variant="outline" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" /> New Prescription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New Prescription</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Diagnosis *</label>
                  <Input value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} required placeholder="Asthma" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Instructions</label>
                  <Input value={form.pharmacy_instruction} onChange={e => setForm({...form, pharmacy_instruction: e.target.value})} placeholder="Take as needed" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Medicines</label>
                {form.medicines.map((med, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
                    <Input placeholder="Drug *" value={med.drug} onChange={e => updateMedicine(idx, 'drug', e.target.value)} required />
                    <Input placeholder="Dosage" value={med.dosage} onChange={e => updateMedicine(idx, 'dosage', e.target.value)} />
                    <Input placeholder="Frequency" value={med.frequency} onChange={e => updateMedicine(idx, 'frequency', e.target.value)} />
                    <div className="flex gap-1">
                      <Input placeholder="Direction" value={med.direction} onChange={e => updateMedicine(idx, 'direction', e.target.value)} />
                      {idx > 0 && <Button type="button" variant="ghost" size="icon" onClick={() => removeMedicine(idx)}><X className="h-3 w-3" /></Button>}
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addMedicine}>+ Add Medicine</Button>
              </div>
              <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">{submitting ? 'Saving...' : 'Create Prescription'}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Prescriptions {prescriptions.length > 0 && `(${prescriptions.length})`}</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div></div>
          ) : prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((p, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">{p.diagnosis}</p>
                      <p className="text-sm text-slate-500">{p.pharmacy_instruction}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{new Date(p.pr_date).toLocaleDateString()}</Badge>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {p.medicines?.map((m, j) => (
                      <Badge key={j} className="bg-green-100 text-green-800 hover:bg-green-200">
                        {m.drug} {m.dosage} - {m.frequency}
                      </Badge>
                    ))}
                  </div>
                  {p.doctor && <p className="text-xs text-slate-400 mt-2">By: {p.doctor.f_name} {p.doctor.l_name}</p>}
                </div>
              ))}
            </div>
          ) : patientId ? (
            <div className="text-center py-8 text-slate-500"><ClipboardList className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p>No prescriptions found</p></div>
          ) : (
            <div className="text-center py-8 text-slate-500"><Search className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p>Enter a Patient ID to view prescriptions</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
