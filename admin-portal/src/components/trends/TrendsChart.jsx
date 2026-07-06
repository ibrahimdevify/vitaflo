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

export default function TrendsChart({
  data,
  lines,
  height = 380,
  xAxisAngle = -45,
}) {
  if (!data?.length) return null;

  return (
    <div className="bg-surface-raised rounded-card p-4" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }}
            angle={xAxisAngle}
            textAnchor="end"
            height={xAxisAngle ? 70 : 30}
          />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-fg-muted)' }} />
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
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              name={line.name}
              strokeWidth={2.5}
              dot={{ r: 2 }}
              connectNulls={false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
