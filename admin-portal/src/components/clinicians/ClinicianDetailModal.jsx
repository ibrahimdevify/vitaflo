import { Mail, Phone, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export default function ClinicianDetailModal({
  open,
  onClose,
  clinician,
  loading,
}) {
  if (!open) return null;

  const details = clinician?.doctor_details || {};

  return (
    <div
      className="fixed inset-0 z-(--z-modal) min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-card shadow-modal w-full max-w-3xl max-h-[80vh] overflow-auto m-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface rounded-t-card z-10">
          <h2 className="text-subheading font-bold text-fg">
            Clinician Details
          </h2>
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
          ) : clinician ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 text-subheading font-bold text-brand-600">
                  {clinician.f_name?.[0]}
                  {clinician.l_name?.[0]}
                </div>
                <div>
                  <h2 className="text-subheading font-bold text-fg">
                    {clinician.f_name} {clinician.l_name}
                  </h2>
                  <div className="flex gap-4 text-caption text-fg-muted mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {clinician.email || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {clinician.phone || 'N/A'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {details.is_specialist && (
                      <Badge variant="brand">Specialist</Badge>
                    )}
                    <Badge
                      variant={clinician.is_availible ? 'success' : 'danger'}
                    >
                      {clinician.is_availible ? 'Available' : 'Offline'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-2">
                    Professional Info
                  </h3>
                  <div className="space-y-1 text-body">
                    <p>
                      <span className="text-fg-muted">License:</span>{' '}
                      <span className="text-fg">
                        {details.license_no || 'N/A'}
                      </span>
                    </p>
                    <p>
                      <span className="text-fg-muted">Experience:</span>{' '}
                      <span className="text-fg">
                        {details.experience || 'N/A'}
                      </span>
                    </p>
                    <p>
                      <span className="text-fg-muted">Education:</span>{' '}
                      <span className="text-fg">
                        {details.education || 'N/A'}
                      </span>
                    </p>
                    <p>
                      <span className="text-fg-muted">Hospital:</span>{' '}
                      <span className="text-fg">
                        {details.hospital?.name || 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-2">
                    About
                  </h3>
                  <p className="text-body text-fg-muted">
                    {details.about_doctor || 'No description'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-2">
                  Assigned Patients ({clinician.stats?.total_patients || 0})
                </h3>
                {clinician.data?.assigned_patients?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {clinician.data.assigned_patients.map((p, i) => (
                      <div
                        key={i}
                        className="bg-surface-raised rounded-card p-3 text-body flex items-center gap-3"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-info/10 text-caption font-semibold text-info">
                          {p.user?.f_name?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-fg truncate">
                            {p.user?.f_name} {p.user?.l_name}
                          </p>
                          <p className="text-caption text-fg-muted">
                            Chart: {p.chart_no} | {p.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-body text-fg-muted">
                    No patients assigned
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
