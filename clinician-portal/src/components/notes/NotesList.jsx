import { ChevronDown, ChevronUp, FileText, UserRound } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import EmptyState from '../shared/EmptyState';
import Pagination from '../ui/pagination';
import NotesListSkeleton from './NotesListSkeleton';

const pageBadgeVariants = {
  clinical: 'danger',
  medication: 'brand',
  diet: 'warning',
  exercise: 'success',
  general: 'secondary',
};

export default function NotesList({
  notes,
  loading,
  page,
  totalPages,
  totalNotes,
  expanded,
  onToggleExpand,
  onPageChange,
  showPatientColumn = true,
  onSelectPatient,
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
            <FileText className="h-3.5 w-3.5 text-white" />
          </div>
          Notes
          {totalNotes > 0 && <Badge variant="info">{totalNotes}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <NotesListSkeleton />
        ) : notes.length > 0 ? (
          <div className="space-y-2">
            {notes.map((note, i) => {
              const isExpanded = expanded[i];
              const variant = pageBadgeVariants[note.page] || 'secondary';
              const canSelectPatient =
                showPatientColumn &&
                typeof onSelectPatient === 'function' &&
                note.patient_id != null;

              return (
                <div
                  key={note.id || i}
                  className="rounded-card border border-border bg-surface transition-shadow hover:shadow-card-hover"
                >
                  <div className="p-4 flex items-center justify-between">
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onToggleExpand(i)}
                    >
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge variant={variant} className="capitalize">
                          {note.page || 'general'}
                        </Badge>
                        <span className="text-caption text-fg-muted">
                          {new Date(
                            note.dbdate || note.recorded_date
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        {/* ✅ Patient chip — clicking narrows the whole list to this patient */}
                        {showPatientColumn && (
                          <button
                            type="button"
                            disabled={!canSelectPatient}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (canSelectPatient) {
                                onSelectPatient(
                                  note.patient_id,
                                  note.patient_name || note.patient_username,
                                );
                              }
                            }}
                            className={`inline-flex items-center gap-1 text-caption rounded-pill bg-surface-raised px-2 py-0.5 ${
                              canSelectPatient
                                ? 'cursor-pointer hover:bg-brand-50 hover:text-brand-700'
                                : ''
                            }`}
                          >
                            <UserRound className="h-3 w-3" />
                            {note.patient_name || note.patient_username || note.patient_id}
                          </button>
                        )}
                      </div>
                      <p className="text-body text-fg line-clamp-2">
                        {note.text?.substring(0, 150)}
                        {note.text?.length > 150 ? '...' : ''}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-fg-muted ml-2 shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-fg-muted ml-2 shrink-0" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border pt-3">
                      <p className="text-body text-fg whitespace-pre-wrap">
                        {note.text}
                      </p>
                      <div className="flex justify-between mt-3 text-caption text-fg-muted">
                        <span>
                          Created:{' '}
                          {new Date(
                            note.dbdate || note.recorded_date
                          ).toLocaleString()}
                        </span>
                        {note.user_id && <span>User ID: {note.user_id}</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Pagination
              page={page}
              totalPages={totalPages}
              total={totalNotes}
              label="notes"
              loading={loading}
              onPageChange={(p) => onPageChange(p)}
            />
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No notes found"
            description="Try adjusting your search or date range"
          />
        )}
      </CardContent>
    </Card>
  );
}