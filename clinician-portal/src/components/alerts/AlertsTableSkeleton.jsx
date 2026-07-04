import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardContent } from '../ui/card';

export default function AlertsTableSkeleton({ rows = 6 }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-1">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-1 py-3.5">
              <Skeleton className="h-5 w-5 shrink-0 rounded-(--radius-control)" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-3.5 w-2/3 rounded-(--radius-control) mb-2" />
                <Skeleton className="h-3 w-16 rounded-(--radius-control)" />
              </div>
              <Skeleton className="h-3 w-24 rounded-(--radius-control) hidden sm:block" />
              <Skeleton className="h-3 w-20 rounded-(--radius-control) hidden sm:block" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
