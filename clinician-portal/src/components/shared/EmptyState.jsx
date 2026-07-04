import { cn } from '../../lib/utils';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-14 text-center',
        className
      )}
    >
      {Icon && (
        <div className="h-12 w-12 rounded-pill bg-surface-raised flex items-center justify-center mb-3">
          <Icon className="h-5 w-5 text-fg-muted" />
        </div>
      )}
      <p className="text-body font-medium text-fg">{title}</p>
      {description && (
        <p className="text-caption text-fg-muted mt-1">{description}</p>
      )}
      {children}
    </div>
  );
}
