import { useEffect, useState } from "react";
import { toast } from "sonner";
import NotesAddForm from "../components/notes/NotesAddForm";
import NotesList from "../components/notes/NotesList";
import NotesPatientBar from "../components/notes/NotesPatientBar";
import NotesSearch from "../components/notes/NotesSearch";
import api from "../services/api";

export default function Notes() {
  const [search, setSearch] = useState(""); // empty by default — optional filter
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState({});

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotes, setTotalNotes] = useState(0);
  const limit = 10;

  // ✅ set only once the list is narrowed to a single patient — needed
  // for "Add Note", since a note has to belong to one specific patient
  const [selectedPatient, setSelectedPatient] = useState(null);

  // ✅ empty by default — no date filter applied unless the user sets one
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // ✅ The only fetch function — always hits the clinic-wide list endpoint.
  const fetchList = async (pageNum = 1, overrides = {}) => {
    const effectiveSearch = overrides.search ?? search;
    const effectiveStart = overrides.start ?? dateRange.start;
    const effectiveEnd = overrides.end ?? dateRange.end;
    try {
      setLoading(true);
      setPage(pageNum);

      const res = await api.get("/note-list", {
        params: {
          search: effectiveSearch || undefined,
          start_date: effectiveStart || undefined,
          end_date: effectiveEnd || undefined,
          page: pageNum,
          limit,
        },
      });

      const data = res.data.data || [];
      const pagination = res.data.pagination || {};

      setNotes(data);
      setTotalPages(pagination.pages || 1);
      setTotalNotes(pagination.total || data.length);
    } catch (err) {
      toast.error("Failed to load notes");
      setNotes([]);
      setTotalNotes(0);
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

  const handleSearch = () => {
    setSelectedPatient(null);
    fetchList(1);
  };

  // ✅ Row click narrows the list to one patient and unlocks "Add Note"
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
      await api.post("/notes", {
        user_id: selectedPatient.id,
        text: data.text.trim(),
        page: data.page,
      });
      toast.success("Note created successfully!");
      setShowForm(false);
      fetchList(1, { search: selectedPatient.label });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create note");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const distinctPatientIds = new Set(notes.map((n) => n.patient_id));
  const isSinglePatientView =
    notes.length > 0 && distinctPatientIds.size === 1;
  const activePatientId =
    selectedPatient?.id ?? (isSinglePatientView ? notes[0].patient_id : null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-heading font-bold text-fg tracking-tight">Notes</h1>
        <p className="text-caption text-fg-muted mt-1">
          Manage clinical notes and observations across your clinic's patients
        </p>
      </div>

      <NotesSearch
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
        <NotesPatientBar
          patientId={
            notes[0].patient_name || notes[0].patient_username || activePatientId
          }
          totalNotes={totalNotes}
        />
      )}

      {showForm && activePatientId && (
        <NotesAddForm
          patientId={activePatientId}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <NotesList
        notes={notes}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalNotes={totalNotes}
        expanded={expanded}
        onToggleExpand={toggleExpand}
        onPageChange={(p) => fetchList(p)}
        showPatientColumn={!isSinglePatientView}
        onSelectPatient={handleSelectPatient}
      />
    </div>
  );
}