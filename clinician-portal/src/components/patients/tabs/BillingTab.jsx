import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { formatDate } from "./format";

export default function BillingTab({ data, onRefetch }) {
  const [startDate, setStartDate] = useState(data?.startDate ? String(data.startDate).slice(0, 10) : "");
  const [endDate, setEndDate] = useState(data?.endDate ? String(data.endDate).slice(0, 10) : "");

  const handleGo = () => {
    if (!startDate || !endDate) return;
    onRefetch({ startDate, endDate });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-fg">Start Date</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-fg">End Date</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <Button onClick={handleGo}>Go</Button>
      </div>

      <p className="text-sm font-medium text-fg">
        Total days with readings: {data?.totalDaysWithReadings ?? 0}
      </p>

      {!data?.dailyReadings?.length ? (
        <p className="text-sm text-fg-muted">No spirometry activity for selected timeframe</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-fg-muted">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Readings</th>
            </tr>
          </thead>
          <tbody>
            {data.dailyReadings.map((row) => (
              <tr key={row.date} className="border-b border-border last:border-b-0">
                <td className="py-2 pr-4">{formatDate(row.date)}</td>
                <td className="py-2 pr-4">{row.readings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="text-xs text-fg-muted">
        Staff Activity isn't included — no time-tracking/audit-log table exists in the schema yet.
      </p>
    </div>
  );
}