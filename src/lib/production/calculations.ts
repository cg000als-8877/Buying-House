import {
  ProductionUpdate,
  ProductionStageStatus,
  ProductionHealthStatus,
  StageSummary,
} from '@/types/production';

/**
 * Calculates achievement percentage with strict division-by-zero & negative bounds protection.
 * Formula: (Actual / Planned) * 100
 */
export function calculateAchievementPercentage(actual: number, planned: number): number {
  if (typeof planned !== 'number' || typeof actual !== 'number') return 0;
  if (isNaN(planned) || isNaN(actual)) return 0;
  if (planned <= 0 || actual < 0) return 0;

  const percentage = (actual / planned) * 100;
  return Math.round(percentage * 10) / 10;
}

export interface VarianceResult {
  variance: number;
  variancePercent: number;
  statusText: 'Ahead' | 'On Target' | 'Behind';
}

/**
 * Calculates daily or cumulative variance between actual and planned output.
 * Variance = Actual - Planned
 * Variance % = ((Actual - Planned) / Planned) * 100
 */
export function calculateVariance(actual: number, planned: number): VarianceResult {
  if (typeof planned !== 'number' || typeof actual !== 'number' || isNaN(planned) || isNaN(actual)) {
    return { variance: 0, variancePercent: 0, statusText: 'On Target' };
  }

  const variance = actual - planned;

  let variancePercent = 0;
  if (planned > 0) {
    variancePercent = Math.round(((variance / planned) * 100) * 10) / 10;
  }

  let statusText: 'Ahead' | 'On Target' | 'Behind' = 'On Target';
  if (variance > 0) {
    statusText = 'Ahead';
  } else if (variance < 0) {
    statusText = 'Behind';
  }

  return {
    variance,
    variancePercent,
    statusText,
  };
}

/**
 * Calculates remaining quantity balance for an order or stage.
 * Formula: Math.max(0, orderQuantity - cumulativeQuantity)
 * Never returns negative numbers.
 */
export function calculateRemainingQuantity(orderQuantity: number, cumulativeQuantity: number): number {
  if (!orderQuantity || orderQuantity <= 0) return 0;
  if (!cumulativeQuantity || cumulativeQuantity <= 0) return orderQuantity;
  return Math.max(0, orderQuantity - cumulativeQuantity);
}

/**
 * Calculates overall order production completion percentage.
 * Formula: (Completed Quantity / Order Quantity) * 100
 * Protected against zero division.
 */
export function calculateOverallCompletion(completedQuantity: number, orderQuantity: number): number {
  if (!orderQuantity || orderQuantity <= 0) return 0;
  if (!completedQuantity || completedQuantity <= 0) return 0;

  const pct = (completedQuantity / orderQuantity) * 100;
  return Math.min(100, Math.round(pct * 10) / 10);
}

/**
 * Computes deterministic chronological cumulative production per stage from log records.
 * Avoids trusting manually fabricated cumulative numbers by sorting by date and summing actuals.
 */
export function calculateCumulativeTotalsPerStage(updates: ProductionUpdate[]): Map<string, number> {
  const stageTotals = new Map<string, number>();

  // Filter for valid updates and sort chronologically
  const sorted = [...updates].sort(
    (a, b) => new Date(a.productionDate || a.date || 0).getTime() - new Date(b.productionDate || b.date || 0).getTime()
  );

  for (const update of sorted) {
    const stageId = update.productionStageId || update.stageId;
    if (!stageId) continue;

    const currentTotal = stageTotals.get(stageId) || 0;
    const actual = Math.max(0, update.actualQuantity || 0);
    stageTotals.set(stageId, currentTotal + actual);
  }

  return stageTotals;
}

/**
 * Determines stage operational status based on cumulative progress vs target deadline.
 */
export function determineStageStatus(
  plannedQuantity: number,
  cumulativeQuantity: number,
  targetEndDate?: string
): ProductionStageStatus {
  if (cumulativeQuantity <= 0) {
    if (targetEndDate && new Date(targetEndDate).getTime() < Date.now()) {
      return 'delayed';
    }
    return 'not_started';
  }

  if (plannedQuantity > 0 && cumulativeQuantity >= plannedQuantity) {
    return 'completed';
  }

  if (targetEndDate && new Date(targetEndDate).getTime() < Date.now()) {
    return 'delayed';
  }

  return 'in_progress';
}

/**
 * Determines overall production health status using deterministic business metrics.
 */
export function determineProductionHealth(
  completionPercentage: number,
  exFactoryDate?: string,
  currentStatus?: string
): ProductionHealthStatus {
  if (currentStatus === 'Completed' || completionPercentage >= 100) {
    return 'Completed';
  }

  if (completionPercentage <= 0) {
    return 'Not Started';
  }

  if (exFactoryDate) {
    const exDate = new Date(exFactoryDate).getTime();
    const now = Date.now();
    const daysLeft = Math.ceil((exDate - now) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0 && completionPercentage < 100) {
      return 'Delayed';
    }

    if (daysLeft <= 7 && completionPercentage < 80) {
      return 'At Risk';
    }

    if (daysLeft <= 14 && completionPercentage < 50) {
      return 'At Risk';
    }
  }

  return 'On Track';
}

/**
 * Aggregates stages and logs into comprehensive stage summaries.
 */
export function aggregateStageSummaries(
  stages: {
    id: string;
    stageKey: string;
    stageName: string;
    sequence: number;
    enabled: boolean;
    plannedQuantity: number;
    targetStartDate?: string;
    targetEndDate?: string;
  }[],
  updates: ProductionUpdate[]
): StageSummary[] {
  const cumulativeMap = calculateCumulativeTotalsPerStage(updates);

  return stages.map((stage) => {
    const cumulative = cumulativeMap.get(stage.id) || 0;
    const planned = stage.plannedQuantity || 0;
    const achievementPercent = calculateAchievementPercentage(cumulative, planned);
    const varianceResult = calculateVariance(cumulative, planned);

    // Get latest log date for this stage
    const stageLogs = updates
      .filter((u) => (u.productionStageId === stage.id || u.stageId === stage.id))
      .sort((a, b) => new Date(b.productionDate || b.date || 0).getTime() - new Date(a.productionDate || a.date || 0).getTime());

    const lastLog = stageLogs[0];
    const latestActual = lastLog ? lastLog.actualQuantity : 0;

    const status = determineStageStatus(planned, cumulative, stage.targetEndDate);

    return {
      stageId: stage.id,
      stageKey: stage.stageKey,
      stageName: stage.stageName,
      sequence: stage.sequence,
      enabled: stage.enabled,
      plannedQuantity: planned,
      actualQuantity: latestActual,
      cumulativeQuantity: cumulative,
      achievementPercent,
      variance: varianceResult.variance,
      variancePercent: varianceResult.variancePercent,
      varianceStatus: varianceResult.statusText,
      status,
      lastUpdateDate: lastLog ? (lastLog.productionDate || lastLog.date) : undefined,
      targetStartDate: stage.targetStartDate,
      targetEndDate: stage.targetEndDate,
    };
  });
}
