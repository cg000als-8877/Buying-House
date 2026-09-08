import { describe, it, expect } from 'vitest';
import {
  calculateAchievementPercentage,
  calculateVariance,
  calculateRemainingQuantity,
  calculateOverallCompletion,
  calculateCumulativeTotalsPerStage,
  determineStageStatus,
  determineProductionHealth,
} from '@/lib/production/calculations';
import { ProductionUpdate } from '@/types/production';

describe('Production Calculation Engine — Step 9 Verification', () => {
  describe('1. calculateAchievementPercentage', () => {
    it('correctly calculates achievement percentage for normal numbers', () => {
      expect(calculateAchievementPercentage(5200, 5000)).toBe(104);
      expect(calculateAchievementPercentage(4300, 4500)).toBe(95.6);
      expect(calculateAchievementPercentage(1500, 1500)).toBe(100);
    });

    it('safely handles zero planned quantity without throwing division by zero or NaN', () => {
      expect(calculateAchievementPercentage(100, 0)).toBe(0);
      expect(calculateAchievementPercentage(0, 0)).toBe(0);
      expect(calculateAchievementPercentage(50, -10)).toBe(0);
    });

    it('safely handles negative actual numbers', () => {
      expect(calculateAchievementPercentage(-50, 100)).toBe(0);
    });
  });

  describe('2. calculateVariance', () => {
    it('calculates positive variance when actual > planned', () => {
      const res = calculateVariance(1100, 1000);
      expect(res.variance).toBe(100);
      expect(res.variancePercent).toBe(10);
      expect(res.statusText).toBe('Ahead');
    });

    it('calculates negative variance when actual < planned', () => {
      const res = calculateVariance(900, 1000);
      expect(res.variance).toBe(-100);
      expect(res.variancePercent).toBe(-10);
      expect(res.statusText).toBe('Behind');
    });

    it('calculates zero variance when actual equals planned', () => {
      const res = calculateVariance(1000, 1000);
      expect(res.variance).toBe(0);
      expect(res.variancePercent).toBe(0);
      expect(res.statusText).toBe('On Target');
    });

    it('protects against zero planned output', () => {
      const res = calculateVariance(50, 0);
      expect(res.variance).toBe(50);
      expect(res.variancePercent).toBe(0);
      expect(res.statusText).toBe('Ahead');
    });
  });

  describe('3. calculateRemainingQuantity', () => {
    it('calculates remaining quantity correctly', () => {
      expect(calculateRemainingQuantity(10000, 6200)).toBe(3800);
      expect(calculateRemainingQuantity(5000, 5000)).toBe(0);
    });

    it('never returns negative remaining quantity if cumulative exceeds order target', () => {
      expect(calculateRemainingQuantity(5000, 5500)).toBe(0);
      expect(calculateRemainingQuantity(0, 500)).toBe(0);
    });
  });

  describe('4. calculateOverallCompletion', () => {
    it('computes completion percentage accurately', () => {
      expect(calculateOverallCompletion(6200, 10000)).toBe(62);
      expect(calculateOverallCompletion(10000, 10000)).toBe(100);
    });

    it('protects against zero order quantity', () => {
      expect(calculateOverallCompletion(500, 0)).toBe(0);
    });
  });

  describe('5. calculateCumulativeTotalsPerStage', () => {
    it('derives cumulative totals chronologically without double counting', () => {
      const sampleUpdates: ProductionUpdate[] = [
        {
          id: 'log-1',
          orderId: 'PO-001',
          buyerOrganizationId: 'buyer-01',
          productionStageId: 'stage-sewing',
          stageKey: 'sewing',
          stageName: 'Sewing',
          productionDate: '2026-09-01',
          plannedQuantity: 1000,
          actualQuantity: 850,
          cumulativeQuantity: 850,
          achievementPercent: 85,
          status: 'published',
          createdBy: 'staff',
          createdAt: '2026-09-01',
          updatedAt: '2026-09-01',
        },
        {
          id: 'log-2',
          orderId: 'PO-001',
          buyerOrganizationId: 'buyer-01',
          productionStageId: 'stage-sewing',
          stageKey: 'sewing',
          stageName: 'Sewing',
          productionDate: '2026-09-02',
          plannedQuantity: 1000,
          actualQuantity: 900,
          cumulativeQuantity: 1750,
          achievementPercent: 90,
          status: 'published',
          createdBy: 'staff',
          createdAt: '2026-09-02',
          updatedAt: '2026-09-02',
        },
        {
          id: 'log-3',
          orderId: 'PO-001',
          buyerOrganizationId: 'buyer-01',
          productionStageId: 'stage-sewing',
          stageKey: 'sewing',
          stageName: 'Sewing',
          productionDate: '2026-09-03',
          plannedQuantity: 1000,
          actualQuantity: 1050,
          cumulativeQuantity: 2800,
          achievementPercent: 105,
          status: 'published',
          createdBy: 'staff',
          createdAt: '2026-09-03',
          updatedAt: '2026-09-03',
        },
      ];

      const totals = calculateCumulativeTotalsPerStage(sampleUpdates);
      expect(totals.get('stage-sewing')).toBe(2800);
    });
  });

  describe('6. determineStageStatus', () => {
    it('returns not_started when cumulative is 0', () => {
      expect(determineStageStatus(1000, 0, '2026-10-01')).toBe('not_started');
    });

    it('returns in_progress when partially produced', () => {
      expect(determineStageStatus(1000, 450, '2026-10-01')).toBe('in_progress');
    });

    it('returns completed when target is met or exceeded', () => {
      expect(determineStageStatus(1000, 1000, '2026-10-01')).toBe('completed');
      expect(determineStageStatus(1000, 1050, '2026-10-01')).toBe('completed');
    });
  });

  describe('7. determineProductionHealth', () => {
    it('returns Completed when order is finished', () => {
      expect(determineProductionHealth(100, '2026-09-30', 'Completed')).toBe('Completed');
    });

    it('returns On Track when progressing normally', () => {
      expect(determineProductionHealth(60, '2026-10-30', 'Production')).toBe('On Track');
    });
  });
});
