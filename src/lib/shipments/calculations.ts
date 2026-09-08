import { PackingItem, ShipmentStatus, DelayStatus } from '@/types/shipment';

/**
 * Calculates cubic meters (CBM) for a single carton with dimensions in centimeters.
 * Formula: (Length * Width * Height) / 1,000,000
 */
export function calculateCartonCBM(lengthCM: number, widthCM: number, heightCM: number): number {
  const l = Math.max(0, Number(lengthCM) || 0);
  const w = Math.max(0, Number(widthCM) || 0);
  const h = Math.max(0, Number(heightCM) || 0);

  if (l === 0 || w === 0 || h === 0) return 0;
  const cbm = (l * w * h) / 1_000_000;
  return Number(cbm.toFixed(6));
}

/**
 * Calculates total CBM for a given single carton CBM and total carton quantity.
 */
export function calculateItemTotalCBM(singleCartonCBM: number, totalCartons: number): number {
  const cbm = Math.max(0, Number(singleCartonCBM) || 0);
  const cartons = Math.max(0, Math.floor(Number(totalCartons) || 0));
  return Number((cbm * cartons).toFixed(4));
}

export interface PackingSummary {
  totalCartons: number;
  totalPieces: number;
  totalGrossWeightKG: number;
  totalNetWeightKG: number;
  totalCBM: number;
  weightVarianceKG: number;
  averageWeightPerCartonKG: number;
  averagePiecesPerCarton: number;
}

/**
 * Computes deterministic aggregate metrics across all packing list lines.
 */
export function calculatePackingSummary(items: PackingItem[] = []): PackingSummary {
  const totalCartons = items.reduce((acc, item) => acc + (Math.max(0, item.totalCartons) || 0), 0);
  const totalPieces = items.reduce((acc, item) => acc + (Math.max(0, item.totalPieces) || 0), 0);
  const totalGrossWeightKG = Number(
    items.reduce((acc, item) => acc + (Math.max(0, item.grossWeightKG) || 0), 0).toFixed(2)
  );
  const totalNetWeightKG = Number(
    items.reduce((acc, item) => acc + (Math.max(0, item.netWeightKG) || 0), 0).toFixed(2)
  );
  const totalCBM = Number(
    items.reduce((acc, item) => acc + (Math.max(0, item.totalCBM) || 0), 0).toFixed(4)
  );

  const weightVarianceKG = Number(Math.max(0, totalGrossWeightKG - totalNetWeightKG).toFixed(2));
  const averageWeightPerCartonKG =
    totalCartons > 0 ? Number((totalGrossWeightKG / totalCartons).toFixed(2)) : 0;
  const averagePiecesPerCarton =
    totalCartons > 0 ? Number((totalPieces / totalCartons).toFixed(1)) : 0;

  return {
    totalCartons,
    totalPieces,
    totalGrossWeightKG,
    totalNetWeightKG,
    totalCBM,
    weightVarianceKG,
    averageWeightPerCartonKG,
    averagePiecesPerCarton,
  };
}

/**
 * Evaluates delay status dynamically comparing milestone dates to plan.
 */
export function detectShipmentDelayStatus(
  status: ShipmentStatus,
  plannedShipDate: string,
  actualShipDate?: string,
  estimatedDeliveryDate?: string,
  actualDeliveryDate?: string,
  referenceDate: Date = new Date()
): DelayStatus {
  if (status === 'CANCELLED') {
    return 'ON_TIME';
  }

  if (status === 'DELIVERED') {
    if (actualDeliveryDate && estimatedDeliveryDate) {
      const actual = new Date(actualDeliveryDate).getTime();
      const estimated = new Date(estimatedDeliveryDate).getTime();
      return actual > estimated ? 'DELAYED' : 'ON_TIME';
    }
    return 'ON_TIME';
  }

  if (status === 'CUSTOMS_HOLD') {
    return 'DELAYED';
  }

  const nowMs = referenceDate.getTime();

  // Pre-dispatch phase
  if (
    status === 'PLANNING' ||
    status === 'BOOKING_REQUESTED' ||
    status === 'BOOKED' ||
    status === 'PACKING' ||
    status === 'READY_TO_SHIP'
  ) {
    if (!actualShipDate && plannedShipDate) {
      const plannedMs = new Date(plannedShipDate).getTime();
      if (nowMs > plannedMs) {
        return 'DELAYED';
      }
      // Within 2 days of planned ship date but not ready to ship
      const daysUntilShip = (plannedMs - nowMs) / (1000 * 60 * 60 * 24);
      if (daysUntilShip <= 2 && status !== 'READY_TO_SHIP') {
        return 'AT_RISK';
      }
    }
    return 'ON_TIME';
  }

  // In-transit / Post-dispatch phase
  if (
    status === 'DISPATCHED' ||
    status === 'IN_TRANSIT' ||
    status === 'CUSTOMS_CLEARED' ||
    status === 'ARRIVED_AT_PORT' ||
    status === 'OUT_FOR_DELIVERY'
  ) {
    if (estimatedDeliveryDate) {
      const estDeliveryMs = new Date(estimatedDeliveryDate).getTime();
      if (nowMs > estDeliveryMs) {
        return 'DELAYED';
      }
      const daysUntilDelivery = (estDeliveryMs - nowMs) / (1000 * 60 * 60 * 24);
      if (daysUntilDelivery <= 3 && status === 'IN_TRANSIT') {
        return 'AT_RISK';
      }
    }
  }

  return 'ON_TIME';
}
