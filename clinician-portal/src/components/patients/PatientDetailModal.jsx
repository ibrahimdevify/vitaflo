import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import PatientInfo from './PatientInfo';
import PatientPrescriptions from './PatientPrescriptions';
import SpirometryChart from './SpirometryChart';

export default function PatientDetailModal({
  open,
  onClose,
  patient,
  spirometryData,
  loading,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed h-screen inset-0 z-(--z-modal) flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-card shadow-modal w-full max-w-4xl max-h-[85vh] overflow-auto m-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface rounded-t-card z-10">
          <h2 className="text-subheading font-bold text-fg">
            {loading ? (
              <Skeleton className="h-6 w-48 rounded-(--radius-control)" />
            ) : (
              `${patient?.f_name || ''} ${patient?.l_name || ''}`
            )}
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Skeleton className="h-3 w-20 rounded-(--radius-control)" />
                  {[...Array(5)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-4 w-full rounded-(--radius-control)"
                    />
                  ))}
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-3 w-20 rounded-(--radius-control)" />
                  {[...Array(4)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-4 w-full rounded-(--radius-control)"
                    />
                  ))}
                </div>
              </div>
              <Skeleton className="h-62.5 w-full rounded-card" />
              <Skeleton className="h-32 w-full rounded-card" />
            </div>
          ) : patient ? (
            <div className="space-y-8">
              <PatientInfo patient={patient} />
              <SpirometryChart data={spirometryData} />
              <PatientPrescriptions
                prescriptions={patient.prescriptions_patient}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
