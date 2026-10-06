import { cva } from 'class-variance-authority';
import { cn } from '@utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-content-inverse hover:bg-accent-hover focus-visible:ring-accent',
        secondary: 'border border-brand/30 bg-cream text-brand hover:bg-lavender focus-visible:ring-brand',
        outline: 'border border-border bg-surface text-content hover:bg-surface-muted focus-visible:ring-border-strong',
        ghost: 'text-content-muted hover:bg-surface-muted hover:text-content focus-visible:ring-border',
        danger: 'bg-danger text-content-inverse hover:opacity-90 focus-visible:ring-danger',
        success: 'bg-success text-content-inverse hover:opacity-90 focus-visible:ring-success',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export function Button({
  variant,
  size,
  className,
  disabled,
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

export { buttonVariants };
