import { useEffect, useState } from 'react';
import { patientsAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, FileText, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const notesAPI = {
  getNotes: (params) => patientsAPI.getPrescriptions(params).constructor.prototype ? 
    fetch('/api/notes?' + new URLSearchParams(params)).then(r => r.json()) : null,
  createNote: (data) => fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(data) }).then(r => r.json()),
};

export default function Notes() {
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Use the API service directly
  const loadNotes = async (userId) => {
    try {
      setLoading(true); setPatientId(userId);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/notes?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotes(data.data || []);
    } catch (err) { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: parseInt(patientId), text: noteText, page: 'dashboard' }),
      });
      toast.success('Note created!');
      setShowForm(false); setNoteText('');
      loadNotes(patientId);
    } catch (err) { toast.error('Failed to create note'); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notes</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Enter Patient User ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Button onClick={() => loadNotes(search)} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <FileText className="h-4 w-4 mr-2" /> Load Notes
            </Button>
            {patientId && (
              <Button variant="outline" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Note
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Note</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]" placeholder="Write your note here..." />
              <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">{submitting ? 'Saving...' : 'Save Note'}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Patient Notes {notes.length > 0 && `(${notes.length})`}</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div></div>
          ) : notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">{note.page || 'General'}</Badge>
                    <span className="text-xs text-slate-400">{new Date(note.dbdate).toLocaleString()}</span>
                  </div>
                  <p className="text-sm">{note.text}</p>
                </div>
              ))}
            </div>
          ) : patientId ? (
            <div className="text-center py-8 text-slate-500"><FileText className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p>No notes found</p></div>
          ) : (
            <div className="text-center py-8 text-slate-500"><Search className="h-10 w-10 mx-auto mb-2 text-slate-300" /><p>Enter a Patient ID to view notes</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
