import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import Pagination from '../../ui/pagination';
import { Skeleton } from '../../ui/skeleton';
import { formatDate, formatNumber } from './format';

export default function ReportsTab({ data, onRefetch, loading }) {
  const [startDate, setStartDate] = useState(
    data?.startDate ? String(data.startDate).slice(0, 10) : ''
  );
  const [endDate, setEndDate] = useState(
    data?.endDate ? String(data.endDate).slice(0, 10) : ''
  );

  const limit = data?.pagination?.limit || 20;
  const page = data?.pagination?.page || 1;
  const totalPages = data?.pagination?.totalPages || 1;
  const total = data?.pagination?.total || 0;
  const hasActiveFilter = Boolean(data?.startDate && data?.endDate);

  // Only reject a *mismatched* pair (one filled, one empty). Both empty is
  // valid — it means "no filter", which the backend treats as full history.
  const handleGo = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) return;
    onRefetch({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: 1,
      limit,
    });
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onRefetch({ page: 1, limit });
  };

  const handlePageChange = (nextPage) => {
    onRefetch({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: nextPage,
      limit,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1 flex-1">
          <label className="text-sm font-medium text-fg">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-1 flex-1">
          <label className="text-sm font-medium text-fg">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button onClick={handleGo}>
          Go <ArrowRight />
        </Button>
        {hasActiveFilter && (
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>

      {!hasActiveFilter && (
        <p className="text-xs text-fg-muted">
          Showing the patient's full report history. Set a date range above to
          filter.
        </p>
      )}

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-(--radius-card) border border-border bg-surface"
            >
              {/* Session Header */}
              <div className="border-b border-border bg-surface-raised px-4 py-4 sm:px-5">
                <Skeleton className="h-4 w-32 rounded-(--radius-control)" />
                <Skeleton className="mt-2 h-5 w-44 rounded-(--radius-control)" />
              </div>

              {/* Table */}
              <div className="space-y-3 p-4 sm:p-5">
                <Skeleton className="h-4 w-20 rounded-(--radius-control)" />

                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((row) => (
                    <Skeleton
                      key={row}
                      className="h-10 w-full rounded-(--radius-control)"
                    />
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-4 pt-4 lg:grid-cols-2">
                  <Skeleton className="h-64 w-full rounded-(--radius-card)" />
                  <Skeleton className="h-64 w-full rounded-(--radius-card)" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !data?.rows?.length ? (
        <div className="rounded-(--radius-card) border border-border bg-surface-raised px-4 py-10 text-center">
          <p className="text-sm font-medium text-fg">No spirometry data</p>

          <p className="mt-1 text-xs text-fg-muted">
            No spirometry results are available for the selected period.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {data.rows.map((row, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-border border-l-6 bg-gradient-to-br from-card/80 to-card/40 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-border-strong"
              >
                {/* Date Header Section */}
                <div className="space-y-3 border-b border-border/50 bg-gradient-to-r from-brand-500/8 to-transparent px-5 py-5 md:px-6 md:py-6">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-col gap-2">
                      {/* Main Date */}
                      <h3 className="text-2xl font-bold tracking-[-0.02em] text-fg">
                        {formatDate(row.date)}
                      </h3>

                      {/* Test count */}
                      <p className="text-sm font-medium text-fg-muted">
                        {row.results.length} test
                        {row.results.length === 1 ? '' : 's'} recorded
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Content Section */}
                <div className="p-5 md:p-6">
                  {/* Results Table Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-3 w-3 items-center justify-center rounded-full bg-blue-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-fg">
                        Test Results
                      </h4>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-muted/60 to-muted/30">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                          <thead>
                            <tr className="border-b border-border/60 bg-muted/60">
                              <th className="px-4 py-2.5 text-left font-semibold text-fg-muted">
                                Variable
                              </th>
                              <th className="px-4 py-2.5 text-right font-semibold text-fg-muted">
                                Observed
                              </th>
                              <th className="px-4 py-2.5 text-right font-semibold text-fg-muted">
                                LLN
                              </th>
                              <th className="px-4 py-2.5 text-right font-semibold text-fg-muted">
                                z-score
                              </th>
                              <th className="px-4 py-2.5 text-right font-semibold text-fg-muted">
                                Predicted
                              </th>
                              <th className="px-4 py-2.5 text-right font-semibold text-fg-muted">
                                % Predicted
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {row.results.map((r) => (
                              <tr
                                key={r.variable}
                                className="border-b border-border/40 transition-colors duration-150 hover:bg-muted/50 last:border-b-0"
                              >
                                <td className="px-4 py-2.5 font-medium text-fg">
                                  {r.variable}
                                </td>

                                <td className="px-4 py-2.5 text-right text-fg font-semibold">
                                  {formatNumber(r.observed)}
                                </td>

                                <td className="px-4 py-2.5 text-right text-fg-muted">
                                  {r.lln != null ? formatNumber(r.lln) : '—'}
                                </td>

                                <td className="px-4 py-2.5 text-right text-fg-muted">
                                  {r.zScore != null
                                    ? formatNumber(r.zScore)
                                    : '—'}
                                </td>

                                <td className="px-4 py-2.5 text-right text-fg-muted">
                                  {r.predicted != null
                                    ? formatNumber(r.predicted)
                                    : '—'}
                                </td>

                                <td className="px-4 py-2.5 text-right text-fg-muted">
                                  {r.percentPredicted != null
                                    ? formatNumber(r.percentPredicted)
                                    : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            label="reports"
            loading={false}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <div className="border-t border-border pt-4">
        <p className="text-xs leading-5 text-fg-muted">
          PDF/ATS report export isn't wired — no export endpoint was built for
          it.
        </p>
      </div>
    </div>
  );
}
