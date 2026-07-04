import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'group/badge  inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-pill border border-transparent px-2 py-0.5 text-caption font-medium whitespace-nowrap transition-colors focus-visible:border-focus-ring focus-visible:ring-[3px] focus-visible:ring-focus-ring/30 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-danger aria-invalid:ring-danger/20 [&>svg]:pointer-events-none [&>svg]:size-3! text-xs',
  {
    variants: {
      variant: {
        // Solid — for strong emphasis, sparingly
        default: 'bg-brand-600 text-white [a&]:hover:bg-brand-700',
        secondary: 'bg-surface-raised text-fg [a&]:hover:bg-border',

        // Soft tint — default choice for status/category pills
        brand: 'bg-brand-500/10 text-brand-600 [a&]:hover:bg-brand-500/20',
        success: 'bg-success/10 text-success [a&]:hover:bg-success/20',
        warning: 'bg-warning/10 text-warning [a&]:hover:bg-warning/20',
        danger: 'bg-danger/10 text-danger [a&]:hover:bg-danger/20',
        info: 'bg-info/10 text-info [a&]:hover:bg-info/20',

        // Structural
        outline: 'border-border text-fg [a&]:hover:bg-surface-raised',
        ghost: 'text-fg-muted [a&]:hover:bg-surface-raised [a&]:hover:text-fg',
        link: 'text-brand-600 underline-offset-4 [a&]:hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  });
}

export { Badge, badgeVariants };
