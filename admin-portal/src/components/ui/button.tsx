import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "group/button cursor-pointer inline-flex shrink-0 items-center justify-center rounded-control border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-focus-ring focus-visible:ring-3 focus-visible:ring-focus-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-brand-600 text-white [a&]:hover:bg-brand-700 hover:bg-brand-700",

        outline:
          "border-border bg-surface hover:bg-surface-raised hover:text-fg aria-expanded:bg-surface-raised aria-expanded:text-fg",

        secondary:
          "bg-surface-raised text-fg hover:bg-fg/10 aria-expanded:bg-fg/10",

        ghost:
          "hover:bg-surface-raised hover:text-fg aria-expanded:bg-surface-raised aria-expanded:text-fg",

        destructive:
          "bg-danger/10 text-danger hover:bg-danger/20 focus-visible:border-danger/40 focus-visible:ring-danger/20",

        success:
          "bg-success text-white hover:bg-success/90 focus-visible:border-success/40 focus-visible:ring-success/20",

        warning:
          "bg-warning text-white hover:bg-warning/90 focus-visible:border-warning/40 focus-visible:ring-warning/20",

        danger:
          "bg-danger text-white hover:bg-danger/90 focus-visible:border-danger/40 focus-visible:ring-danger/20",

        info: "bg-info text-white hover:bg-info/90 focus-visible:border-info/40 focus-visible:ring-info/20",

        link: "text-brand-500 underline-offset-4 hover:underline",
      },

      size: {
        default:
          "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",

        xs: "h-6 gap-1 rounded-md px-2 text-xs in-data-[slot=button-group]:rounded-control has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",

        sm: "h-7 gap-1 rounded-md px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-control has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",

        lg: "h-10 gap-1.5 px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",

        icon: "size-9",

        "icon-xs":
          "size-6 rounded-md in-data-[slot=button-group]:rounded-control",

        "icon-sm":
          "size-7 rounded-md in-data-[slot=button-group]:rounded-control",

        "icon-lg": "size-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "sm",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

// {
//   <div className="mt-auto border-t border-border pt-3">
//     <a
//       href="https://www.vitalflohealth.com/"
//       target="_blank"
//       rel="noopener noreferrer"
//       className="group relative flex items-center gap-2 overflow-hidden rounded-xl px-2.5 py-2 transition-all duration-300"
//     >
//       <span className="absolute inset-y-0 left-0 w-0 rounded-xl bg-brand-500/[0.06] transition-all duration-500 group-hover:w-full" />

//       <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-raised">
//         <span className="h-1.5 w-1.5 rounded-full bg-brand-500 transition-all duration-300 group-hover:scale-[1.6]" />
//       </span>

//       <span className="relative min-w-0 flex-1">
//         <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-fg-muted transition-colors group-hover:text-fg">
//           VitalFlo
//         </span>

//         <span className="block text-[11px] text-fg-muted">
//           Visit main platform
//         </span>
//       </span>

//       <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-all duration-300 group-hover:bg-surface-raised group-hover:text-brand-500">
//         <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
//       </span>
//     </a>
//   </div>;
// }
