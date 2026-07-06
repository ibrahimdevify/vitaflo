import { AlertTriangle, Bell, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export default function AlertsStats({
  total,
  unreadCount,
  readCount,
  pageCount,
}) {
  const stats = [
    {
      label: 'Total Alerts',
      value: total,
      icon: Bell,
      gradient: 'from-info to-info/70',
      wash: 'from-info/10',
    },
    {
      label: 'Unread',
      value: unreadCount,
      icon: AlertTriangle,
      gradient: 'from-danger to-danger/70',
      wash: 'from-danger/10',
    },
    {
      label: 'Read',
      value: readCount,
      icon: CheckCircle,
      gradient: 'from-success to-success/70',
      wash: 'from-success/10',
    },
    {
      label: 'This Page',
      value: pageCount,
      icon: Clock,
      gradient: 'from-brand-500 to-brand-700',
      wash: 'from-brand-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <Card key={i} className="relative overflow-hidden">
          <div
            className={`absolute inset-x-0 top-0 h-12 bg-linear-to-b ${s.wash} to-transparent pointer-events-none`}
          />
          <CardContent className="relative flex items-center gap-3 pt-4 pb-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius-control) bg-linear-to-br ${s.gradient}`}
            >
              <s.icon className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-caption text-fg-muted">{s.label}</p>
              <p className="text-subheading font-bold text-fg tabular-nums">
                {s.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
