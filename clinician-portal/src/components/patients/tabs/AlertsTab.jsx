import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import Pagination from '../../ui/pagination';
import { formatDateTime } from './format';

export default function AlertsTab({ data, onRefetch }) {
  const [startDate, setStartDate] = useState(
    data?.startDate ? String(data.startDate).slice(0, 10) : ''
  );
  const [endDate, setEndDate] = useState(
    data?.endDate ? String(data.endDate).slice(0, 10) : ''
  );

  const history = data?.history || [];
  const limit = data?.pagination?.limit || 20;
  const page = data?.pagination?.page || 1;
  const totalPages = data?.pagination?.totalPages || 1;
  const total = data?.pagination?.total || 0;
  const hasActiveFilter = Boolean(data?.startDate && data?.endDate);

  // Only reject a *mismatched* pair (one filled, one empty). Both empty is
  // valid — it means "no filter", which the backend treats as full history.
  const handleGo = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) return;
    onRefetch?.({ startDate: startDate || undefined, endDate: endDate || undefined, page: 1, limit });
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onRefetch?.({ page: 1, limit });
  };

  const handlePageChange = (nextPage) => {
    onRefetch?.({ startDate: startDate || undefined, endDate: endDate || undefined, page: nextPage, limit });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-fg">Alerts History</h3>
        <p className="mt-1 text-xs text-fg-muted">
          Review previous alerts and their notification channels.
        </p>
      </div>

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
          Showing the patient's full alert history. Set a date range above to filter.
        </p>
      )}

      {history.length === 0 ? (
        <div className="rounded-(--radius-card) border border-border bg-surface-raised px-4 py-10 text-center">
          <p className="text-sm font-medium text-fg">No alerts history</p>
          <p className="mt-1 text-xs text-fg-muted">
            There are no alerts available for this patient.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden ">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-raised text-left">
                    <th className="px-4 py-3 font-medium text-fg-muted">Date</th>
                    <th className="px-4 py-3 font-medium text-fg-muted">
                      Message
                    </th>
                    <th className="px-4 py-3 font-medium text-fg-muted">Read</th>
                    <th className="px-4 py-3 font-medium text-fg-muted">
                      Notifications
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((alert) => (
                    <tr
                      key={alert.id}
                      className="border-b border-border last:border-b-0 hover:bg-surface-raised/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-fg">
                        {formatDateTime(alert.created)}
                      </td>

                      <td className="max-w-[360px] px-4 py-3 text-fg">
                        {alert.message}
                      </td>

                      <td className="px-4 py-3 text-fg-muted">
                        {alert.isRead ? 'Yes' : 'No'}
                      </td>

                      <td className="px-4 py-3 text-fg-muted">
                        {alert.notifications.map((n) => n.channel).join(', ') ||
                          '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            label="alerts"
            loading={false}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <div className="border-t border-border pt-4">
        <p className="text-xs leading-5 text-fg-muted">
          Alert creation (custom IF/THEN rules) isn't available yet — no schema
          table backs alert rules.
        </p>
      </div>
    </div>
  );
}