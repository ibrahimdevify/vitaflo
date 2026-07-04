import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
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
  patientId,
  page,
  totalPages,
  totalNotes,
  expanded,
  onToggleExpand,
  onPageChange,
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

              return (
                <div
                  key={note.id || i}
                  className="rounded-card border border-border bg-surface transition-shadow hover:shadow-card-hover"
                >
                  <div
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() => onToggleExpand(i)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
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
        ) : patientId ? (
          <EmptyState
            icon={FileText}
            title="No notes found"
            description="Try a different date range or create a new note"
          />
        ) : (
          <EmptyState
            icon={FileText}
            title="Enter a Patient ID to view notes"
            description="Supports: Patient ID, Username, or Email"
          />
        )}
      </CardContent>
    </Card>
  );
}
