import { Card, CardContent, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

const DashboardSkeleton = () => {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-80 " />
        </div>
        <Skeleton className="h-4 w-20 " />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 shrink-0" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-5 w-10" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescriptions skeleton */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-7 w-7" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-3 w-14" />
          </CardHeader>
          <CardContent className="pt-3 space-y-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-1 py-3.5">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3.5 w-32  mb-2" />
                  <Skeleton className="h-3 w-24 " />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Patients skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-7 w-7" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-14" />
          </CardHeader>
          <CardContent className="pt-3 space-y-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-1 py-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3.5 w-28  mb-2" />
                  <Skeleton className="h-3 w-20 " />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
