import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import Pagination from '../../ui/pagination';
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

export default function SpirometryTab({ data, onRefetch }) {
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
    onRefetch({ startDate: startDate || undefined, endDate: endDate || undefined, page: 1, limit });
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    onRefetch({ page: 1, limit });
  };

  const handlePageChange = (nextPage) => {
    onRefetch({ startDate: startDate || undefined, endDate: endDate || undefined, page: nextPage, limit });
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

        <Button onClick={handleView} className="w-full sm:w-auto py-2 flex-1">
          View
        </Button>

        {hasActiveFilter && (
          <Button variant="outline" onClick={handleClearFilter} className="w-full sm:w-auto py-2">
            Clear
          </Button>
        )}
      </div>

      {!hasActiveFilter && (
        <p className="text-xs text-fg-muted">
          Showing the patient's full spirometry history. Set a date range above to filter.
        </p>
      )}

      {rows.length === 0 ? (
        <div className="rounded-(--radius-card) border border-border bg-surface-raised px-4 py-8 text-center">
          <p className="text-sm text-fg-muted">
            No spirometry tests recorded for this date range.
          </p>
        </div>
      ) : (
        <>
          {rows.map((row) => {
            const rowsByVariable = new Map((row.results || []).map((r) => [r.variable, r]));
            const flowVolumeSeries = row.flowVolumeSeries || [];
            const volumeTimeSeries = row.volumeTimeSeries || [];

            return (
              <div
                key={row.observationId}
                className="space-y-6 rounded-(--radius-card) border border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-fg">{formatDate(row.date)}</h3>
                  <span className="text-xs text-fg-muted">{row.testsCount} test{row.testsCount === 1 ? '' : 's'}</span>
                </div>

                {/* Results Table */}
                <div className="overflow-hidden ">
                  <div className="overflow-x-auto">
                    <table>
                      <thead>
                        <tr>
                          <th className="px-4 py-3 font-medium text-fg-muted">
                            Variable
                          </th>
                          <th className="px-4 py-3 font-medium text-fg-muted">
                            Observed
                          </th>
                          <th className="px-4 py-3 font-medium text-fg-muted">LLN</th>
                          <th className="px-4 py-3 font-medium text-fg-muted">
                            z-score
                          </th>
                          <th className="px-4 py-3 font-medium text-fg-muted">
                            Predicted
                          </th>
                          <th className="px-4 py-3 font-medium text-fg-muted">
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
                              className="border-b border-border last:border-b-0 hover:bg-surface-raised/50"
                            >
                              <td className="px-4 py-3 font-medium text-fg">
                                {label}
                              </td>

                              <td className="px-4 py-3 text-fg">
                                {formatNumber(cell?.observed)}
                              </td>

                              <td className="px-4 py-3 text-fg-muted">
                                {cell?.lln != null ? formatNumber(cell.lln) : 'N/A'}
                              </td>

                              <td className="px-4 py-3 text-fg-muted">
                                {cell?.zScore != null
                                  ? formatNumber(cell.zScore)
                                  : 'N/A'}
                              </td>

                              <td className="px-4 py-3 text-fg-muted">
                                {cell?.predicted != null
                                  ? formatNumber(cell.predicted)
                                  : 'N/A'}
                              </td>

                              <td className="px-4 py-3 text-fg-muted">
                                {cell?.percentPredicted != null
                                  ? formatNumber(cell.percentPredicted)
                                  : 'N/A'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="min-w-0">
                    <h3 className="mb-3 text-sm font-semibold text-fg">
                      Flow / Volume
                    </h3>

                    <div className="overflow-hidden rounded-(--radius-card) border border-border p-3 sm:p-4">
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

                  <div className="min-w-0">
                    <h3 className="mb-3 text-sm font-semibold text-fg">
                      Volume / Time
                    </h3>

                    <div className="overflow-hidden rounded-(--radius-card) border border-border p-3 sm:p-4">
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