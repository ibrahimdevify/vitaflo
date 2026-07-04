import { ArrowUpRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { avatarTones, toneClasses } from './dashboard';

export default function MyPatients({ patients }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
            <Users className="h-3.5 w-3.5 text-white" />
          </div>
          My Patients
        </CardTitle>
        <Link
          to="/patients"
          className="text-caption font-medium text-fg-muted hover:text-brand-600 flex items-center gap-0.5 transition-colors"
        >
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="pt-3">
        {patients?.length > 0 ? (
          <div className="divide-y divide-border">
            {patients.slice(0, 5).map((pt, i) => {
              const tone = toneClasses[avatarTones[i % avatarTones.length]];
              const isActive = pt.patient_details?.status === 'active';
              return (
                <Link
                  key={pt.user_id}
                  to="/patients"
                  className="flex items-center gap-3 px-1 py-3 hover:bg-surface-raised transition-colors -mx-1"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-caption font-semibold text-white bg-linear-to-br ${tone.gradient}`}
                  >
                    {pt.f_name?.[0]}
                    {pt.l_name?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-fg text-body truncate">
                      {pt.f_name} {pt.l_name}
                    </p>
                    <p className="text-caption text-fg-muted truncate">
                      Chart #{pt.patient_details?.chart_no}
                    </p>
                  </div>
                  <Badge
                    variant={isActive ? 'success' : 'secondary'}
                    className="capitalize"
                  >
                    {pt.patient_details?.status}
                  </Badge>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-body text-fg-muted text-center py-8">
            No patients yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
