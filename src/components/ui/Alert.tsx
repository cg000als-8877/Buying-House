import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
}

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
  ...props
}: AlertProps) {
  const variantConfig = {
    info: {
      container: 'bg-info/10 border-info/30 text-foreground',
      icon: <Info className="w-5 h-5 text-info shrink-0" aria-hidden="true" />,
      role: 'status',
    },
    success: {
      container: 'bg-success/10 border-success/30 text-foreground',
      icon: <CheckCircle2 className="w-5 h-5 text-success shrink-0" aria-hidden="true" />,
      role: 'status',
    },
    warning: {
      container: 'bg-warning/10 border-warning/30 text-foreground',
      icon: <AlertTriangle className="w-5 h-5 text-warning shrink-0" aria-hidden="true" />,
      role: 'alert',
    },
    error: {
      container: 'bg-error/10 border-error/30 text-foreground',
      icon: <AlertCircle className="w-5 h-5 text-error shrink-0" aria-hidden="true" />,
      role: 'alert',
    },
  };

  const config = variantConfig[variant];

  return (
    <div
      role={config.role}
      className={cn(
        'relative flex items-start gap-3.5 p-4 rounded-lg border text-sm',
        config.container,
        className
      )}
      {...props}
    >
      <div className="mt-0.5">{config.icon}</div>
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold text-foreground tracking-tight">{title}</h5>}
        <div className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
          {children}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="p-1 -mr-1 -mt-1 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
