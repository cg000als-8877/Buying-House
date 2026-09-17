'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TimeSeriesPoint, DistributionItem, DefectDistributionItem } from '@/types/reporting';

const CHART_COLORS = [
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#64748b', // Slate
];

interface TooltipPayloadEntry {
  name: string;
  value: number | string;
  color?: string;
  fill?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

// Custom Tooltip formatter
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-slate-100 p-3 rounded-lg shadow-xl border border-slate-800 text-xs z-50">
        <p className="font-semibold text-amber-400 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="font-medium font-bold text-white">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================================================
// TIME SERIES AREA CHART
// ============================================================================
interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  title?: string;
  dataKey?: string;
  name?: string;
  color?: string;
  height?: number;
  className?: string;
}

export function TimeSeriesAreaChart({
  data,
  title,
  dataKey = 'value',
  name = 'Volume (pcs)',
  color = '#f59e0b',
  height = 280,
  className = '',
}: TimeSeriesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`p-6 rounded-xl border border-border bg-card flex flex-col items-center justify-center text-muted-foreground text-xs h-[${height}px] ${className}`}>
        No time-series data available for selected period.
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-xl border border-border bg-card shadow-sm ${className}`}>
      {title && <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              name={name}
              stroke={color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#gradient-${color.replace('#', '')})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================================
// CATEGORY BAR CHART
// ============================================================================
interface CategoryBarChartProps {
  data: DistributionItem[] | Array<{ name: string; value: number }>;
  title?: string;
  dataKey?: string;
  name?: string;
  color?: string;
  height?: number;
  className?: string;
}

export function CategoryBarChart({
  data,
  title,
  dataKey = 'value',
  name = 'Quantity',
  color = '#3b82f6',
  height = 280,
  className = '',
}: CategoryBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`p-6 rounded-xl border border-border bg-card flex flex-col items-center justify-center text-muted-foreground text-xs h-[${height}px] ${className}`}>
        No data available for breakdown.
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-xl border border-border bg-card shadow-sm ${className}`}>
      {title && <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} name={name} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================================
// DONUT DISTRIBUTION CHART
// ============================================================================
interface DonutChartProps {
  data: DistributionItem[];
  title?: string;
  height?: number;
  className?: string;
}

export function DonutDistributionChart({
  data,
  title,
  height = 280,
  className = '',
}: DonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`p-6 rounded-xl border border-border bg-card flex flex-col items-center justify-center text-muted-foreground text-xs h-[${height}px] ${className}`}>
        No distribution data available.
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between ${className}`}>
      {title && <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(val: string) => (
                <span className="text-xs text-foreground/80">{val}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================================
// DEFECT PARETO CHART
// ============================================================================
interface ParetoChartProps {
  data: DefectDistributionItem[];
  title?: string;
  height?: number;
  className?: string;
}

export function DefectParetoChart({
  data,
  title = 'AQL Defect Pareto Analysis',
  height = 300,
  className = '',
}: ParetoChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`p-6 rounded-xl border border-border bg-card flex flex-col items-center justify-center text-muted-foreground text-xs h-[${height}px] ${className}`}>
        No defect data recorded.
      </div>
    );
  }

  // Calculate cumulative percentage for Pareto line
  let cumSum = 0;
  const totalCount = data.reduce((s, d) => s + d.count, 0) || 1;
  const paretoData = data.map((d) => {
    cumSum += d.count;
    return {
      name: d.defectCategory,
      count: d.count,
      cumulativePercent: Math.round((cumSum / totalCount) * 100),
      severity: d.severity,
    };
  });

  return (
    <div className={`p-5 rounded-xl border border-border bg-card shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">Total Defects: {totalCount}</span>
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={paretoData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              angle={-25}
              textAnchor="end"
              height={50}
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Defect Count" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
