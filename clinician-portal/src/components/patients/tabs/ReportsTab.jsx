import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { formatDate, formatNumber } from "./format";

export default function ReportsTab({ data, onRefetch }) {
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

      {!data?.rows?.length ? (
        <p className="text-sm text-fg-muted">No spirometry data</p>
      ) : (
        <div className="space-y-6">
          {data.rows.map((row, i) => (
            <div key={i} className="space-y-2">
              <h3 className="text-sm font-semibold text-fg">{formatDate(row.date)}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-fg-muted">
                    <th className="py-2 pr-4">Variable</th>
                    <th className="py-2 pr-4">Observed</th>
                    <th className="py-2 pr-4">LLN</th>
                    <th className="py-2 pr-4">z-score</th>
                    <th className="py-2 pr-4">Predicted</th>
                    <th className="py-2 pr-4">% Predicted</th>
                  </tr>
                </thead>
                <tbody>
                  {row.results.map((r) => (
                    <tr key={r.variable} className="border-b border-border last:border-b-0">
                      <td className="py-2 pr-4 font-medium text-fg">{r.variable}</td>
                      <td className="py-2 pr-4">{formatNumber(r.observed)}</td>
                      <td className="py-2 pr-4">{r.lln != null ? formatNumber(r.lln) : "N/A"}</td>
                      <td className="py-2 pr-4">{r.zScore != null ? formatNumber(r.zScore) : "N/A"}</td>
                      <td className="py-2 pr-4">{r.predicted != null ? formatNumber(r.predicted) : "N/A"}</td>
                      <td className="py-2 pr-4">{r.percentPredicted != null ? formatNumber(r.percentPredicted) : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-fg-muted">
        PDF/ATS report export isn't wired — no export endpoint was built for it.
      </p>
    </div>
  );
}