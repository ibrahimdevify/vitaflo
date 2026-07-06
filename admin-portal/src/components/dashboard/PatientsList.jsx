import { Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const avatarTones = ['brand', 'info', 'success', 'warning', 'danger'];
const toneGradients = {
  brand: 'from-brand-500 to-brand-700',
  info: 'from-info to-info/70',
  success: 'from-success to-success/70',
  warning: 'from-warning to-warning/70',
  danger: 'from-danger to-danger/70',
};

export default function PatientsList({ patients, isAdmin }) {
  const getInitials = (f, l) => `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
        <CardTitle className="text-subheading font-semibold flex items-center gap-2.5 text-fg">
          <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
            <Users className="h-3.5 w-3.5 text-white" />
          </div>
          {isAdmin ? 'Recent Registrations' : 'My Patients'}
          <Badge variant="info">{patients?.length || 0}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {patients?.length > 0 ? (
          <div className="space-y-2">
            {patients.map((p, i) => {
              const tone = avatarTones[i % avatarTones.length];
              const gradient = toneGradients[tone];
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 hover:bg-surface-raised rounded-card transition-colors border border-border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-caption font-semibold text-white bg-linear-to-br ${gradient}`}
                    >
                      {getInitials(p.f_name, p.l_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-fg text-body truncate">
                        {p.f_name} {p.l_name}
                      </p>
                      <p className="text-caption text-fg-muted truncate">
                        {p.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {p.patient_details ? (
                      <Badge
                        variant={
                          p.patient_details?.status === 'active'
                            ? 'success'
                            : p.patient_details?.status === 'unverified'
                              ? 'warning'
                              : 'secondary'
                        }
                        className="capitalize"
                      >
                        {p.patient_details.status}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="capitalize">
                        {p.ut_id_fk === 3
                          ? 'Clinician'
                          : p.ut_id_fk === 4
                            ? 'Patient'
                            : 'User'}
                      </Badge>
                    )}
                    {p.reg_date && (
                      <p className="text-caption text-fg-muted mt-1">
                        {new Date(p.reg_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-12 w-12 rounded-pill bg-surface-raised flex items-center justify-center mb-3">
              <Users className="h-5 w-5 text-fg-muted" />
            </div>
            <p className="text-body font-medium text-fg">No patients yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
