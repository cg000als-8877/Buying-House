import { describe, it, expect, vi } from 'vitest';
import {
  getProductionStages,
  getPublishedProductionUpdatesForBuyer,
  createProductionUpdate,
  submitProductionUpdate,
  publishProductionUpdate,
  rejectProductionUpdate,
  uploadProductionPhoto,
  deleteProductionPhoto,
  getProductionSummary,
  saveProductionStages,
} from '@/lib/production';
import { createProductionUpdateSchema } from '@/lib/validation/production.schema';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useParams: () => ({
    orderId: 'TEST-ORDER-001',
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('Production System & Daily Floor Telemetry — Step 9 Verification', () => {
  const staffActor = { uid: 'staff-prod-001', role: 'Production Staff' };
  const merchActor = { uid: 'merch-001', role: 'Merchandiser' };

  describe('1. Production Pipeline Configuration', () => {
    it('retrieves default or configured stages for an order', async () => {
      const stages = await getProductionStages('TEST-ORDER-001');
      expect(stages).toBeDefined();
      expect(stages.length).toBeGreaterThanOrEqual(5);

      const fabricStage = stages.find((s) => s.stageKey === 'fabric');
      expect(fabricStage).toBeDefined();
      expect(fabricStage?.stageName).toContain('Fabric');
    });

    it('saves custom stage configuration for an order', async () => {
      const stages = await getProductionStages('TEST-ORDER-001');
      const modifiedStages = stages.map((s) =>
        s.stageKey === 'sewing' ? { ...s, enabled: false } : s
      );

      await saveProductionStages('TEST-ORDER-001', modifiedStages, merchActor);
      const updated = await getProductionStages('TEST-ORDER-001');
      const sewing = updated.find((s) => s.stageKey === 'sewing');
      expect(sewing?.enabled).toBe(false);
    });
  });

  describe('2. Tenant Isolation & Publication Visibility', () => {
    it('ensures buyers only receive published logs belonging to their organization', async () => {
      const buyerOrg1Logs = await getPublishedProductionUpdatesForBuyer(
        'TEST-ORDER-001',
        'buyer-org-001'
      );

      expect(buyerOrg1Logs).toBeDefined();
      expect(buyerOrg1Logs.length).toBeGreaterThan(0);
      buyerOrg1Logs.forEach((log) => {
        expect(log.buyerOrganizationId).toBe('buyer-org-001');
        expect(log.status).toBe('published');
      });
    });

    it('blocks buyers from another organization from viewing production data (Tenant Boundary)', async () => {
      const buyerOrg2Logs = await getPublishedProductionUpdatesForBuyer(
        'TEST-ORDER-001',
        'buyer-org-999-unauthorized'
      );

      expect(buyerOrg2Logs).toHaveLength(0);
    });

    it('hides internal drafts and rejected logs from buyer queries', async () => {
      const buyerLogs = await getPublishedProductionUpdatesForBuyer(
        'TEST-ORDER-001',
        'buyer-org-001'
      );

      const draftLogs = buyerLogs.filter((l) => l.status === 'draft');
      const rejectedLogs = buyerLogs.filter((l) => l.status === 'rejected');
      const submittedLogs = buyerLogs.filter((l) => l.status === 'submitted');

      expect(draftLogs).toHaveLength(0);
      expect(rejectedLogs).toHaveLength(0);
      expect(submittedLogs).toHaveLength(0);
    });
  });

  describe('3. Production Log Lifecycle (Draft -> Submitted -> Published -> Rejected)', () => {
    let createdLogId: string;

    it('creates a daily production log as Draft', async () => {
      const newLog = await createProductionUpdate(
        {
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          productionStageId: 'stage-TEST-ORDER-001-sewing',
          stageKey: 'sewing',
          stageName: 'Assembly & Sewing Lines',
          productionDate: '2026-09-09',
          plannedQuantity: 1500,
          actualQuantity: 1450,
          remarks: 'Standard daytime shift output.',
          status: 'draft',
        },
        staffActor
      );

      expect(newLog.id).toBeDefined();
      expect(newLog.status).toBe('draft');
      expect(newLog.achievementPercent).toBe(96.7);
      createdLogId = newLog.id;
    });

    it('submits a draft log for review', async () => {
      const submitted = await submitProductionUpdate(createdLogId, staffActor);
      expect(submitted.status).toBe('submitted');
    });

    it('publishes a submitted log making it visible to buyers', async () => {
      const published = await publishProductionUpdate(createdLogId, merchActor);
      expect(published.status).toBe('published');
      expect(published.publishedBy).toBe(merchActor.uid);
      expect(published.publishedAt).toBeDefined();
    });

    it('rejects a submitted log with corrective reason', async () => {
      // Create another log to reject
      const tempLog = await createProductionUpdate(
        {
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          productionStageId: 'stage-TEST-ORDER-001-sewing',
          stageKey: 'sewing',
          stageName: 'Assembly & Sewing Lines',
          productionDate: '2026-09-10',
          plannedQuantity: 1500,
          actualQuantity: 400,
          remarks: 'Low output test.',
          status: 'submitted',
        },
        staffActor
      );

      const rejected = await rejectProductionUpdate(
        tempLog.id,
        'Output below minimum threshold. Please specify line downtime reasons.',
        merchActor
      );

      expect(rejected.status).toBe('rejected');
      expect(rejected.correctiveAction).toContain('Output below minimum threshold');
    });
  });

  describe('4. Schema Validation Layer', () => {
    it('rejects negative planned or actual quantities', () => {
      const invalidData = {
        orderId: 'TEST-ORDER-001',
        buyerOrganizationId: 'buyer-org-001',
        productionStageId: 'stage-sewing',
        stageKey: 'sewing',
        stageName: 'Sewing',
        productionDate: '2026-09-08',
        plannedQuantity: -100,
        actualQuantity: 500,
        status: 'draft' as const,
      };

      const result = createProductionUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects invalid production date formats', () => {
      const invalidData = {
        orderId: 'TEST-ORDER-001',
        buyerOrganizationId: 'buyer-org-001',
        productionStageId: 'stage-sewing',
        stageKey: 'sewing',
        stageName: 'Sewing',
        productionDate: '08/09/2026', // non YYYY-MM-DD
        plannedQuantity: 1000,
        actualQuantity: 1000,
        status: 'draft' as const,
      };

      const result = createProductionUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('5. Production Photo Management', () => {
    it('attaches and deletes production inspection photos', async () => {
      const photo = await uploadProductionPhoto(
        'TEST-ORDER-001',
        'prod-log-001',
        {
          caption: 'Collar attachment inspection test',
          url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7',
        },
        staffActor
      );

      expect(photo.id).toBeDefined();
      expect(photo.caption).toBe('Collar attachment inspection test');

      await deleteProductionPhoto(photo.id, staffActor);
    });
  });

  describe('6. Production Summary Aggregation', () => {
    it('aggregates order level metrics and stage completion', async () => {
      const summary = await getProductionSummary('TEST-ORDER-001', 10000, '2026-09-30');
      expect(summary.orderId).toBe('TEST-ORDER-001');
      expect(summary.orderQuantity).toBe(10000);
      expect(summary.completedQuantity).toBeGreaterThan(0);
      expect(summary.completionPercentage).toBeGreaterThan(0);
      expect(summary.stages.length).toBeGreaterThan(0);
    });
  });
});
