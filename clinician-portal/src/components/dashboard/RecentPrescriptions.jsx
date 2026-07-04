import { ArrowUpRight, FileText, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import EmptyState from '../shared/EmptyState';
import { avatarTones, toneClasses } from './dashboard';

export default function RecentPrescriptions({ prescriptions }) {
  return (
    <Card className="lg:col-span-2 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
          </div>
          Recent Prescriptions
        </CardTitle>
        <Link
          to="/prescriptions"
          className="text-caption font-medium text-fg-muted hover:text-brand-600 flex items-center gap-0.5 transition-colors"
        >
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="pt-3">
        {prescriptions?.length > 0 ? (
          <div className="divide-y divide-border">
            {prescriptions.slice(0, 5).map((p, i) => {
              const tone = toneClasses[avatarTones[i % avatarTones.length]];
              return (
                <div
                  key={p.pr_id ?? i}
                  className="flex justify-between gap-3 px-1 py-3.5 hover:bg-surface-raised transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-pill text-body font-semibold text-white bg-linear-to-br ${tone.gradient}`}
                    >
                      {p.patient?.f_name?.[0]}
                      {p.patient?.l_name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-fg text-body truncate">
                        {p.patient?.f_name} {p.patient?.l_name}
                      </p>
                      <p className="text-caption text-fg-muted truncate">
                        {p.diagnosis}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.medicines?.slice(0, 3).map((m, j) => (
                      <Badge key={m.pm_id ?? j} variant="outline">
                        {m.drug}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No recent prescriptions"
            description="New prescriptions will appear here"
          />
        )}
      </CardContent>
    </Card>
  );
}
