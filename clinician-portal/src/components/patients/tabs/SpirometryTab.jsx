import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import Pagination from '../../ui/pagination';
import { Skeleton } from '../../ui/skeleton';
import MiniLineChart from './MiniLineChart';
import { formatDate, formatNumber } from './format';

const ROW_LABELS = [
  { key: 'FEV1', label: 'FEV1 (L)' },
  { key: 'FVC', label: 'FVC (L)' },
  { key: 'FEV1/FVC', label: 'FEV1/FVC' },
  { key: 'FEF2575', label: 'FEF25-75 (L/s)' },
  { key: 'FEV6', label: 'FEV6 (L)' },
  { key: 'PEFR', label: 'PEFR (L/s)' },
];

function toDateInputValue(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export default function SpirometryTab({ data, onRefetch, loading }) {
  const [startDate, setStartDate] = useState(toDateInputValue(data?.startDate));
  const [endDate, setEndDate] = useState(toDateInputValue(data?.endDate));

  const limit = data?.pagination?.limit || 20;
  const page = data?.pagination?.page || 1;
  const totalPages = data?.pagination?.totalPages || 1;
  const total = data?.pagination?.total || 0;

  const hasActiveFilter = Boolean(data?.startDate && data?.endDate);

  // Only reject a *mismatched* pair (one filled, one empty). Both empty is
  // valid — it means "no filter", which the backend treats as full history.
  const handleView = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) return;
    onRefetch({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: 1,
      limit,
    });
  };

  const handleClearFilter = () => {
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

  const rows = data?.rows || [];

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="flex flex-col w-full gap-3 sm:flex-row sm:items-end">
        <div className="flex-3 space-y-1.5">
          <label className="text-sm font-medium text-fg">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="flex-3 space-y-1.5">
          <label className="text-sm font-medium text-fg">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Button
          size={'default'}
          onClick={handleView}
          className="w-full sm:w-auto py-2 flex-1"
        >
          View
        </Button>

        {hasActiveFilter && (
          <Button
            size={'default'}
            variant="outline"
            onClick={handleClearFilter}
            className="w-full sm:w-auto py-2"
          >
            Clear
          </Button>
        )}
      </div>

      {!hasActiveFilter && (
        <p className="text-xs text-fg-muted">
          Showing the patient's full spirometry history. Set a date range above
          to filter.
        </p>
      )}

      {loading ? (
        <div className="space-y-3 animate-fade-in">
          {[...Array(10)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-9 w-full rounded-(--radius-control)"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-(--radius-card) border border-border bg-surface-raised px-4 py-8 text-center">
          <p className="text-sm text-fg-muted">
            No spirometry tests recorded for this date range.
          </p>
        </div>
      ) : (
        <>
          {rows.map((row) => {
            const rowsByVariable = new Map(
              (row.results || []).map((r) => [r.variable, r])
            );
            const flowVolumeSeries = row.flowVolumeSeries || [];
            const volumeTimeSeries = row.volumeTimeSeries || [];

            return (
              <div
                key={row.observationId}
                className="group relative space-y-0 overflow-hidden rounded-2xl border-l-6 border border-border bg-gradient-to-br from-card/80 to-card/40 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-border-strong"
              >
                {/* Date Header Section - More Prominent */}
                <div className="space-y-3 border-b border-border/50 bg-gradient-to-r from-brand-500/8 to-transparent px-5 py-5 md:px-6 md:py-6">
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-col gap-2">
                      {/* Main Date */}
                      <h3 className="text-2xl font-bold tracking-[-0.02em] text-fg">
                        {formatDate(row.date)}
                      </h3>

                      {/* Test count */}
                      <p className="text-sm font-medium text-fg-muted">
                        {row.testsCount} test{row.testsCount === 1 ? '' : 's'}{' '}
                        recorded on this date
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Content Section */}
                <div className="space-y-6 p-5 md:p-6">
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
                        <table className="w-full text-sm">
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
                                GLI-2012 %
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {ROW_LABELS.map(({ key, label }) => {
                              const cell = rowsByVariable.get(key);

                              return (
                                <tr
                                  key={key}
                                  className="border-b border-border/40 transition-colors duration-150 hover:bg-muted/50 last:border-b-0"
                                >
                                  <td className="px-4 py-2.5 font-medium text-fg">
                                    {label}
                                  </td>
                                  <td className="px-4 py-2.5 text-right text-fg font-semibold">
                                    {formatNumber(cell?.observed)}
                                  </td>
                                  <td className="px-4 py-2.5 text-right text-fg-muted">
                                    {cell?.lln != null
                                      ? formatNumber(cell.lln)
                                      : '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-right text-fg-muted">
                                    {cell?.zScore != null
                                      ? formatNumber(cell.zScore)
                                      : '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-right text-fg-muted">
                                    {cell?.predicted != null
                                      ? formatNumber(cell.predicted)
                                      : '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-right text-fg-muted">
                                    {cell?.percentPredicted != null
                                      ? formatNumber(cell.percentPredicted)
                                      : '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mx-5 h-px bg-gradient-to-r from-border/30 via-border/60 to-border/30 md:mx-6" />

                  {/* Charts Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-3 w-3 items-center justify-center rounded-full bg-amber-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      </div>
                      <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-fg">
                        Analysis Charts
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {/* Flow / Volume Chart */}
                      <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-blue-500/8 to-transparent p-4">
                        <div className="mb-4 flex items-center gap-2">
                          <div className="flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                          <h5 className="text-sm font-bold text-fg">
                            Flow / Volume
                          </h5>
                        </div>

                        <div className="min-w-0 flex-1">
                          <MiniLineChart
                            series={flowVolumeSeries.map((s) => ({
                              label: s.testLabel,
                              points: (s.points || []).map((p) => ({
                                x: p.volume,
                                y: p.flow,
                              })),
                            }))}
                            xLabel="Volume (L)"
                            yLabel="Flow (L/s)"
                          />
                        </div>
                      </div>

                      {/* Volume / Time Chart */}
                      <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-amber-500/8 to-transparent p-4">
                        <div className="mb-4 flex items-center gap-2">
                          <div className="flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                          <h5 className="text-sm font-bold text-fg">
                            Volume / Time
                          </h5>
                        </div>

                        <div className="min-w-0 flex-1">
                          <MiniLineChart
                            series={volumeTimeSeries.map((s) => ({
                              label: s.testLabel,
                              points: (s.points || []).map((p) => ({
                                x: p.time,
                                y: p.volume,
                              })),
                            }))}
                            xLabel="Time (s)"
                            yLabel="Volume (L)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            label="sessions"
            loading={false}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
