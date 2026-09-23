import { Card, CardContent, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

const DashboardSkeleton = () => {
  return (
    <div className="animate-fade-in">
      {/* ── Header skeleton ───────────────────────────────── */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-72 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      {/* ── StatCards skeleton (matches 6-col / 2-row grid) ── */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-2">
        {/* 1. Primary — large card */}
        <div className="sm:col-span-2 lg:col-span-3 lg:row-span-2">
          <div className="flex min-h-[160px] h-full flex-col justify-between rounded-[24px] bg-surface p-5 shadow-sm ring-1 ring-inset ring-border lg:min-h-0 lg:p-6">
            <div className="flex items-start justify-between gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-12 w-32 lg:h-14 lg:w-40" />
          </div>
        </div>

        {/* 2. Secondary — wide */}
        <div className="lg:col-span-3">
          <div className="flex h-full min-h-[100px] flex-col justify-center rounded-[24px] border border-border bg-muted p-4 lg:min-h-0 lg:p-5">
            <div className="flex items-start justify-between gap-4">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="mt-2.5 h-7 w-16 lg:h-8 lg:w-20" />
          </div>
        </div>

        {/* 3. Tertiary — small centered */}
        <div className="lg:col-span-1">
          <div className="flex h-full min-h-[100px] flex-col justify-center rounded-[24px] border border-border bg-card p-4 text-center lg:min-h-0 lg:p-5">
            <div className="flex flex-col items-center">
              <Skeleton className="mb-2.5 h-8 w-8 rounded-full" />
              <Skeleton className="h-7 w-12 lg:h-8 lg:w-14" />
              <Skeleton className="mt-1.5 h-3 w-16" />
            </div>
          </div>
        </div>

        {/* 4. Quaternary — wide row */}
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="flex h-full min-h-[100px] items-center gap-3 rounded-[24px] border border-transparent bg-surface-raised p-4 lg:min-h-0 lg:gap-3.5 lg:p-5">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-6 w-14 lg:h-7 lg:w-16" />
              <Skeleton className="mt-1.5 h-3 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* ── QuickLinks skeleton ───────────────────────────── */}
      <div className="mb-8">
        <div className="mb-3">
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`flex min-h-[88px] items-center gap-3 px-4 py-4 ${
                  i > 0
                    ? 'border-t border-border sm:border-l sm:border-t-0'
                    : ''
                } ${i === 3 ? 'lg:border-l' : ''}`}
              >
                <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main grid skeleton ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Prescriptions — spans 2 cols */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-7 w-7 rounded-(--radius-control)" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-3 w-14" />
          </CardHeader>
          <CardContent className="pt-3">
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between gap-3 px-1 py-3.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-3.5 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Patients — 1 col */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-7 w-7 rounded-(--radius-control)" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-14" />
          </CardHeader>
          <CardContent className="pt-3">
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-1 py-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-3.5 w-28 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
