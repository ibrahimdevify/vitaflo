import { Badge } from '../../components/ui/badge';

export default function PatientInfo({ patient }) {
  const details = patient?.patient_details || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-3">
          Patient Info
        </h3>
        <div className="space-y-2 text-body">
          <InfoRow label="Email" value={patient?.email} />
          <InfoRow label="Phone" value={patient?.phone} />
          <InfoRow label="Chart" value={details.chart_no} />
          <InfoRow label="Blood" value={details.blood_group} />
          <Badge
            variant={details.status === 'active' ? 'success' : 'warning'}
            className="mt-2 capitalize"
          >
            {details.status || 'unknown'}
          </Badge>
        </div>
      </div>
      <div>
        <h3 className="text-caption font-semibold text-fg-muted uppercase tracking-wide mb-3">
          Attributes
        </h3>
        <div className="space-y-2 text-body">
          <InfoRow label="DOB" value={details.attributes?.dob} />
          <InfoRow label="Gender" value={details.attributes?.gender} />
          <InfoRow
            label="Height"
            value={
              details.attributes?.height
                ? `${details.attributes.height}cm`
                : null
            }
          />
          <InfoRow
            label="Weight"
            value={
              details.attributes?.weight
                ? `${details.attributes.weight}kg`
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <p>
      <span className="text-fg-muted">{label}:</span>{' '}
      <span className="text-fg font-medium">{value || 'N/A'}</span>
    </p>
  );
}
