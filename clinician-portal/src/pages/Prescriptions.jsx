import { useState } from 'react';
import { toast } from 'sonner';
import PrescriptionsAddForm from '../components/prescriptions/PrescriptionsAddForm';
import PrescriptionsList from '../components/prescriptions/PrescriptionsList';
import PrescriptionsPatientBar from '../components/prescriptions/PrescriptionsPatientBar';
import PrescriptionsSearch from '../components/prescriptions/PrescriptionsSearch';
import { patientsAPI } from '../services/api';

export default function Prescriptions() {
  const [search, setSearch] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState({});

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const searchPrescriptions = async (pageNum = 1) => {
    const query = search.trim();
    if (!query) {
      toast.error('Please enter a Patient ID, Username, or Email');
      return;
    }
    try {
      setLoading(true);
      setPatientId(query);
      setPage(pageNum);

      const res = await patientsAPI.getPrescriptions(query, {
        page: pageNum,
        limit,
        start_date: dateRange.start,
        end_date: dateRange.end,
      });

      const data = res.data.data || [];
      const pagination = res.data.pagination || {};

      setPrescriptions(data);
      setTotalPages(pagination.pages || 1);
      setTotalRecords(pagination.total || data.length);

      if (data.length === 0) {
        toast.info('No prescriptions found for this date range');
      }
    } catch (err) {
      toast.error('Failed to load prescriptions');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      await patientsAPI.createPrescription(patientId, {
        diagnosis: data.diagnosis.trim(),
        pharmacy_instruction: data.pharmacy_instruction?.trim() || '',
        doctor_id_fk: 1,
        medicines: data.medicines.map((m) => ({
          drug: m.drug.trim(),
          dosage: m.dosage?.trim() || 'N/A',
          frequency: m.frequency?.trim() || 'N/A',
          quantity: m.quantity?.trim() || '1',
          days: m.days?.trim() || '1',
          direction: m.direction?.trim() || 'N/A',
        })),
      });
      toast.success('Prescription created successfully!');
      setShowForm(false);
      searchPrescriptions(1);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-heading font-bold text-fg tracking-tight">
          Prescriptions
        </h1>
        <p className="text-caption text-fg-muted mt-1">
          Manage and track patient prescriptions
        </p>
      </div>

      <PrescriptionsSearch
        search={search}
        onSearchChange={setSearch}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        loading={loading}
        patientId={patientId}
        onSearch={searchPrescriptions}
        onToggleForm={() => setShowForm(!showForm)}
        showForm={showForm}
      />

      <PrescriptionsPatientBar
        patientId={patientId}
        dateRange={dateRange}
        totalRecords={totalRecords}
      />

      {showForm && (
        <PrescriptionsAddForm
          patientId={patientId}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <PrescriptionsList
        prescriptions={prescriptions}
        loading={loading}
        patientId={patientId}
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        expanded={expanded}
        onToggleExpand={toggleExpand}
        onPageChange={(p) => searchPrescriptions(p)}
      />
    </div>
  );
}
