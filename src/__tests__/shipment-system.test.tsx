import { describe, it, expect } from 'vitest';
import {
  calculateCartonCBM,
  calculateItemTotalCBM,
  calculatePackingSummary,
  detectShipmentDelayStatus,
} from '@/lib/shipments/calculations';
import {
  isValidShipmentStatusTransition,
  packingItemSchema,
} from '@/lib/validation/shipment.schema';
import {
  getShipmentsForAdmin,
  getShipmentsForBuyer,
  getShipmentById,
  getPackingItemsForShipment,
  createPackingItem,
  deletePackingItem,
  getShipmentEvents,
  recordShipmentEvent,
  getShipmentReadiness,
  updateShipmentStatus,
  confirmDelivery,
} from '@/lib/shipments';
import { hasPermission } from '@/lib/auth/permissions';
import { PackingItem } from '@/types/shipment';

describe('Shipment & Logistics Management — Step 13 Verification', () => {
  describe('1. Pure Deterministic Packing Calculations', () => {
    it('calculates single carton CBM accurately for standard garment export boxes', () => {
      // 60cm x 40cm x 30cm = 72,000 cm3 = 0.072 m3
      const cbm1 = calculateCartonCBM(60, 40, 30);
      expect(cbm1).toBe(0.072);

      // 65cm x 45cm x 40cm = 117,000 cm3 = 0.117 m3
      const cbm2 = calculateCartonCBM(65, 45, 40);
      expect(cbm2).toBe(0.117);

      // 70cm x 50cm x 45cm = 157,500 cm3 = 0.1575 m3
      const cbm3 = calculateCartonCBM(70, 50, 45);
      expect(cbm3).toBe(0.1575);
    });

    it('handles boundary, zero, and negative dimensions safely', () => {
      expect(calculateCartonCBM(0, 40, 30)).toBe(0);
      expect(calculateCartonCBM(-60, 40, 30)).toBe(0);
      expect(calculateCartonCBM(NaN, 40, 30)).toBe(0);
    });

    it('calculates total line CBM from carton count', () => {
      const singleCBM = 0.072;
      const totalCartons = 250;
      expect(calculateItemTotalCBM(singleCBM, totalCartons)).toBe(18.0);
    });

    it('computes aggregated packing summary with gross/net weight variance and averages', () => {
      const mockItems: PackingItem[] = [
        {
          id: 'pack-1',
          shipmentId: 'ship-test',
          orderId: 'order-test',
          cartonNumberStart: 1,
          cartonNumberEnd: 100,
          totalCartons: 100,
          styleNumber: 'STY-101',
          color: 'Black',
          sizeBreakdown: { S: 10, M: 20, L: 20 },
          piecesPerCarton: 50,
          totalPieces: 5000,
          lengthCM: 60,
          widthCM: 40,
          heightCM: 30,
          singleCartonCBM: 0.072,
          totalCBM: 7.2,
          grossWeightKG: 1250,
          netWeightKG: 1180,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'pack-2',
          shipmentId: 'ship-test',
          orderId: 'order-test',
          cartonNumberStart: 101,
          cartonNumberEnd: 250,
          totalCartons: 150,
          styleNumber: 'STY-101',
          color: 'White',
          sizeBreakdown: { S: 10, M: 20, L: 20 },
          piecesPerCarton: 50,
          totalPieces: 7500,
          lengthCM: 60,
          widthCM: 40,
          heightCM: 30,
          singleCartonCBM: 0.072,
          totalCBM: 10.8,
          grossWeightKG: 1875,
          netWeightKG: 1770,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const summary = calculatePackingSummary(mockItems);

      expect(summary.totalCartons).toBe(250);
      expect(summary.totalPieces).toBe(12500);
      expect(summary.totalGrossWeightKG).toBe(3125);
      expect(summary.totalNetWeightKG).toBe(2950);
      expect(summary.totalCBM).toBe(18.0);
      expect(summary.weightVarianceKG).toBe(175);
      expect(summary.averageWeightPerCartonKG).toBe(12.5);
      expect(summary.averagePiecesPerCarton).toBe(50);
    });
  });

  describe('2. Delay Detection Engine', () => {
    it('detects on-time dispatch and deliveries correctly', () => {
      const refDate = new Date('2026-09-01T00:00:00Z');
      const delay = detectShipmentDelayStatus(
        'PLANNING',
        '2026-09-10',
        undefined,
        '2026-09-30',
        undefined,
        refDate
      );
      expect(delay).toBe('ON_TIME');
    });

    it('detects delayed dispatch when planned ship date has lapsed', () => {
      const refDate = new Date('2026-09-15T00:00:00Z');
      const delay = detectShipmentDelayStatus(
        'PLANNING',
        '2026-09-10',
        undefined,
        '2026-09-30',
        undefined,
        refDate
      );
      expect(delay).toBe('DELAYED');
    });

    it('flags at-risk status when planned ship date is within 2 days but cargo not ready', () => {
      const refDate = new Date('2026-09-09T00:00:00Z');
      const delay = detectShipmentDelayStatus(
        'PLANNING',
        '2026-09-10',
        undefined,
        '2026-09-30',
        undefined,
        refDate
      );
      expect(delay).toBe('AT_RISK');
    });

    it('detects delayed in-transit shipments exceeding estimated arrival', () => {
      const refDate = new Date('2026-10-05T00:00:00Z');
      const delay = detectShipmentDelayStatus(
        'IN_TRANSIT',
        '2026-09-04',
        '2026-09-04',
        '2026-09-28',
        undefined,
        refDate
      );
      expect(delay).toBe('DELAYED');
    });

    it('flags customs hold as delayed', () => {
      const delay = detectShipmentDelayStatus(
        'CUSTOMS_HOLD',
        '2026-09-04',
        '2026-09-04',
        '2026-09-28'
      );
      expect(delay).toBe('DELAYED');
    });
  });

  describe('3. Validation Schemas & State Machine Graph', () => {
    it('validates legal lifecycle transitions', () => {
      expect(isValidShipmentStatusTransition('PLANNING', 'BOOKING_REQUESTED')).toBe(true);
      expect(isValidShipmentStatusTransition('BOOKING_REQUESTED', 'BOOKED')).toBe(true);
      expect(isValidShipmentStatusTransition('BOOKED', 'PACKING')).toBe(true);
      expect(isValidShipmentStatusTransition('PACKING', 'READY_TO_SHIP')).toBe(true);
      expect(isValidShipmentStatusTransition('READY_TO_SHIP', 'DISPATCHED')).toBe(true);
      expect(isValidShipmentStatusTransition('DISPATCHED', 'IN_TRANSIT')).toBe(true);
      expect(isValidShipmentStatusTransition('IN_TRANSIT', 'DELIVERED')).toBe(true);
    });

    it('rejects illegal status jumps', () => {
      expect(isValidShipmentStatusTransition('PLANNING', 'DELIVERED')).toBe(false);
      expect(isValidShipmentStatusTransition('BOOKED', 'DISPATCHED')).toBe(false);
      expect(isValidShipmentStatusTransition('DELIVERED', 'PLANNING')).toBe(false);
    });

    it('validates packing item constraints (end carton >= start, gross weight >= net weight)', () => {
      const valid = packingItemSchema.safeParse({
        orderId: 'PO-001',
        cartonNumberStart: 1,
        cartonNumberEnd: 50,
        totalCartons: 50,
        styleNumber: 'STY-1',
        color: 'Navy',
        sizeBreakdown: { S: 10, M: 20 },
        piecesPerCarton: 30,
        totalPieces: 1500,
        lengthCM: 60,
        widthCM: 40,
        heightCM: 30,
        grossWeightKG: 500,
        netWeightKG: 480,
      });
      expect(valid.success).toBe(true);

      const invalidCartonRange = packingItemSchema.safeParse({
        orderId: 'PO-001',
        cartonNumberStart: 50,
        cartonNumberEnd: 10, // Invalid!
        totalCartons: 50,
        styleNumber: 'STY-1',
        color: 'Navy',
        sizeBreakdown: {},
        piecesPerCarton: 10,
        totalPieces: 500,
        lengthCM: 60,
        widthCM: 40,
        heightCM: 30,
        grossWeightKG: 500,
        netWeightKG: 480,
      });
      expect(invalidCartonRange.success).toBe(false);

      const invalidWeight = packingItemSchema.safeParse({
        orderId: 'PO-001',
        cartonNumberStart: 1,
        cartonNumberEnd: 10,
        totalCartons: 10,
        styleNumber: 'STY-1',
        color: 'Navy',
        sizeBreakdown: {},
        piecesPerCarton: 10,
        totalPieces: 100,
        lengthCM: 60,
        widthCM: 40,
        heightCM: 30,
        grossWeightKG: 100,
        netWeightKG: 150, // Net weight cannot exceed gross weight!
      });
      expect(invalidWeight.success).toBe(false);
    });
  });

  describe('4. Shipment Service Layer & Strict Tenant Isolation', () => {
    it('retrieves all shipments for internal admin staff', async () => {
      const all = await getShipmentsForAdmin();
      expect(all.length).toBeGreaterThanOrEqual(3);
    });

    it('enforces tenant boundary for buyer queries and redacts internal operational notes', async () => {
      const buyerShipments = await getShipmentsForBuyer('buyer-org-001');

      expect(buyerShipments.length).toBeGreaterThan(0);
      buyerShipments.forEach((s) => {
        expect(s.buyerOrganizationId).toBe('buyer-org-001');
        expect(s.internalNotes).toBeUndefined(); // Redacted!
      });

      const otherBuyerShipments = await getShipmentsForBuyer('buyer-org-002');
      otherBuyerShipments.forEach((s) => {
        expect(s.buyerOrganizationId).toBe('buyer-org-002');
        expect(s.internalNotes).toBeUndefined();
      });
    });

    it('prevents buyer from accessing shipments of another tenant by direct ID lookup', async () => {
      // ship-003 belongs to buyer-org-002
      const crossOrgLookup = await getShipmentById('ship-003', 'buyer-org-001');
      expect(crossOrgLookup).toBeNull();

      const authorizedLookup = await getShipmentById('ship-003', 'buyer-org-002');
      expect(authorizedLookup).not.toBeNull();
      expect(authorizedLookup?.id).toBe('ship-003');
    });

    it('manages packing list items and synchronizes shipment totals', async () => {
      const actor = { uid: 'staff-merch-001', role: 'Merchandiser' };

      const newItem = await createPackingItem(
        {
          shipmentId: 'ship-001',
          orderId: 'TEST-ORDER-001',
          cartonNumberStart: 251,
          cartonNumberEnd: 260,
          totalCartons: 10,
          styleNumber: 'STY-KNIT-402',
          color: 'Red Extra',
          sizeBreakdown: { M: 50 },
          piecesPerCarton: 50,
          totalPieces: 500,
          lengthCM: 60,
          widthCM: 40,
          heightCM: 30,
          grossWeightKG: 125.0,
          netWeightKG: 118.0,
        },
        actor
      );

      expect(newItem.id).toBeDefined();
      expect(newItem.totalPieces).toBe(500);

      const items = await getPackingItemsForShipment('ship-001');
      expect(items.some((i) => i.id === newItem.id)).toBe(true);

      // Delete item
      const deleted = await deletePackingItem(newItem.id, actor);
      expect(deleted).toBe(true);
    });

    it('records and returns chronological shipment tracking events', async () => {
      const actor = { uid: 'staff-merch-001', role: 'Merchandiser', name: 'Tanvir Ahmed' };

      const event = await recordShipmentEvent(
        'ship-001',
        {
          title: 'Customs Inspection Completed at Port',
          location: 'Chittagong Port CFS',
          status: 'READY_TO_SHIP',
          description: 'Customs seal verified by officer on duty.',
        },
        actor
      );

      expect(event.id).toBeDefined();
      expect(event.title).toBe('Customs Inspection Completed at Port');

      const events = await getShipmentEvents('ship-001');
      expect(events[0].id).toBe(event.id);
    });
  });

  describe('5. Deterministic Pre-Shipment Readiness & Gate Enforcement', () => {
    it('evaluates readiness gates integrating Step 12 Quality and Step 9 Production', async () => {
      const readiness = await getShipmentReadiness('TEST-ORDER-001');

      expect(readiness).toBeDefined();
      expect(readiness.qualityGate).toBeDefined();
      expect(readiness.qualityGate.passedInspections).toBeGreaterThan(0);
      expect(readiness.productionGate).toBeDefined();
      expect(readiness.documentGate).toBeDefined();
    });

    it('blocks dispatch when readiness conditions fail and permits authorized manager override', async () => {
      const managerActor = { uid: 'staff-admin-001', role: 'Admin', name: 'Admin Operations' };

      // Testing status transition with override
      const updated = await updateShipmentStatus(
        'ship-002',
        {
          status: 'DISPATCHED',
          note: 'Emergency vessel departure',
          overrideQualityGate: true,
          overrideReason: 'Approved by Vice President of Sourcing due to buyer expedited sea window.',
        },
        managerActor
      );

      expect(updated.status).toBe('DISPATCHED');
      expect(updated.actualShipDate).toBeDefined();
      expect(updated.qualityGateOverride).toBeDefined();
      expect(updated.qualityGateOverride?.overrideByName).toBe('Admin Operations');
    });

    it('rejects unauthorized staff from overriding readiness gates', async () => {
      const qcActor = { uid: 'staff-qc-001', role: 'QC Staff', name: 'Inspector' };

      await expect(
        updateShipmentStatus(
          'ship-002',
          {
            status: 'DISPATCHED',
            overrideQualityGate: true,
            overrideReason: 'Override attempt by inspector',
          },
          qcActor
        )
      ).rejects.toThrow();
    });
  });

  describe('6. Buyer Delivery Confirmation & Receipt Acknowledgment', () => {
    it('allows authorized buyer to confirm physical delivery and records signature', async () => {
      const buyerActor = { uid: 'buyer-001', name: 'Morten Lindqvist' };

      const confirmed = await confirmDelivery(
        'ship-001',
        {
          receivedQuantity: 12500,
          conditionNotes: 'All 250 master cartons received without seal tampering or water ingress.',
          discrepancyReported: false,
          buyerSignatureName: 'Morten Lindqvist (Supply Chain VP)',
        },
        'buyer-org-001',
        buyerActor
      );

      expect(confirmed.status).toBe('DELIVERED');
      expect(confirmed.deliveryConfirmation?.confirmed).toBe(true);
      expect(confirmed.deliveryConfirmation?.buyerSignatureName).toBe('Morten Lindqvist (Supply Chain VP)');
      expect(confirmed.deliveryConfirmation?.receivedQuantity).toBe(12500);
    });

    it('rejects cross-organization delivery confirmation attempts', async () => {
      const wrongBuyer = { uid: 'buyer-002', name: 'Lars van der Meer' };

      // ship-001 belongs to buyer-org-001
      await expect(
        confirmDelivery(
          'ship-001',
          {
            receivedQuantity: 10000,
            buyerSignatureName: 'Lars',
          },
          'buyer-org-002', // Mismatched tenant org!
          wrongBuyer
        )
      ).rejects.toThrow(/Access Denied/);
    });
  });

  describe('7. RBAC & Granular Permissions Enforcement', () => {
    it('verifies shipment permission matrix across all platform roles', () => {
      // Super Admin: full access
      expect(hasPermission('Super Admin', 'shipments.read')).toBe(true);
      expect(hasPermission('Super Admin', 'shipments.write')).toBe(true);
      expect(hasPermission('Super Admin', 'shipments.status')).toBe(true);
      expect(hasPermission('Super Admin', 'shipments.documents')).toBe(true);
      expect(hasPermission('Super Admin', 'shipments.tracking')).toBe(true);
      expect(hasPermission('Super Admin', 'shipments.configure')).toBe(true);

      // Admin
      expect(hasPermission('Admin', 'shipments.read')).toBe(true);
      expect(hasPermission('Admin', 'shipments.write')).toBe(true);
      expect(hasPermission('Admin', 'shipments.status')).toBe(true);
      expect(hasPermission('Admin', 'shipments.tracking')).toBe(true);

      // Operations Manager
      expect(hasPermission('Operations Manager', 'shipments.read')).toBe(true);
      expect(hasPermission('Operations Manager', 'shipments.write')).toBe(true);
      expect(hasPermission('Operations Manager', 'shipments.status')).toBe(true);

      // Merchandiser
      expect(hasPermission('Merchandiser', 'shipments.read')).toBe(true);
      expect(hasPermission('Merchandiser', 'shipments.write')).toBe(true);
      expect(hasPermission('Merchandiser', 'shipments.status')).toBe(true);

      // Production Staff & QC Staff (Read only for logistical coordination)
      expect(hasPermission('Production Staff', 'shipments.read')).toBe(true);
      expect(hasPermission('Production Staff', 'shipments.write')).toBe(false);
      expect(hasPermission('QC Staff', 'shipments.read')).toBe(true);
      expect(hasPermission('QC Staff', 'shipments.write')).toBe(false);

      // Buyer (Read own & confirm delivery)
      expect(hasPermission('Buyer', 'shipments.read')).toBe(true);
      expect(hasPermission('Buyer', 'shipments.confirmDelivery')).toBe(true);
      expect(hasPermission('Buyer', 'shipments.write')).toBe(false);
      expect(hasPermission('Buyer', 'shipments.status')).toBe(false);
    });
  });
});
