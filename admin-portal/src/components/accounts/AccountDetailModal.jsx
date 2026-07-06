import { Building2, Check, X, X as XIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

const featureLabels = [
  { key: 'breezometer', label: 'Breezometer' },
  { key: 'awair', label: 'Awair' },
  {
    key: 'bronchodilator_responsiveness_testing',
    label: 'Bronchodilator Test',
  },
  {
    key: 'clinical_decision_support_flowchart',
    label: 'Clinical Decision Support',
  },
];

export default function AccountDetailModal({
  open,
  onClose,
  account,
  loading,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-(--z-modal) min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-card shadow-modal w-full max-w-2xl max-h-[80vh] overflow-auto m-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface rounded-t-card z-10">
          <h2 className="text-subheading font-bold text-fg flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-info to-info/70">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            {account?.name || 'Account'} Details
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full rounded-card" />
                <Skeleton className="h-20 w-full rounded-card" />
              </div>
              <Skeleton className="h-32 w-full rounded-card" />
            </div>
          ) : account ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-2">
                    Stats
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-info/5 rounded-card p-3">
                      <p className="text-subheading font-bold text-info tabular-nums">
                        {account.stats?.total_patients || 0}
                      </p>
                      <p className="text-caption text-info/70">
                        Total Patients
                      </p>
                    </div>
                    <div className="bg-success/5 rounded-card p-3">
                      <p className="text-subheading font-bold text-success tabular-nums">
                        {account.stats?.total_clinicians || 0}
                      </p>
                      <p className="text-caption text-success/70">
                        Total Clinicians
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-2">
                    Features
                  </h3>
                  <div className="space-y-2">
                    {account.account_attributes ? (
                      featureLabels.map((f) => (
                        <div
                          key={f.key}
                          className="flex items-center gap-2 text-body"
                        >
                          {account.account_attributes[f.key] ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <XIcon className="h-4 w-4 text-danger" />
                          )}
                          <span className="text-fg">{f.label}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-body text-fg-muted">
                        No attributes set
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {account.patient_groups?.length > 0 && (
                <div>
                  <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-2">
                    Patient Groups ({account.patient_groups.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {account.patient_groups.map((g) => (
                      <Badge key={g.id} variant="outline">
                        {g.name} ({g._count?.patients || 0})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {account.doctor_details?.length > 0 && (
                <div>
                  <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-2">
                    Clinicians ({account.doctor_details.length})
                  </h3>
                  <div className="space-y-2">
                    {account.doctor_details.map((d) => (
                      <div
                        key={d.user_id_fk}
                        className="flex items-center gap-3 text-body"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-caption font-semibold text-brand-600">
                          {d.user?.f_name?.[0]}
                        </div>
                        <span className="text-fg">
                          {d.user?.f_name} {d.user?.l_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
