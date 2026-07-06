import { Card, CardContent } from '../ui/card';

export default function TrendsStats({ stats }) {
  if (!stats) return null;

  const items = [
    {
      label: 'Latest FEV1',
      value: stats.latest?.fev1?.toFixed(2),
      unit: 'L',
      gradient: 'from-info to-info/70',
      wash: 'from-info/10',
    },
    {
      label: 'Latest FVC',
      value: stats.latest?.fvc?.toFixed(2),
      unit: 'L',
      gradient: 'from-success to-success/70',
      wash: 'from-success/10',
    },
    {
      label: 'Best FEV1',
      value: stats.bestFev1?.toFixed(2),
      unit: 'L',
      gradient: 'from-brand-500 to-brand-700',
      wash: 'from-brand-500/10',
    },
    {
      label: 'Best FVC',
      value: stats.bestFvc?.toFixed(2),
      unit: 'L',
      gradient: 'from-warning to-warning/70',
      wash: 'from-warning/10',
    },
    {
      label: 'Best PEFR',
      value: stats.bestPefr?.toFixed(0),
      unit: 'L/s',
      gradient: 'from-danger to-danger/70',
      wash: 'from-danger/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {items.map((s, i) => (
        <Card key={i} className="relative overflow-hidden">
          <div
            className={`absolute inset-x-0 top-0 h-12 bg-linear-to-b ${s.wash} to-transparent pointer-events-none`}
          />
          <CardContent className="relative pt-3 pb-3 text-center">
            <p className="text-caption text-fg-muted">{s.label}</p>
            <p className="text-subheading font-bold text-fg tabular-nums">
              {s.value || '—'}{' '}
              <span className="text-caption text-fg-muted font-normal">
                {s.unit}
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
