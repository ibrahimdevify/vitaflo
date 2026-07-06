export default function ContactLine({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-control hover:bg-surface-raised transition-colors group">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-surface-raised group-hover:bg-border/50 transition-colors">
        <Icon className="h-4 w-4 text-fg-muted group-hover:text-fg transition-colors" />
      </div>
      <div className="min-w-0">
        {label && <p className="text-caption text-fg-muted">{label}</p>}
        <p className="text-body font-medium text-fg truncate">{value || '—'}</p>
      </div>
    </div>
  );
}
