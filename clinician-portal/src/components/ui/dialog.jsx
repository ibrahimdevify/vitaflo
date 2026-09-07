import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "../../lib/utils";

export function Dialog({ open, onOpenChange, children, className }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}

export function DialogContent({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-surface rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogTitle({ className, children, ...props }) {
  return (
    <h2
      className={cn("text-xl font-bold text-fg", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function DialogClose({ onClick, className, children, ...props }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-1 rounded-lg hover:bg-surface-raised transition-colors",
        className
      )}
      {...props}
    >
      {children || <X className="h-5 w-5 text-fg-muted" />}
    </button>
  );
}