import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "bg-surface-raised text-fg border-border",
  brand:
    "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/20 dark:text-brand-300 dark:border-brand-500/30",
  info: "bg-info/10 text-info border-info/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  outline: "text-fg border-border",
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border",
        badgeVariants[variant] || badgeVariants.default,
        className,
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
