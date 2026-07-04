import { Skeleton } from '../../components/ui/skeleton';

export default function PrescriptionsListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-card border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-32 rounded-(--radius-control)" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-48 rounded-(--radius-control) mb-3" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
