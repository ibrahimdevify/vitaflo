import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import MiniLineChart from "./MiniLineChart";
import { formatDate, formatNumber } from "./format";

const VARIABLES = ["FEV1", "FVC", "PEFR", "FEF2575", "FEV1/FVC"];

export default function AnalysisTab({ data, onRefetch }) {
  const [variable, setVariable] = useState(data?.variable || "FEV1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleGo = () => {
    if (!startDate || !endDate) return;
    onRefetch({ startDate, endDate, variable });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
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

      <div className="text-center">
        <p className="mb-1 text-sm text-fg-muted">Most Recent: {data?.variable}</p>
        <p className="text-3xl font-bold text-fg">
          {data?.mostRecent != null ? formatNumber(data.mostRecent) : "N/A"}
        </p>
      </div>

      {data?.trend?.length > 0 ? (
        <MiniLineChart
          series={[{ label: data.variable, points: data.trend.map((t, i) => ({ x: i, y: t.value })) }]}
          xLabel="Session"
          yLabel={data.variable}
        />
      ) : (
        <p className="text-sm text-fg-muted">No data to display for selected timeframe</p>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-fg">Indoor Air Quality</h3>
        {data?.indoorAirQuality?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-fg-muted">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">PM2.5</th>
                  <th className="py-2 pr-4">PM10</th>
                  <th className="py-2 pr-4">Temp</th>
                  <th className="py-2 pr-4">Humidity</th>
                </tr>
              </thead>
              <tbody>
                {data.indoorAirQuality.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="py-2 pr-4">{formatDate(row.date)}</td>
                    <td className="py-2 pr-4">{formatNumber(row.pm25)}</td>
                    <td className="py-2 pr-4">{formatNumber(row.pm10)}</td>
                    <td className="py-2 pr-4">{formatNumber(row.temperature)}</td>
                    <td className="py-2 pr-4">{formatNumber(row.humidity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-fg-muted">No indoor air quality data for selected timeframe</p>
        )}
      </div>

      <p className="text-xs text-fg-muted">
        Outdoor air quality, the clinical decision support flowchart, Session Grades, Lung Age, and Survey
        are not shown — none have a backing table in the schema yet.
      </p>
    </div>
  );
}