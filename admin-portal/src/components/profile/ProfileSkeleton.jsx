import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in px-4">
      <Skeleton className="h-4 w-32 rounded-control" />

      <div className="flex items-center gap-5 pb-8 border-b border-border">
        <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-52 rounded-control" />
          <Skeleton className="h-4 w-32 rounded-control" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-none border-border h-fit">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-3 w-16 rounded-control mb-2" />
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-control" />
            ))}
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-40 w-full rounded-card" />
          <Skeleton className="h-32 w-full rounded-card" />
        </div>
      </div>
    </div>
  );
}
