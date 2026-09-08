/**
 * STEP 15: PURE KPI CALCULATION ENGINE
 * Side-effect free, deterministic, null-safe and division-by-zero protected mathematical engine.
 */

import {
  ReportPeriod,
  ReportDateRange,
  TimeSeriesPoint,
  DistributionItem,
  MetricValue,
} from '@/types/reporting';

/**
 * Calculates a percentage safely preventing division by zero.
 */
export function calculatePercentage(value: number, total: number, decimals: number = 1): number {
  if (!total || total <= 0 || !Number.isFinite(total) || !Number.isFinite(value)) {
    return 0;
  }
  const factor = Math.pow(10, decimals);
  const result = (value / total) * 100;
  return Math.round(result * factor) / factor;
}

/**
 * Calculates quality or inspection pass rate (0 - 100%).
 */
export function calculatePassRate(passed: number, total: number): number {
  return calculatePercentage(passed, total, 1);
}

/**
 * Calculates on-time shipment or delivery rate (0 - 100%).
 */
export function calculateOnTimeRate(onTime: number, total: number): number {
  return calculatePercentage(onTime, total, 1);
}

/**
 * Computes trend percentage delta between current and previous values.
 * Returns null if previous is null/undefined or if both are zero.
 */
export function calculateTrendPercentage(
  current: number,
  previous?: number | null,
  decimals: number = 1
): number | null {
  if (previous === undefined || previous === null || !Number.isFinite(previous) || !Number.isFinite(current)) {
    return null;
  }
  if (previous === 0) {
    if (current === 0) return 0;
    return current > 0 ? 100 : -100;
  }
  const delta = ((current - previous) / Math.abs(previous)) * 100;
  const factor = Math.pow(10, decimals);
  return Math.round(delta * factor) / factor;
}

/**
 * Calculates average turnaround / cycle time in fractional days between pairs of dates.
 */
export function calculateAverageDays(
  datePairs: Array<{ start?: string | Date | null; end?: string | Date | null }>,
  decimals: number = 1
): number {
  const validDurations: number[] = [];

  for (const pair of datePairs) {
    if (!pair.start || !pair.end) continue;
    const startDate = new Date(pair.start);
    const endDate = new Date(pair.end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) continue;

    const diffMs = endDate.getTime() - startDate.getTime();
    if (diffMs >= 0) {
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      validDurations.push(diffDays);
    }
  }

  if (validDurations.length === 0) {
    return 0;
  }

  const sum = validDurations.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / validDurations.length;
  const factor = Math.pow(10, decimals);
  return Math.round(avg * factor) / factor;
}

/**
 * Calculates plan vs actual variance.
 */
export function calculateVariance(
  actual: number,
  planned: number
): { variance: number; percentVariance: number } {
  const variance = actual - planned;
  const percentVariance = planned > 0 ? calculatePercentage(variance, planned, 1) : 0;
  return {
    variance,
    percentVariance,
  };
}

/**
 * Computes Date Range bounds for a given period preset.
 */
export function getPeriodDateRange(period: ReportPeriod, customRange?: ReportDateRange): ReportDateRange {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (period === 'custom' && customRange) {
    return customRange;
  }

  if (period === 'all') {
    return {
      startDate: '2020-01-01',
      endDate: todayStr,
    };
  }

  if (period === 'today') {
    return {
      startDate: todayStr,
      endDate: todayStr,
    };
  }

  const startDate = new Date(now);

  if (period === '7d') {
    startDate.setDate(now.getDate() - 7);
  } else if (period === '30d') {
    startDate.setDate(now.getDate() - 30);
  } else if (period === '90d') {
    startDate.setDate(now.getDate() - 90);
  } else if (period === '12m') {
    startDate.setFullYear(now.getFullYear() - 1);
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: todayStr,
  };
}

/**
 * Filters any array of items by a date field falling within a date range.
 */
export function filterByDateRange<T>(
  items: T[],
  dateField: keyof T,
  range?: ReportDateRange | null
): T[] {
  if (!range || (!range.startDate && !range.endDate)) {
    return items;
  }

  const startMs = range.startDate ? new Date(range.startDate).getTime() : 0;
  // Make end date inclusive up to 23:59:59.999 if only YYYY-MM-DD was provided
  const endMs = range.endDate
    ? new Date(range.endDate.includes('T') ? range.endDate : `${range.endDate}T23:59:59.999Z`).getTime()
    : Infinity;

  return items.filter((item) => {
    const rawVal = item[dateField];
    if (!rawVal) return false;
    const itemMs = new Date(String(rawVal)).getTime();
    if (isNaN(itemMs)) return false;
    return itemMs >= startMs && itemMs <= endMs;
  });
}

/**
 * Aggregates items by Month for TimeSeries charts.
 */
export function aggregateByMonth<T>(
  items: T[],
  dateField: keyof T,
  valueField?: keyof T,
  secondaryField?: keyof T
): TimeSeriesPoint[] {
  const monthMap = new Map<string, { label: string; date: string; sum: number; secondarySum: number; count: number }>();

  // Sort items ascending by date
  const sorted = [...items].sort((a, b) => {
    const da = new Date(String(a[dateField])).getTime();
    const db = new Date(String(b[dateField])).getTime();
    return da - db;
  });

  for (const item of sorted) {
    const rawDate = item[dateField];
    if (!rawDate) continue;
    const d = new Date(String(rawDate));
    if (isNaN(d.getTime())) continue;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const val = valueField && typeof item[valueField] === 'number' ? (item[valueField] as unknown as number) : 1;
    const secVal = secondaryField && typeof item[secondaryField] === 'number' ? (item[secondaryField] as unknown as number) : 0;

    const existing = monthMap.get(key) || { label, date: `${key}-01`, sum: 0, secondarySum: 0, count: 0 };
    existing.sum += val;
    existing.secondarySum += secVal;
    existing.count += 1;
    monthMap.set(key, existing);
  }

  return Array.from(monthMap.values()).map((data) => ({
    date: data.date,
    label: data.label,
    value: data.sum,
    secondaryValue: data.secondarySum,
  }));
}

/**
 * Aggregates items into categorized distribution items with total sum and percentage.
 */
export function aggregateByCategory<T>(
  items: T[],
  categoryField: keyof T,
  valueField?: keyof T
): DistributionItem[] {
  const catMap = new Map<string, { count: number; sum: number }>();
  let grandTotalSum = 0;
  let grandTotalCount = 0;

  for (const item of items) {
    const cat = String(item[categoryField] || 'Uncategorized');
    const val = valueField && typeof item[valueField] === 'number' ? (item[valueField] as unknown as number) : 1;

    const existing = catMap.get(cat) || { count: 0, sum: 0 };
    existing.count += 1;
    existing.sum += val;
    catMap.set(cat, existing);

    grandTotalSum += val;
    grandTotalCount += 1;
  }

  const denominator = valueField ? grandTotalSum : grandTotalCount;

  return Array.from(catMap.entries()).map(([name, stat]) => {
    const val = valueField ? stat.sum : stat.count;
    const percentage = calculatePercentage(val, denominator, 1);
    return {
      name,
      value: val,
      count: stat.count,
      percentage,
    };
  });
}

/**
 * Creates a structured MetricValue object.
 */
export function createMetric(
  current: number,
  options?: {
    previous?: number | null;
    target?: number;
    unit?: string;
    invertTrend?: boolean; // if true, negative trend is good (e.g. defects, lead time)
  }
): MetricValue {
  const trendPercent = options?.previous !== undefined ? calculateTrendPercentage(current, options.previous) : null;
  
  let status: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (trendPercent !== null) {
    if (options?.invertTrend) {
      status = trendPercent < 0 ? 'positive' : trendPercent > 0 ? 'negative' : 'neutral';
    } else {
      status = trendPercent > 0 ? 'positive' : trendPercent < 0 ? 'negative' : 'neutral';
    }
  }

  return {
    current,
    previous: options?.previous ?? undefined,
    target: options?.target,
    unit: options?.unit,
    trendPercent,
    status,
  };
}

/**
 * Formats a number nicely for display (with commas, currency or unit).
 */
export function formatMetricNumber(
  value: number | undefined | null,
  unit?: string,
  decimals: number = 0
): string {
  if (value === undefined || value === null || !Number.isFinite(value)) {
    return '0';
  }

  const factor = Math.pow(10, decimals);
  const rounded = Math.round(value * factor) / factor;
  const formatted = decimals > 0 ? rounded.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : rounded.toLocaleString('en-US');

  if (!unit) return formatted;
  if (unit === '$' || unit === 'USD') return `$${formatted}`;
  if (unit === '%') return `${formatted}%`;
  return `${formatted} ${unit}`;
}
