'use client';

import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { ReportFilter, ReportPeriod } from '@/types/reporting';
import { Button } from '@/components/ui/Button';

interface ReportFiltersProps {
  filter: ReportFilter;
  onFilterChange: (newFilter: ReportFilter) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  showFactoryFilter?: boolean;
  factories?: Array<{ id: string; name: string }>;
  showCategoryFilter?: boolean;
  categories?: string[];
  className?: string;
}

const PERIOD_OPTIONS: { label: string; value: ReportPeriod }[] = [
  { label: 'All Time', value: 'all' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Last 12 Months', value: '12m' },
];

export function ReportFilters({
  filter,
  onFilterChange,
  onRefresh,
  onExport,
  isLoading = false,
  showFactoryFilter = false,
  factories = [],
  showCategoryFilter = false,
  categories = ['Circular Knitwear', 'Denim & Bottoms', 'Woven Outerwear', 'Sweaters & Heavy Knits'],
  className = '',
}: ReportFiltersProps) {
  const currentPeriod = filter.period || 'all';

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border/60">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onFilterChange({ ...filter, period: opt.value })}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                currentPeriod === opt.value
                  ? 'bg-background text-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Factory Filter */}
        {showFactoryFilter && factories.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={filter.factoryId || ''}
              onChange={(e) =>
                onFilterChange({ ...filter, factoryId: e.target.value || undefined })
              }
              className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Partner Factories</option>
              {factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category Filter */}
        {showCategoryFilter && (
          <div className="flex items-center gap-2">
            <select
              value={filter.category || ''}
              onChange={(e) =>
                onFilterChange({ ...filter, category: e.target.value || undefined })
              }
              className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Product Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}

        {onExport && (
          <Button
            variant="primary"
            size="sm"
            onClick={onExport}
            disabled={isLoading}
            className="text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        )}
      </div>
    </div>
  );
}
