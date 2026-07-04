import { Card, CardContent } from '../../components/ui/card';

const statsConfig = [
  {
    key: 'totalTests',
    title: 'Total Tests',
    gradient: 'from-brand-500 to-brand-700',
    wash: 'from-brand-500/10',
    format: (v) => v,
    suffix: '',
  },
  {
    key: 'bestFEV1',
    title: 'Best FEV1',
    gradient: 'from-info to-info/70',
    wash: 'from-info/10',
    format: (v) => (v ? v.toFixed(2) : '—'),
    suffix: 'L',
  },
  {
    key: 'bestFVC',
    title: 'Best FVC',
    gradient: 'from-success to-success/70',
    wash: 'from-success/10',
    format: (v) => (v ? v.toFixed(2) : '—'),
    suffix: 'L',
  },
  {
    key: 'bestPEFR',
    title: 'Best PEFR',
    gradient: 'from-warning to-warning/70',
    wash: 'from-warning/10',
    format: (v) => (v ? v.toFixed(0) : '—'),
    suffix: 'L/s',
  },
];

export default function SpirometryStats({
  totalTests,
  bestFEV1,
  bestFVC,
  bestPEFR,
}) {
  const values = { totalTests, bestFEV1, bestFVC, bestPEFR };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsConfig.map((stat, i) => (
        <Card key={i} className="relative overflow-hidden">
          <div
            className={`absolute inset-x-0 top-0 h-16 bg-linear-to-b ${stat.wash} to-transparent pointer-events-none`}
          />
          <CardContent className="relative p-4">
            <p className="text-caption text-fg-muted">{stat.title}</p>
            <p className="text-subheading font-bold text-fg tabular-nums mt-1">
              {stat.format(values[stat.key])}
              {values[stat.key] !== '—' && stat.suffix && (
                <span className="text-caption text-fg-muted ml-1">
                  {stat.suffix}
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
