import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import MiniLineChart from './MiniLineChart';
import { formatDate, formatNumber } from './format';

const VARIABLES = ['FEV1', 'FVC', 'PEFR', 'FEF2575', 'FEV1/FVC'];

export default function AnalysisTab({ data, onRefetch }) {
  const [variable, setVariable] = useState(data?.variable || 'FEV1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Only reject a *mismatched* pair (one filled, one empty). Both empty is
  // valid — it means "no filter", which the backend treats as full history.
  const handleGo = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) return;
    onRefetch({ startDate: startDate || undefined, endDate: endDate || undefined, variable });
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onRefetch({ variable });
  };

  const hasActiveFilter = Boolean(data?.startDate && data?.endDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium text-fg">Variable</label>
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            className="h-9 rounded-(--radius-control) border border-border bg-surface px-3 text-sm"
          >
            {VARIABLES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
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
          Showing the patient's full history. Set a date range above to filter.
        </p>
      )}

      <div className="space-y-6">
        {/* Most Recent */}
        <div className="rounded-(--radius-card) border border-border bg-surface-raised px-5 py-4">
          <p className="text-sm text-fg-muted">
            Most Recent:{' '}
            <span className="font-medium text-fg">{data?.variable}</span>
          </p>

          <p className="mt-1 text-3xl font-semibold tracking-tight text-fg">
            {data?.mostRecent != null ? formatNumber(data.mostRecent) : 'N/A'}
          </p>
        </div>

        {/* Trend */}
        <div>
          {data?.trend?.length > 0 ? (
            <div className="min-w-0 overflow-hidden rounded-(--radius-card) border border-border p-3 sm:p-4">
              <MiniLineChart
                series={[
                  {
                    label: data.variable,
                    points: data.trend.map((t, i) => ({ x: i, y: t.value })),
                  },
                ]}
                xLabel="Session"
                yLabel={data.variable}
              />
            </div>
          ) : (
            <div className="rounded-(--radius-card) border border-border bg-surface-raised px-4 py-8 text-center">
              <p className="text-sm text-fg-muted">
                No data to display for selected timeframe
              </p>
            </div>
          )}
        </div>

        {/* Indoor Air Quality */}
        <div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-fg">
              Indoor Air Quality
            </h3>
          </div>

          {data?.indoorAirQuality?.length > 0 ? (
            <div className="overflow-hidden rounded-(--radius-card) border border-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-raised text-left">
                      <th className="px-4 py-3 font-medium text-fg-muted">
                        Date
                      </th>
                      <th className="px-4 py-3 font-medium text-fg-muted">
                        PM2.5
                      </th>
                      <th className="px-4 py-3 font-medium text-fg-muted">
                        PM10
                      </th>
                      <th className="px-4 py-3 font-medium text-fg-muted">
                        Temp
                      </th>
                      <th className="px-4 py-3 font-medium text-fg-muted">
                        Humidity
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.indoorAirQuality.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-border last:border-b-0 hover:bg-surface-raised/50"
                      >
                        <td className="px-4 py-3 text-fg">
                          {formatDate(row.date)}
                        </td>

                        <td className="px-4 py-3 text-fg">
                          {formatNumber(row.pm25)}
                        </td>

                        <td className="px-4 py-3 text-fg">
                          {formatNumber(row.pm10)}
                        </td>

                        <td className="px-4 py-3 text-fg">
                          {formatNumber(row.temperature)}
                        </td>

                        <td className="px-4 py-3 text-fg">
                          {formatNumber(row.humidity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-(--radius-card) border border-border bg-surface-raised px-4 py-6 text-center">
              <p className="text-sm text-fg-muted">
                No indoor air quality data for selected timeframe
              </p>
            </div>
          )}
        </div>

        {/* Schema Note */}
        <div className="border-t border-border pt-4">
          <p className="text-xs leading-5 text-fg-muted">
            Outdoor air quality, the clinical decision support flowchart,
            Session Grades, Lung Age, and Survey are not shown — none have a
            backing table in the schema yet.
          </p>
        </div>
      </div>
    </div>
  );
}