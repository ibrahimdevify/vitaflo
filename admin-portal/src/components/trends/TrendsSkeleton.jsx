import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export default function TrendsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-8 w-48 rounded-(--radius-control)" />
      <Skeleton className="h-32 w-full rounded-card" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-3 pb-3 text-center">
              <Skeleton className="h-3 w-16 rounded-(--radius-control) mx-auto mb-2" />
              <Skeleton className="h-6 w-14 rounded-(--radius-control) mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-12 w-64 rounded-(--radius-control)" />
      <Skeleton className="h-95 w-full rounded-card" />
      <Skeleton className="h-75 w-full rounded-card" />
    </div>
  );
}
