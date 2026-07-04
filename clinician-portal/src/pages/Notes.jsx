import { useState } from 'react';
import { toast } from 'sonner';
import NotesAddForm from '../components/notes/NotesAddForm';
import NotesList from '../components/notes/NotesList';
import NotesPatientBar from '../components/notes/NotesPatientBar';
import NotesSearch from '../components/notes/NotesSearch';
import api from '../services/api';

export default function Notes() {
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState({});

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotes, setTotalNotes] = useState(0);
  const limit = 10;

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const loadNotes = async (userId, pageNum = 1) => {
    if (!userId) {
      toast.error('Please enter a Patient ID, Username, or Email');
      return;
    }
    try {
      setLoading(true);
      setPatientId(userId);
      setPage(pageNum);

      const res = await api.get('/notes', {
        params: {
          user_id: userId,
          page: pageNum,
          limit,
          start_date: dateRange.start,
          end_date: dateRange.end,
        },
      });

      const data = res.data.data || [];
      const pagination = res.data.pagination || {};

      setNotes(data);
      setTotalPages(pagination.pages || 1);
      setTotalNotes(pagination.total || data.length);

      if (data.length === 0) {
        toast.info('No notes found for this patient');
      }
    } catch (err) {
      toast.error('Failed to load notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      await api.post('/notes', {
        user_id: patientId,
        text: data.text.trim(),
        page: data.page,
      });
      toast.success('Note created successfully!');
      setShowForm(false);
      loadNotes(patientId, 1);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create note');
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
        <h1 className="text-heading font-bold text-fg tracking-tight">Notes</h1>
        <p className="text-caption text-fg-muted mt-1">
          Manage clinical notes and observations for your patients
        </p>
      </div>

      <NotesSearch
        search={search}
        onSearchChange={setSearch}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        loading={loading}
        patientId={patientId}
        onLoadNotes={loadNotes}
        onToggleForm={() => setShowForm(!showForm)}
        showForm={showForm}
      />

      <NotesPatientBar patientId={patientId} totalNotes={totalNotes} />

      {showForm && (
        <NotesAddForm
          patientId={patientId}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      <NotesList
        notes={notes}
        loading={loading}
        patientId={patientId}
        page={page}
        totalPages={totalPages}
        totalNotes={totalNotes}
        expanded={expanded}
        onToggleExpand={toggleExpand}
        onPageChange={(p) => loadNotes(patientId, p)}
      />
    </div>
  );
}
