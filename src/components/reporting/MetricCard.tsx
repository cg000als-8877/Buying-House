'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { MetricValue } from '@/types/reporting';
import { TrendIndicator } from './TrendIndicator';
import { formatMetricNumber } from '@/lib/reporting/calculations';

interface MetricCardProps {
  title: string;
  metric?: MetricValue;
  value?: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  comparisonLabel?: string;
  decimals?: number;
  className?: string;
}

export function MetricCard({
  title,
  metric,
  value,
  unit,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary bg-primary/10 border-primary/20',
  comparisonLabel,
  decimals = 0,
  className = '',
}: MetricCardProps) {
  // Determine display value
  const displayVal =
    value !== undefined
      ? typeof value === 'number'
        ? formatMetricNumber(value, unit, decimals)
        : value
      : metric
      ? formatMetricNumber(metric.current, metric.unit || unit, decimals)
      : '0';

  const trendPercent = metric?.trendPercent;
  const status = metric?.status;

  return (
    <div
      className={`p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {title}
          </span>
          {Icon && (
            <div className={`p-2 rounded-lg border ${iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-medium">
            {displayVal}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
        {trendPercent !== undefined && trendPercent !== null ? (
          <TrendIndicator
            trendPercent={trendPercent}
            status={status}
            comparisonLabel={comparisonLabel}
          />
        ) : subtitle ? (
          <span className="text-muted-foreground text-xs">{subtitle}</span>
        ) : (
          <span className="text-muted-foreground text-xs">Target Met</span>
        )}
      </div>
    </div>
  );
}
