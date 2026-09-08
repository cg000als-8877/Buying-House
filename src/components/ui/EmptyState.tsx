import React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-lg border border-dashed border-border bg-surface-muted/30',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-muted text-muted-foreground mb-4">
          {icon}
        </div>
      )}
      <h4 className="text-base font-semibold text-foreground tracking-tight mb-1">
        {title}
      </h4>
      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
