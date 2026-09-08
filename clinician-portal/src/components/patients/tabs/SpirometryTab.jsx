import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import MiniLineChart from './MiniLineChart';
import { formatNumber } from './format';

const ROW_LABELS = [
  { key: 'FEV1', label: 'FEV1 (L)' },
  { key: 'FVC', label: 'FVC (L)' },
  { key: 'FEV1/FVC', label: 'FEV1/FVC' },
  { key: 'FEF2575', label: 'FEF25-75 (L/s)' },
  { key: 'FEV6', label: 'FEV6 (L)' },
  { key: 'PEFR', label: 'PEFR (L/s)' },
];

export default function SpirometryTab({ data, onRefetch }) {
  const [date, setDate] = useState(
    data?.date || new Date().toISOString().slice(0, 10)
  );

  const handleView = () => onRefetch({ date });

  const rowsByVariable = new Map(
    (data?.bestResults || []).map((r) => [r.variable, r])
  );

  const flowVolumeSeries = data?.flowVolumeSeries || [];
  const volumeTimeSeries = data?.volumeTimeSeries || [];

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="flex flex-col w-full gap-3 sm:flex-row sm:items-end">
        <div className="flex-3 space-y-1.5">
          <label className="text-sm font-medium text-fg">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <Button onClick={handleView} className="w-full sm:w-auto py-2 flex-1">
          View
        </Button>
      </div>

      {!data || data.testsCount === 0 ? (
        <div className="rounded-(--radius-card) border border-border bg-surface-raised px-4 py-8 text-center">
          <p className="text-sm text-fg-muted">
            No spirometry tests recorded for this date.
          </p>
        </div>
      ) : (
        <>
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
                    const row = rowsByVariable.get(key);

                    return (
                      <tr
                        key={key}
                        className="border-b border-border last:border-b-0 hover:bg-surface-raised/50"
                      >
                        <td className="px-4 py-3 font-medium text-fg">
                          {label}
                        </td>

                        <td className="px-4 py-3 text-fg">
                          {formatNumber(row?.observed)}
                        </td>

                        <td className="px-4 py-3 text-fg-muted">
                          {row?.lln != null ? formatNumber(row.lln) : 'N/A'}
                        </td>

                        <td className="px-4 py-3 text-fg-muted">
                          {row?.zScore != null
                            ? formatNumber(row.zScore)
                            : 'N/A'}
                        </td>

                        <td className="px-4 py-3 text-fg-muted">
                          {row?.predicted != null
                            ? formatNumber(row.predicted)
                            : 'N/A'}
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
        </>
      )}
    </div>
  );
}
