import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { formatDate } from './format';

export default function BillingTab({ data, onRefetch }) {
  const [startDate, setStartDate] = useState(
    data?.startDate ? String(data.startDate).slice(0, 10) : ''
  );
  const [endDate, setEndDate] = useState(
    data?.endDate ? String(data.endDate).slice(0, 10) : ''
  );

  const handleGo = () => {
    if (!startDate || !endDate) return;
    onRefetch({ startDate, endDate });
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
      </div>

      <div className="space-y-5">
        <div className="rounded-(--radius-card) border border-border bg-surface-raised px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            Total days with readings
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-fg">
            {data?.totalDaysWithReadings ?? 0}
          </p>
        </div>

        {!data?.dailyReadings?.length ? (
          <div className="rounded-(--radius-card) border border-border bg-surface-raised px-4 py-10 text-center">
            <p className="text-sm font-medium text-fg">
              No spirometry activity
            </p>
            <p className="mt-1 text-xs text-fg-muted">
              No spirometry activity for the selected timeframe.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-raised text-left">
                    <th className="px-4 py-3 font-medium text-fg-muted">
                      Date
                    </th>
                    <th className="px-4 py-3 font-medium text-fg-muted">
                      Readings
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.dailyReadings.map((row) => (
                    <tr
                      key={row.date}
                      className="border-b border-border last:border-b-0 hover:bg-surface-raised/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-fg">
                        {formatDate(row.date)}
                      </td>

                      <td className="px-4 py-3 text-fg-muted">
                        {row.readings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <p className="text-xs leading-5 text-fg-muted">
            Staff Activity isn't included — no time-tracking/audit-log table
            exists in the schema yet.
          </p>
        </div>
      </div>
    </div>
  );
}
