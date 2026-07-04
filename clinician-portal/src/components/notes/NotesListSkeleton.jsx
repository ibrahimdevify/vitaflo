import { Skeleton } from '../../components/ui/skeleton';

export default function NotesListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-card border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-32 rounded-(--radius-control)" />
          </div>
          <Skeleton className="h-4 w-full rounded-(--radius-control) mb-2" />
          <Skeleton className="h-4 w-3/4 rounded-(--radius-control)" />
        </div>
      ))}
    </div>
  );
}
