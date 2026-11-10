/** Without a DB migration, only stored PRE/POST link status is durable.
 * Existing false is ambiguous: old offline uploads could omit the phase. */
export default function BronchodilatorPhase({ phase, linked = false, className = '' }) {
  const label = phase === 'PRE' ? 'PRE' : phase === 'POST' ? 'POST' : 'PHASE UNKNOWN';
  const appearance = phase === 'PRE'
    ? 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300'
    : phase === 'POST'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : 'border-border bg-surface-raised text-fg-muted';
  return <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${appearance} ${className}`}>
    {label}{linked ? ' · LINKED' : phase !== 'UNKNOWN' ? ' · UNPAIRED' : ''}
  </span>;
}
