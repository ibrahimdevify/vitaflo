import { ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PatientForm from '../components/patients/PatientForm';
import { Button } from '../components/ui/button';

export default function AddPatient() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate back to patients list after successful creation
    navigate('/patients');
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center">
        <div className="flex sm:flex-row flex-col sm:items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
            className="h-9 w-9 shrink-0 border-border"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="flex items-center gap-2 text-heading font-semibold tracking-tight text-fg">
              <div className="flex h-7 w-7 items-center justify-center rounded-(--radius-control) bg-linear-to-br from-brand-500 to-brand-700">
                <UserPlus className="h-3.5 w-3.5 text-white" />
              </div>
              Add New Patient
            </h1>

            <p className="mt-0.5 text-caption text-fg-muted">
              Create a new patient record
            </p>
          </div>
        </div>
      </div>
      {/* Patient Form - Full Width */}
      <PatientForm onCancel={handleCancel} onSuccess={handleSuccess} />
    </div>
  );
}
