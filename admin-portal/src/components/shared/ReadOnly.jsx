export default function ReadOnly({ label, value }) {
  return (
    <div>
      <p className="text-caption text-fg-muted mb-0.5">{label}</p>
      <p className="text-body font-medium text-fg truncate">{value || '—'}</p>
    </div>
  );
}
