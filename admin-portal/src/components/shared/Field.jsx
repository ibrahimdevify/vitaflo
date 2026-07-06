export default function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-caption font-medium text-fg-muted mb-1.5 block">
        {label}
      </label>
      {children}
      {error && <p className="text-caption text-danger mt-1">{error}</p>}
    </div>
  );
}
