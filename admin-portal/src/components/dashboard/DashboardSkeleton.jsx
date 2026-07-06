import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-48 rounded-(--radius-control)" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-3 pt-4 pb-4">
              <Skeleton className="h-10 w-10 rounded-(--radius-control) shrink-0" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-3 w-16 rounded-(--radius-control) mb-2" />
                <Skeleton className="h-6 w-10 rounded-(--radius-control)" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full rounded-card" />
        <Skeleton className="h-80 w-full rounded-card" />
      </div>
    </div>
  );
}
