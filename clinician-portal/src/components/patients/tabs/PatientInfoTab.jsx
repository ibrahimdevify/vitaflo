import { formatDate } from "./format";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-border py-2 last:border-b-0">
      <span className="text-sm font-medium text-fg">{label}</span>
      <span className="text-sm text-fg-muted">{value ?? "—"}</span>
    </div>
  );
}

export default function PatientInfoTab({ data }) {
  if (!data) return <p className="text-sm text-fg-muted">No patient info available.</p>;

  return (
    <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
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
        <InfoRow label="Smoking" value={data.smoking === null ? null : data.smoking ? "True" : "False"} />
        <InfoRow label="Ethnicity / Race" value={data.ethnicity} />
        <InfoRow label="Start Date" value={formatDate(data.startDate)} />
      </div>
      <div className="mt-2 md:col-span-2">
        <InfoRow label="Address" value={data.address} />
        <InfoRow label="Phone" value={data.phone} />
        <InfoRow label="Email" value={data.email} />
        <InfoRow
          label="Medications"
          value={data.medications && data.medications.length > 0 ? data.medications.join(", ") : "None"}
        />
        <InfoRow label="Status" value={data.status} />
      </div>
    </div>
  );
}