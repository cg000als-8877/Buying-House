import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'accent' | 'gold' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

    const variants: Record<string, string> = {
      primary:
        'btn-liquid btn-liquid-primary bg-primary text-primary-foreground hover:bg-primary-hover shadow-subtle',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-border/60 transition-colors',
      outline:
        'bg-transparent text-foreground border border-border hover:bg-surface-muted hover:text-foreground transition-colors',
      ghost:
        'bg-transparent text-foreground-secondary hover:text-foreground hover:bg-surface-muted transition-colors',
      destructive:
        'bg-error text-white hover:opacity-90 shadow-subtle',
      danger:
        'bg-error text-white hover:opacity-90 shadow-subtle',
      accent:
        'btn-liquid btn-liquid-accent bg-accent text-accent-foreground hover:bg-accent-hover shadow-subtle font-semibold',
      gold:
        'btn-liquid btn-liquid-gold bg-accent text-accent-foreground hover:bg-accent-hover shadow-subtle font-semibold',
    };

    const sizes = {
      xs: 'text-xs px-2.5 py-1 gap-1.5 min-h-[28px]',
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
      md: 'text-sm px-4 py-2 gap-2 min-h-[38px]',
      lg: 'text-base px-6 py-2.5 gap-2.5 min-h-[44px]',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
