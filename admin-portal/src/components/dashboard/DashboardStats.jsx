import { Card, CardContent } from '../ui/card';

export default function DashboardStats({ cards }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((stat, i) => (
        <Card key={i} className="relative overflow-hidden">
          <div
            className={`absolute inset-x-0 top-0 h-16 bg-linear-to-b ${stat.wash} to-transparent pointer-events-none`}
          />
          <CardContent className="relative flex items-center gap-3 pt-4 pb-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius-control) bg-linear-to-br ${stat.gradient}`}
            >
              <stat.icon className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-caption text-fg-muted">{stat.title}</p>
              <p className="text-subheading font-bold text-fg tabular-nums leading-tight">
                {stat.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
