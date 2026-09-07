import { cn } from "../../lib/utils";

export default function Field({ label, error, children, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-fg">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}