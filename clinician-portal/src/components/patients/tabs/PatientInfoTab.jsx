import formatDate from './format';

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(110px,0.8fr)_minmax(0,1.2fr)] items-start gap-4 border-b border-border py-3 last:border-b-0 sm:grid-cols-[140px_minmax(0,1fr)] lg:grid-cols-[150px_minmax(0,1fr)]">
      <span className="text-sm font-medium text-fg">{label}</span>

      <span className="min-w-0 break-words text-right text-sm text-fg-muted">
        {value ?? '—'}
      </span>
    </div>
  );
}

export default function PatientInfoTab({ data }) {
  if (!data)
    return <p className="text-sm text-fg-muted">No patient info available.</p>;

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
      <div>
        <InfoRow label="Name" value={data.name} />
        <InfoRow label="Username" value={data.username} />
        <InfoRow label="Sex at Birth" value={data.sexAtBirth} />
        <InfoRow label="Birth Date" value={formatDate(data.dob)} />
        <InfoRow label="Age" value={data.age} />
      </div>

      <div>
        <InfoRow label="Height" value={data.height} />
        <InfoRow label="Weight" value={data.weight} />
        <InfoRow
          label="Smoking"
          value={data.smoking === null ? null : data.smoking ? 'True' : 'False'}
        />
        <InfoRow label="Ethnicity / Race" value={data.ethnicity} />
        <InfoRow label="Start Date" value={formatDate(data.startDate)} />
      </div>

      <div className="border-t border-border pt-4 lg:col-span-2">
        <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">
          <div>
            <InfoRow label="Address" value={data.address} />
            <InfoRow label="Phone" value={data.phone} />
            <InfoRow label="Email" value={data.email} />
          </div>

          <div>
            <InfoRow
              label="Medications"
              value={
                data.medications && data.medications.length > 0
                  ? data.medications.join(', ')
                  : 'None'
              }
            />
            <InfoRow label="Status" value={data.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
