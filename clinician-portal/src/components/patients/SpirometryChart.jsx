import { Activity } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function SpirometryChart({ data }) {
  if (!data?.length) return null;

  return (
    <div>
      <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4" /> Spirometry Trends
      </h3>
      <div
        className="bg-surface-raised rounded-card p-4"
        style={{ height: 250 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--color-fg-muted)' }}
            />
            <YAxis tick={{ fontSize: 10, fill: 'var(--color-fg-muted)' }} />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                fontSize: '12px',
                color: 'var(--color-fg)',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="fev1"
              stroke="var(--color-brand-500)"
              name="FEV1"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="fvc"
              stroke="var(--color-accent-500)"
              name="FVC"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
