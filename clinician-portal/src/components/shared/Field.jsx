import { cn } from '../../lib/utils';

export default function Field({ label, error, children, className }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="block text-sm font-medium text-fg">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
