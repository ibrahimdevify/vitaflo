import { Card, CardContent } from '../../components/ui/card';
import { toneClasses } from './dashboard';

export default function StatCards({ cards }) {
  if (!cards?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => {
        const tone = toneClasses[card.tone];
        return (
          <Card key={i} className="relative overflow-hidden">
            <div
              className={`absolute inset-x-0 top-0 h-20 bg-linear-to-b ${tone.wash} to-transparent pointer-events-none`}
            />
            <CardContent className="relative p-5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-(--radius-control) bg-linear-to-br ${tone.gradient} shrink-0`}
                >
                  <card.icon className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-caption text-fg-muted">{card.title}</p>
                  <p className="text-subheading font-semibold text-fg tabular-nums leading-tight">
                    {card.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
