import React from 'react';
import { OrderStatus } from '@/types/order';
import { getOrderProgressPercentage } from '@/lib/orders';

interface OrderProgressBarProps {
  status: OrderStatus;
  customPercentage?: number;
  showLabel?: boolean;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OrderProgressBar({
  status,
  customPercentage,
  showLabel = true,
  showPercentage = true,
  size = 'md',
  className = '',
}: OrderProgressBarProps) {
  const percentage = customPercentage ?? getOrderProgressPercentage(status);

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const isCancelled = status === 'Cancelled';
  const isCompleted = status === 'Completed';

  const barColor = isCancelled
    ? 'bg-rose-500'
    : isCompleted
    ? 'bg-emerald-500'
    : percentage >= 80
    ? 'bg-gradient-to-r from-amber-500 via-teal-500 to-emerald-400'
    : percentage >= 40
    ? 'bg-gradient-to-r from-amber-500 to-indigo-500'
    : 'bg-gradient-to-r from-blue-500 to-amber-500';

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-mono">
          {showLabel && (
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span>Stage:</span>
              <strong className="text-foreground font-semibold">{status}</strong>
            </span>
          )}
          {showPercentage && (
            <span className="font-bold text-foreground">{percentage}%</span>
          )}
        </div>
      )}
      <div
        className={`w-full ${heightClasses[size]} bg-muted/60 rounded-full overflow-hidden border border-border/50`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
