import { FileText, User } from 'lucide-react';

export default function NotesPatientBar({ patientId, totalNotes }) {
  if (!patientId) return null;

  return (
    <div className="flex items-center gap-3 text-caption bg-surface-raised rounded-card p-3">
      <div className="flex items-center gap-1.5">
        <User className="h-4 w-4 text-brand-500" />
        <span className="text-fg-muted">Patient:</span>
        <span className="font-semibold text-fg">{patientId}</span>
      </div>
      <span className="text-border">|</span>
      <div className="flex items-center gap-1.5">
        <FileText className="h-4 w-4 text-info" />
        <span className="text-fg-muted">
          {totalNotes} note{totalNotes !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
