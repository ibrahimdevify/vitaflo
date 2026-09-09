import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import Pagination from '../../ui/pagination';
import { formatDate, formatNumber } from './format';

export default function ReportsTab({ data, onRefetch }) {
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
    onRefetch({ startDate: startDate || undefined, endDate: endDate || undefined, page: 1, limit });
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onRefetch({ page: 1, limit });
  };

  const handlePageChange = (nextPage) => {
    onRefetch({ startDate: startDate || undefined, endDate: endDate || undefined, page: nextPage, limit });
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
          Showing the patient's full report history. Set a date range above to filter.
        </p>
      )}

      {!data?.rows?.length ? (
        <div className="rounded-(--radius-card) border border-border bg-surface-raised px-4 py-10 text-center">
          <p className="text-sm font-medium text-fg">No spirometry data</p>
          <p className="mt-1 text-xs text-fg-muted">
            No spirometry results are available for the selected period.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {data.rows.map((row, i) => (
              <div key={i} className="overflow-hidden ">
                <div className="flex items-center justify-between border-b border-border bg-surface-raised px-4 py-3">
                  <h3 className="text-sm font-semibold text-fg">
                    {formatDate(row.date)}
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface-raised/50 text-left">
                        <th className="px-4 py-3 font-medium text-fg-muted">
                          Variable
                        </th>
                        <th className="px-4 py-3 font-medium text-fg-muted">
                          Observed
                        </th>
                        <th className="px-4 py-3 font-medium text-fg-muted">
                          LLN
                        </th>
                        <th className="px-4 py-3 font-medium text-fg-muted">
                          z-score
                        </th>
                        <th className="px-4 py-3 font-medium text-fg-muted">
                          Predicted
                        </th>
                        <th className="px-4 py-3 font-medium text-fg-muted">
                          % Predicted
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {row.results.map((r) => (
                        <tr
                          key={r.variable}
                          className="border-b border-border last:border-b-0 hover:bg-surface-raised/50"
                        >
                          <td className="px-4 py-3 font-medium text-fg">
                            {r.variable}
                          </td>

                          <td className="px-4 py-3 text-fg">
                            {formatNumber(r.observed)}
                          </td>

                          <td className="px-4 py-3 text-fg-muted">
                            {r.lln != null ? formatNumber(r.lln) : 'N/A'}
                          </td>

                          <td className="px-4 py-3 text-fg-muted">
                            {r.zScore != null ? formatNumber(r.zScore) : 'N/A'}
                          </td>

                          <td className="px-4 py-3 text-fg-muted">
                            {r.predicted != null
                              ? formatNumber(r.predicted)
                              : 'N/A'}
                          </td>

                          <td className="px-4 py-3 text-fg-muted">
                            {r.percentPredicted != null
                              ? formatNumber(r.percentPredicted)
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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