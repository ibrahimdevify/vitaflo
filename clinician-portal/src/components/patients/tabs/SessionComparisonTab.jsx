import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { formatDate, formatNumber } from "./format";

const ROW_LABELS = [
  { key: "FVC", label: "FVC (L)" },
  { key: "FEV1", label: "FEV1 (L)" },
  { key: "FEV1/FVC", label: "FEV1/FVC" },
  { key: "FEF2575", label: "FEF25-75 (L/s)" },
  { key: "PEFR", label: "PEFR (L/s)" },
];

function SessionColumn({ title, session }) {
  const rowsByVariable = new Map((session?.results || []).map((r) => [r.variable, r]));

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-fg">{title}</h3>
      {session ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-fg-muted">
              <th className="py-2 pr-4">Variable</th>
              <th className="py-2 pr-4">Best</th>
              <th className="py-2 pr-4">z-score</th>
              <th className="py-2 pr-4">% Pred</th>
            </tr>
          </thead>
          <tbody>
            {ROW_LABELS.map(({ key, label }) => {
              const row = rowsByVariable.get(key);
              return (
                <tr key={key} className="border-b border-border last:border-b-0">
                  <td className="py-2 pr-4 font-medium text-fg">{label}</td>
                  <td className="py-2 pr-4">{formatNumber(row?.observed)}</td>
                  <td className="py-2 pr-4">{row?.zScore != null ? formatNumber(row.zScore) : "N/A"}</td>
                  <td className="py-2 pr-4">{row?.percentPredicted != null ? formatNumber(row.percentPredicted) : "N/A"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-fg-muted">Select a session</p>
      )}
      {session && (
        <p className="mt-2 text-xs text-fg-muted">
          Date: {formatDate(session.date)} · Post-bronchodilator: {session.isPostBronchodilator ? "Yes" : "No"}
        </p>
      )}
    </div>
  );
}

export default function SessionComparisonTab({ data, onRefetch }) {
  const [sessionId1, setSessionId1] = useState("");
  const [sessionId2, setSessionId2] = useState("");

  const handleCompare = () => {
    if (!sessionId1 || !sessionId2) return;
    onRefetch({ sessionId1, sessionId2 });
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-fg-muted">
        Enter the two observation/session IDs to compare. A dropdown session picker needs a "list sessions
        for this patient" endpoint, which doesn't exist yet.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-fg">Session 1 ID</label>
          <Input type="number" min="1" value={sessionId1} onChange={(e) => setSessionId1(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-fg">Session 2 ID</label>
          <Input type="number" min="1" value={sessionId2} onChange={(e) => setSessionId2(e.target.value)} />
        </div>
        <Button onClick={handleCompare}>Compare</Button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <SessionColumn title="Session 1" session={data.session1} />
            <SessionColumn title="Session 2" session={data.session2} />
          </div>
          <p className="text-sm text-fg-muted">
            Time between sessions: {formatNumber(data.timeBetweenSessionsHours, 1)} hours
          </p>
        </>
      )}
    </div>
  );
}