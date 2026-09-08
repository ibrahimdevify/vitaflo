import { useEffect, useState } from "react";
import { toast } from "sonner";
import PrescriptionsAddForm from "../components/prescriptions/PrescriptionsAddForm";
import PrescriptionsList from "../components/prescriptions/PrescriptionsList";
import PrescriptionsPatientBar from "../components/prescriptions/PrescriptionsPatientBar";
import PrescriptionsSearch from "../components/prescriptions/PrescriptionsSearch";
import { patientsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Prescriptions() {
  const [search, setSearch] = useState(""); // empty by default — optional filter
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState({});

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  const { user } = useAuth();

  const [selectedPatient, setSelectedPatient] = useState(null);

  // ✅ empty by default — no date filter applied unless the user sets one
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // ✅ The ONLY fetch function in this file — always hits the list endpoint.
  // No `id` param is ever sent, so it can never 400 with "id must be a
  // positive integer". Per-patient detail is achieved via the `search`
  // filter, not a different route.
  const fetchList = async (pageNum = 1, overrides = {}) => {
    const effectiveSearch = overrides.search ?? search;
    const effectiveStart = overrides.start ?? dateRange.start;
    const effectiveEnd = overrides.end ?? dateRange.end;
    try {
      setLoading(true);
      setPage(pageNum);

      const res = await patientsAPI.getPrescriptionsList({
        search: effectiveSearch || undefined,
        start_date: effectiveStart || undefined,
        end_date: effectiveEnd || undefined,
        page: pageNum,
        limit,
      });

      const data = res.data.data || [];
      const pagination = res.data.pagination || {};

      setPrescriptions(data);
      setTotalPages(pagination.pages || 1);
      setTotalRecords(pagination.total || data.length);
    } catch (err) {
      toast.error("Failed to load prescriptions");
      setPrescriptions([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loads full clinic list, no filters, on mount
  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (pageNum = 1) => {
    setSelectedPatient(null);
    fetchList(pageNum);
  };

  const handleSelectPatient = (patientId, patientLabel) => {
    setSelectedPatient({ id: patientId, label: patientLabel });
    setSearch(patientLabel || String(patientId));
    fetchList(1, { search: patientLabel || String(patientId) });
  };

  const handleSubmit = async (data) => {
    if (!selectedPatient) {
      toast.error("Select a patient first");
      return;
    }
    try {
      setSubmitting(true);

      await patientsAPI.createPrescription(selectedPatient.id, {
        diagnosis: data.diagnosis.trim(),
        pharmacy_instruction: data.pharmacy_instruction?.trim() || "",
        medicines: data.medicines.map((m) => ({
          drug: m.drug.trim(),
          dosage: m.dosage?.trim() || "N/A",
          frequency: m.frequency?.trim() || "N/A",
          quantity: m.quantity?.trim() || "1",
          days: m.days?.trim() || "1",
          direction: m.direction?.trim() || "N/A",
        })),
      });
      toast.success("Prescription created successfully!");
      setShowForm(false);
      fetchList(1, { search: selectedPatient.label });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create prescription");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const distinctPatientIds = new Set(prescriptions.map((p) => p.patient_id));
  const isSinglePatientView =
    prescriptions.length > 0 && distinctPatientIds.size === 1;
  const activePatientId =
    selectedPatient?.id ?? (isSinglePatientView ? prescriptions[0].patient_id : null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-heading font-bold text-fg tracking-tight">
          Prescriptions
        </h1>
        <p className="text-caption text-fg-muted mt-1">
          Manage and track prescriptions across your clinic's patients
        </p>
      </div>

      <PrescriptionsSearch
        search={search}
        onSearchChange={setSearch}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        loading={loading}
        onSearch={handleSearch}
        canCreate={Boolean(activePatientId)}
        onToggleForm={() => setShowForm(!showForm)}
        showForm={showForm}
      />

      {isSinglePatientView && (
        <PrescriptionsPatientBar
          patientId={
            prescriptions[0].patient_name ||
            prescriptions[0].patient_username ||
            activePatientId
          }
          dateRange={dateRange}
          totalRecords={totalRecords}
        />
      )}

      {showForm && activePatientId && (
        <PrescriptionsAddForm
          patientId={activePatientId}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <PrescriptionsList
        prescriptions={prescriptions}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalRecords={totalRecords}
        expanded={expanded}
        onToggleExpand={toggleExpand}
        onPageChange={(p) => fetchList(p)}
        showPatientColumn={!isSinglePatientView}
        onSelectPatient={handleSelectPatient}
      />
    </div>
  );
}