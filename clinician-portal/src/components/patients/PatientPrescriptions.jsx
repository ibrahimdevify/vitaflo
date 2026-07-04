import { Badge } from '../../components/ui/badge';

export default function PatientPrescriptions({ prescriptions }) {
  if (!prescriptions?.length) return null;

  return (
    <div>
      <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-3">
        Prescriptions ({prescriptions.length})
      </h3>
      <div className="space-y-2">
        {prescriptions.map((p, i) => (
          <div key={i} className="bg-surface-raised rounded-card p-3 text-body">
            <p className="font-medium text-fg">{p.diagnosis}</p>
            {p.pharmacy_instruction && (
              <p className="text-fg-muted text-caption mt-0.5">
                {p.pharmacy_instruction}
              </p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {p.medicines?.map((m, j) => (
                <Badge key={j} variant="outline" className="text-caption">
                  {m.drug}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
