import { ArrowLeft, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PatientForm from "../components/patients/PatientForm";
import { Button } from "../components/ui/button";

export default function AddPatient() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate back to patients list after successful creation
    navigate("/patients");
  };

  const handleCancel = () => {
    navigate("/patients");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
            className="h-9 w-9 border-border"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-heading font-bold text-fg tracking-tight flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-brand-600" />
              Add New Patient
            </h1>
            <p className="text-caption text-fg-muted mt-1">
              Create a new patient record
            </p>
          </div>
        </div>
      </div>

      {/* Patient Form - Full Width */}
      <PatientForm
        onCancel={handleCancel}
        onSuccess={handleSuccess}
      />
    </div>
  );
}