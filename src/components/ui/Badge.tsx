import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'secondary'
  | 'primary'
  | 'brand'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'blue'
  | 'slate'
  | 'purple'
  | 'teal'
  | 'indigo';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
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
    danger: {
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
    secondary: {
      bg: 'bg-secondary text-foreground-secondary border-border',
      dot: 'bg-muted-foreground',
    },
    primary: {
      bg: 'bg-accent/15 text-accent border-accent/40',
      dot: 'bg-accent',
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
    teal: {
      bg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      dot: 'bg-teal-400',
    },
    indigo: {
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      dot: 'bg-indigo-400',
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
        'inline-flex items-center rounded-md border tracking-wide select-none font-medium',
        current.bg,
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
