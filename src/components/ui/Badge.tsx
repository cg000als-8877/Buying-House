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
  | 'indigo'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variantMap: Record<string, string> = {
    // Semantic
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    error: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    neutral: 'bg-secondary text-foreground-secondary border-border',
    secondary: 'bg-secondary text-foreground-secondary border-border',
    primary: 'bg-primary/10 text-primary border-primary/20',
    brand: 'bg-accent/15 text-accent border-accent/30',
    outline: 'bg-transparent text-foreground border-border',
    // Aliases
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
    blue: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    slate: 'bg-secondary text-foreground-secondary border-border',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  };

  const currentClass = variantMap[variant] || variantMap.neutral;

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border tracking-wide select-none font-sans',
        currentClass,
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
