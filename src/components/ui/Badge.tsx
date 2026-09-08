import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'neutral'
    | 'brand'
    | 'emerald'
    | 'amber'
    | 'rose'
    | 'blue'
    | 'slate'
    | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantMap: Record<string, { bg: string; dot: string }> = {
    // Semantic
    success: {
      bg: 'bg-success/10 text-success border-success/30',
      dot: 'bg-success',
    },
    warning: {
      bg: 'bg-warning/10 text-warning border-warning/30',
      dot: 'bg-warning',
    },
    error: {
      bg: 'bg-error/10 text-error border-error/30',
      dot: 'bg-error',
    },
    info: {
      bg: 'bg-info/10 text-info border-info/30',
      dot: 'bg-info',
    },
    neutral: {
      bg: 'bg-secondary text-foreground-secondary border-border',
      dot: 'bg-muted-foreground',
    },
    brand: {
      bg: 'bg-accent/15 text-accent border-accent/40',
      dot: 'bg-accent',
    },
    // Aliases
    emerald: {
      bg: 'bg-success/10 text-success border-success/30',
      dot: 'bg-success',
    },
    amber: {
      bg: 'bg-warning/10 text-warning border-warning/30',
      dot: 'bg-warning',
    },
    rose: {
      bg: 'bg-error/10 text-error border-error/30',
      dot: 'bg-error',
    },
    blue: {
      bg: 'bg-info/10 text-info border-info/30',
      dot: 'bg-info',
    },
    slate: {
      bg: 'bg-secondary text-foreground-secondary border-border',
      dot: 'bg-muted-foreground',
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      dot: 'bg-purple-400',
    },
  };

  const current = variantMap[variant] || variantMap.neutral;

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border tracking-wide select-none',
        current.bg,
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', current.dot)}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
