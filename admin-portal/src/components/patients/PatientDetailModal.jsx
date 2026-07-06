import { Mail, Phone, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export default function PatientDetailModal({
  open,
  onClose,
  patient,
  loading,
}) {
  if (!open) return null;

  const details = patient?.patient_details || {};

  return (
    <div
      className="fixed inset-0 z-(--z-modal) min-h-screen min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-card shadow-modal w-full max-w-3xl max-h-[80vh] overflow-auto m-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface rounded-t-card z-10">
          <h2 className="text-subheading font-bold text-fg">Patient Details</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40 rounded-(--radius-control)" />
                  <Skeleton className="h-3 w-56 rounded-(--radius-control)" />
                </div>
              </div>
              <Skeleton className="h-32 w-full rounded-card" />
            </div>
          ) : patient ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 text-subheading font-bold text-brand-600">
                  {patient.f_name?.[0]}
                  {patient.l_name?.[0]}
                </div>
                <div>
                  <h2 className="text-subheading font-bold text-fg">
                    {patient.f_name} {patient.l_name}
                  </h2>
                  <div className="flex gap-4 text-caption text-fg-muted mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {patient.email || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {patient.phone || 'N/A'}
                    </span>
                  </div>
                  <Badge
                    variant={
                      details.status === 'active' ? 'success' : 'warning'
                    }
                    className="mt-2 capitalize"
                  >
                    {details.status || 'unknown'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-2">
                    Medical Info
                  </h3>
                  <div className="space-y-1 text-body">
                    <p>
                      <span className="text-fg-muted">Chart No:</span>{' '}
                      <span className="text-fg">
                        {details.chart_no || 'N/A'}
                      </span>
                    </p>
                    <p>
                      <span className="text-fg-muted">Blood:</span>{' '}
                      <span className="text-fg">
                        {details.blood_group || 'N/A'}
                      </span>
                    </p>
                    <p>
                      <span className="text-fg-muted">RPM:</span>{' '}
                      <span className="text-fg">
                        {details.rpm_consent ? 'Yes' : 'No'}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-2">
                    Group & Clinician
                  </h3>
                  <div className="space-y-1 text-body">
                    <p>
                      <span className="text-fg-muted">Group:</span>{' '}
                      <span className="text-fg">
                        {details.patient_group?.name || 'N/A'}
                      </span>
                    </p>
                    <p>
                      <span className="text-fg-muted">Clinician:</span>{' '}
                      <span className="text-fg">
                        {details.assigned_clinician?.f_name || 'Not assigned'}
                      </span>
                    </p>
                    <p>
                      <span className="text-fg-muted">Joined:</span>{' '}
                      <span className="text-fg">
                        {new Date(patient.reg_date).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              {details.attributes && (
                <div>
                  <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-2">
                    Attributes
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-body">
                    <p>
                      <span className="text-fg-muted">DOB:</span>{' '}
                      <span className="text-fg">
                        {details.attributes.dob || 'N/A'}
                      </span>
                    </p>
                    <p>
                      <span className="text-fg-muted">Gender:</span>{' '}
                      <span className="text-fg">
                        {details.attributes.gender || 'N/A'}
                      </span>
                    </p>
                    <p>
                      <span className="text-fg-muted">Height:</span>{' '}
                      <span className="text-fg">
                        {details.attributes.height
                          ? `${details.attributes.height}cm`
                          : 'N/A'}
                      </span>
                    </p>
                    <p>
                      <span className="text-fg-muted">Weight:</span>{' '}
                      <span className="text-fg">
                        {details.attributes.weight
                          ? `${details.attributes.weight}kg`
                          : 'N/A'}
                      </span>
                    </p>
                    <p>
                      <span className="text-fg-muted">Smoking:</span>{' '}
                      <span className="text-fg">
                        {details.attributes.smoking ? 'Yes' : 'No'}
                      </span>
                    </p>
                  </div>
                </div>
              )}
              {patient.prescriptions_patient?.length > 0 && (
                <div>
                  <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-2">
                    Prescriptions ({patient.prescriptions_patient.length})
                  </h3>
                  <div className="space-y-2">
                    {patient.prescriptions_patient.map((p, i) => (
                      <div
                        key={i}
                        className="bg-surface-raised rounded-card p-3 text-body"
                      >
                        <p className="font-medium text-fg">{p.diagnosis}</p>
                        <p className="text-fg-muted text-caption">
                          {p.pharmacy_instruction}
                        </p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {p.medicines?.map((m, j) => (
                            <Badge
                              key={j}
                              variant="outline"
                              className="text-caption"
                            >
                              {m.drug} {m.dosage}
                            </Badge>
                          ))}
                        </div>
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
