'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  trendPercent: number | null | undefined;
  status?: 'positive' | 'negative' | 'neutral';
  comparisonLabel?: string;
  className?: string;
}

export function TrendIndicator({
  trendPercent,
  status = 'neutral',
  comparisonLabel = 'vs previous period',
  className = '',
}: TrendIndicatorProps) {
  if (trendPercent === undefined || trendPercent === null) {
    return null;
  }

  const isPositive = status === 'positive';
  const isNegative = status === 'negative';

  const colorClasses = isPositive
    ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : isNegative
    ? 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
    : 'text-slate-500 dark:text-slate-400 bg-slate-500/10 border-slate-500/20';

  const Icon = trendPercent > 0 ? TrendingUp : trendPercent < 0 ? TrendingDown : Minus;
  const sign = trendPercent > 0 ? '+' : '';

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${className}`}>
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border ${colorClasses}`}>
        <Icon className="w-3 h-3" />
        <span>{sign}{trendPercent}%</span>
      </span>
      {comparisonLabel && (
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          {comparisonLabel}
        </span>
      )}
    </div>
  );
}
