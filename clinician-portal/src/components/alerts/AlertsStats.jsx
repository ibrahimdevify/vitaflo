import { AlertTriangle, Bell, Filter, MailCheck } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
export default function AlertsStats({
  totalAlerts,
  unreadCount,
  readCount,
  page,
  totalPages,
}) {
  const stats = [
    {
      title: 'Total Alerts',
      value: totalAlerts,
      icon: Bell,
      gradient: 'from-brand-500 to-brand-700',
      wash: 'from-brand-500/10',
    },
    {
      title: 'Unread',
      value: unreadCount,
      icon: AlertTriangle,
      gradient: 'from-danger to-danger/70',
      wash: 'from-danger/10',
    },
    {
      title: 'Read',
      value: readCount,
      icon: MailCheck,
      gradient: 'from-success to-success/70',
      wash: 'from-success/10',
    },
    {
      title: 'Page',
      value: `${page}/${totalPages}`,
      icon: Filter,
      gradient: 'from-info to-info/70',
      wash: 'from-info/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="relative overflow-hidden">
          <div
            className={`absolute inset-x-0 top-0 h-20 bg-linear-to-b ${stat.wash} to-transparent pointer-events-none`}
          />
          <CardContent className="relative p-5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-(--radius-control) bg-linear-to-br ${stat.gradient} shrink-0`}
              >
                <stat.icon className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-caption text-fg-muted">{stat.title}</p>
                <p className="text-subheading font-semibold text-fg tabular-nums leading-tight">
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
