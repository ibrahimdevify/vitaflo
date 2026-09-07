import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import MiniLineChart from "./MiniLineChart";
import { formatNumber } from "./format";

const ROW_LABELS = [
  { key: "FEV1", label: "FEV1 (L)" },
  { key: "FVC", label: "FVC (L)" },
  { key: "FEV1/FVC", label: "FEV1/FVC" },
  { key: "FEF2575", label: "FEF25-75 (L/s)" },
  { key: "FEV6", label: "FEV6 (L)" },
  { key: "PEFR", label: "PEFR (L/s)" },
];

export default function SpirometryTab({ data, onRefetch }) {
  const [date, setDate] = useState(data?.date || new Date().toISOString().slice(0, 10));

  const handleView = () => onRefetch({ date });

  const rowsByVariable = new Map((data?.bestResults || []).map((r) => [r.variable, r]));

  // [FIX] These were `data.flowVolumeSeries` / `data.volumeTimeSeries`
  // with no fallback — if the backend response for this tab doesn't
  // include these arrays (undefined/null), calling `.map` on them
  // crashed the whole component with "Cannot read properties of
  // undefined (reading 'map')". Defaulting to `[]` renders an empty
  // chart instead of crashing.
  const flowVolumeSeries = data?.flowVolumeSeries || [];
  const volumeTimeSeries = data?.volumeTimeSeries || [];

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-fg">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Button onClick={handleView}>View</Button>
      </div>

      {!data || data.testsCount === 0 ? (
        <p className="text-sm text-fg-muted">No spirometry tests recorded for this date.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-fg-muted">
                  <th className="py-2 pr-4">Variable</th>
                  <th className="py-2 pr-4">Observed</th>
                  <th className="py-2 pr-4">LLN</th>
                  <th className="py-2 pr-4">z-score</th>
                  <th className="py-2 pr-4">Predicted</th>
                  <th className="py-2 pr-4">GLI-2012 %</th>
                </tr>
              </thead>
              <tbody>
                {ROW_LABELS.map(({ key, label }) => {
                  const row = rowsByVariable.get(key);
                  return (
                    <tr key={key} className="border-b border-border last:border-b-0">
                      <td className="py-2 pr-4 font-medium text-fg">{label}</td>
                      <td className="py-2 pr-4">{formatNumber(row?.observed)}</td>
                      <td className="py-2 pr-4">{row?.lln != null ? formatNumber(row.lln) : "N/A"}</td>
                      <td className="py-2 pr-4">{row?.zScore != null ? formatNumber(row.zScore) : "N/A"}</td>
                      <td className="py-2 pr-4">{row?.predicted != null ? formatNumber(row.predicted) : "N/A"}</td>
                      <td className="py-2 pr-4">{row?.percentPredicted != null ? formatNumber(row.percentPredicted) : "N/A"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-fg">Flow / Volume</h3>
              <MiniLineChart
                series={flowVolumeSeries.map((s) => ({
                  label: s.testLabel,
                  points: (s.points || []).map((p) => ({ x: p.volume, y: p.flow })),
                }))}
                xLabel="Volume (L)"
                yLabel="Flow (L/s)"
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-fg">Volume / Time</h3>
              <MiniLineChart
                series={volumeTimeSeries.map((s) => ({
                  label: s.testLabel,
                  points: (s.points || []).map((p) => ({ x: p.time, y: p.volume })),
                }))}
                xLabel="Time (s)"
                yLabel="Volume (L)"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}