import { ProductionUpdate, ProductionStage } from '@/types/production';

/**
 * Calculates achievement percentage with division-by-zero protection.
 */
export function calculateAchievementPercentage(actual: number, planned: number): number {
  if (!planned || planned <= 0) return 0;
  if (actual < 0) return 0;
  const percentage = (actual / planned) * 100;
  return Math.round(percentage * 10) / 10;
}

export async function getProductionUpdatesByOrder(orderId: string): Promise<ProductionUpdate[]> {
  return [];
}
