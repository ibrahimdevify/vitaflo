import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { formatDate, formatNumber } from './format';

const ROW_LABELS = [
  { key: 'FVC', label: 'FVC (L)' },
  { key: 'FEV1', label: 'FEV1 (L)' },
  { key: 'FEV1/FVC', label: 'FEV1/FVC' },
  { key: 'FEF2575', label: 'FEF25-75 (L/s)' },
  { key: 'PEFR', label: 'PEFR (L/s)' },
];

function SessionColumn({ title, session }) {
  const rowsByVariable = new Map(
    (session?.results || []).map((r) => [r.variable, r])
  );

  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-sm font-semibold text-fg">{title}</h3>
      {session ? (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-130 text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-raised text-left">
                  <th className="px-4 py-3 font-medium text-fg-muted">
                    Variable
                  </th>
                  <th className="px-4 py-3 font-medium text-fg-muted">Best</th>
                  <th className="px-4 py-3 font-medium text-fg-muted">
                    z-score
                  </th>
                  <th className="px-4 py-3 font-medium text-fg-muted">
                    % Pred
                  </th>
                </tr>
              </thead>

              <tbody>
                {ROW_LABELS.map(({ key, label }) => {
                  const row = rowsByVariable.get(key);

                  return (
                    <tr
                      key={key}
                      className="border-b border-border last:border-b-0 hover:bg-surface-raised/50"
                    >
                      <td className="px-4 py-3 font-medium text-fg">{label}</td>

                      <td className="px-4 py-3 text-fg">
                        {formatNumber(row?.observed)}
                      </td>

                      <td className="px-4 py-3 text-fg-muted">
                        {row?.zScore != null ? formatNumber(row.zScore) : 'N/A'}
                      </td>

                      <td className="px-4 py-3 text-fg-muted">
                        {row?.percentPredicted != null
                          ? formatNumber(row.percentPredicted)
                          : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-(--radius-card) border border-border bg-surface-raised px-4 py-8 text-center">
          <p className="text-sm text-fg-muted">Select a session</p>
        </div>
      )}

      {session && (
        <p className="mt-3 text-xs leading-5 text-fg-muted">
          Date: {formatDate(session.date)} · Post-bronchodilator:{' '}
          <span className="font-medium text-fg">
            {session.isPostBronchodilator ? 'Yes' : 'No'}
          </span>
        </p>
      )}
    </div>
  );
}

export default function SessionComparisonTab({ data, onRefetch }) {
  const [sessionId1, setSessionId1] = useState('');
  const [sessionId2, setSessionId2] = useState('');

  const handleCompare = () => {
    if (!sessionId1 || !sessionId2) return;
    onRefetch({ sessionId1, sessionId2 });
  };

  return (
    <div className="space-y-6">
      <p className="text-xs leading-5 text-fg-muted">
        Enter the two observation/session IDs to compare. A dropdown session
        picker needs a "list sessions for this patient" endpoint, which doesn't
        exist yet.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:flex-1">
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Session 1 ID
          </label>
          <Input
            placeholder="Enter Session 1 ID"
            type="number"
            min="1"
            value={sessionId1}
            onChange={(e) => setSessionId1(e.target.value)}
          />
        </div>

        <div className="w-full sm:flex-1">
          <label className="mb-1.5 block text-sm font-medium text-fg">
            Session 2 ID
          </label>
          <Input
            placeholder="Enter Session 2 ID"
            type="number"
            min="1"
            value={sessionId2}
            onChange={(e) => setSessionId2(e.target.value)}
          />
        </div>

        <Button onClick={handleCompare} className="w-full shrink-0 sm:w-auto">
          Compare
        </Button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SessionColumn title="Session 1" session={data?.session1} />

            <SessionColumn title="Session 2" session={data?.session2} />
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm text-fg-muted">
              Time between sessions:{' '}
              <span className="font-medium text-fg">
                {formatNumber(data?.timeBetweenSessionsHours, 1)} hours
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
