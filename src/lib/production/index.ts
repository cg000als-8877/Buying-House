import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isConfigured } from '@/lib/firebase/client';
import {
  ProductionStage,
  ProductionUpdate,
  ProductionPhoto,
  ProductionSummary,
} from '@/types/production';
import {
  calculateAchievementPercentage,
  calculateOverallCompletion,
  calculateRemainingQuantity,
  determineProductionHealth,
  aggregateStageSummaries,
} from './calculations';
import { CreateProductionUpdateInput, createProductionUpdateSchema } from '@/lib/validation/production.schema';
import { logSecurityEvent } from '@/lib/audit';

export * from './calculations';

// ============================================================================
// DEFAULT STAGES TEMPLATE
// ============================================================================

export const DEFAULT_STAGE_DEFINITIONS = [
  { key: 'fabric', name: 'Fabric & Yarn Sourcing', sequence: 1 },
  { key: 'cutting', name: 'Pattern & Cutting Floor', sequence: 2 },
  { key: 'embroidery', name: 'Printing & Embroidery', sequence: 3 },
  { key: 'sewing', name: 'Assembly & Sewing Lines', sequence: 4 },
  { key: 'washing', name: 'Garment Washing & Treatment', sequence: 5 },
  { key: 'finishing', name: 'Ironing & Finishing', sequence: 6 },
  { key: 'qc', name: 'AQL Quality Inspection', sequence: 7 },
  { key: 'packing', name: 'Carton Packing & Barcoding', sequence: 8 },
  { key: 'shipment', name: 'Ex-Factory & Port Dispatch', sequence: 9 },
];

export function generateDefaultStagesForOrder(orderId: string, orderQuantity: number = 5000): ProductionStage[] {
  const now = new Date().toISOString();
  return DEFAULT_STAGE_DEFINITIONS.map((def) => ({
    id: `stage-${orderId}-${def.key}`,
    stageId: `stage-${orderId}-${def.key}`,
    orderId,
    stageKey: def.key,
    stageName: def.name,
    name: def.name,
    sequence: def.sequence,
    enabled: true,
    plannedQuantity: orderQuantity,
    completedQuantity: 0,
    status: def.sequence === 1 ? 'in_progress' : 'not_started',
    createdAt: now,
    updatedAt: now,
  }));
}

// ============================================================================
// IN-MEMORY DEMO FIXTURES (For offline dev & tests)
// ============================================================================

export const TEST_PRODUCTION_STAGES: ProductionStage[] = [
  {
    id: 'stage-TEST-ORDER-001-fabric',
    orderId: 'TEST-ORDER-001',
    stageKey: 'fabric',
    stageName: 'Fabric & Yarn Sourcing',
    sequence: 1,
    enabled: true,
    plannedQuantity: 10000,
    completedQuantity: 10000,
    targetStartDate: '2026-08-01',
    targetEndDate: '2026-08-10',
    status: 'completed',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z',
  },
  {
    id: 'stage-TEST-ORDER-001-cutting',
    orderId: 'TEST-ORDER-001',
    stageKey: 'cutting',
    stageName: 'Pattern & Cutting Floor',
    sequence: 2,
    enabled: true,
    plannedQuantity: 10000,
    completedQuantity: 10000,
    targetStartDate: '2026-08-11',
    targetEndDate: '2026-08-18',
    status: 'completed',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-18T00:00:00Z',
  },
  {
    id: 'stage-TEST-ORDER-001-sewing',
    orderId: 'TEST-ORDER-001',
    stageKey: 'sewing',
    stageName: 'Assembly & Sewing Lines',
    sequence: 3,
    enabled: true,
    plannedQuantity: 10000,
    completedQuantity: 6200,
    targetStartDate: '2026-08-19',
    targetEndDate: '2026-09-12',
    status: 'in_progress',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-09-08T00:00:00Z',
  },
  {
    id: 'stage-TEST-ORDER-001-finishing',
    orderId: 'TEST-ORDER-001',
    stageKey: 'finishing',
    stageName: 'Ironing & Finishing',
    sequence: 4,
    enabled: true,
    plannedQuantity: 10000,
    completedQuantity: 0,
    targetStartDate: '2026-09-13',
    targetEndDate: '2026-09-22',
    status: 'not_started',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'stage-TEST-ORDER-001-qc',
    orderId: 'TEST-ORDER-001',
    stageKey: 'qc',
    stageName: 'AQL Quality Inspection',
    sequence: 5,
    enabled: true,
    plannedQuantity: 10000,
    completedQuantity: 0,
    targetStartDate: '2026-09-23',
    targetEndDate: '2026-09-26',
    status: 'not_started',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'stage-TEST-ORDER-001-packing',
    orderId: 'TEST-ORDER-001',
    stageKey: 'packing',
    stageName: 'Carton Packing & Barcoding',
    sequence: 6,
    enabled: true,
    plannedQuantity: 10000,
    completedQuantity: 0,
    targetStartDate: '2026-09-27',
    targetEndDate: '2026-09-30',
    status: 'not_started',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  },
];

export const TEST_PRODUCTION_UPDATES: ProductionUpdate[] = [
  {
    id: 'prod-log-001',
    orderId: 'TEST-ORDER-001',
    buyerOrganizationId: 'buyer-org-001',
    productionStageId: 'stage-TEST-ORDER-001-sewing',
    stageKey: 'sewing',
    stageName: 'Assembly & Sewing Lines',
    productionDate: '2026-09-06',
    plannedQuantity: 1500,
    actualQuantity: 1520,
    cumulativeQuantity: 3100,
    achievementPercent: 101.3,
    remarks: 'Line 4 and Line 5 operated at optimal output. Clean needle checks verified.',
    status: 'published',
    publishedAt: '2026-09-06T18:00:00Z',
    publishedBy: 'merch-001',
    createdBy: 'staff-admin-001',
    createdAt: '2026-09-06T16:00:00Z',
    updatedAt: '2026-09-06T18:00:00Z',
  },
  {
    id: 'prod-log-002',
    orderId: 'TEST-ORDER-001',
    buyerOrganizationId: 'buyer-org-001',
    productionStageId: 'stage-TEST-ORDER-001-sewing',
    stageKey: 'sewing',
    stageName: 'Assembly & Sewing Lines',
    productionDate: '2026-09-07',
    plannedQuantity: 1600,
    actualQuantity: 1580,
    cumulativeQuantity: 4680,
    achievementPercent: 98.8,
    remarks: 'Minor delay on collar attaching station. Resolved in 2nd shift.',
    status: 'published',
    publishedAt: '2026-09-07T18:00:00Z',
    publishedBy: 'merch-001',
    createdBy: 'staff-admin-001',
    createdAt: '2026-09-07T16:00:00Z',
    updatedAt: '2026-09-07T18:00:00Z',
  },
  {
    id: 'prod-log-003',
    orderId: 'TEST-ORDER-001',
    buyerOrganizationId: 'buyer-org-001',
    productionStageId: 'stage-TEST-ORDER-001-sewing',
    stageKey: 'sewing',
    stageName: 'Assembly & Sewing Lines',
    productionDate: '2026-09-08',
    plannedQuantity: 1600,
    actualQuantity: 1520,
    cumulativeQuantity: 6200,
    achievementPercent: 95.0,
    remarks: 'All 6 lines producing steadily. Daily target achieved within 5% tolerance.',
    issues: 'Needle inspection log completed at 14:00.',
    status: 'published',
    publishedAt: '2026-09-08T14:00:00Z',
    publishedBy: 'merch-001',
    createdBy: 'staff-admin-001',
    createdAt: '2026-09-08T13:30:00Z',
    updatedAt: '2026-09-08T14:00:00Z',
  },
  {
    id: 'prod-log-004-draft',
    orderId: 'TEST-ORDER-001',
    buyerOrganizationId: 'buyer-org-001',
    productionStageId: 'stage-TEST-ORDER-001-sewing',
    stageKey: 'sewing',
    stageName: 'Assembly & Sewing Lines',
    productionDate: '2026-09-08',
    plannedQuantity: 800,
    actualQuantity: 0,
    cumulativeQuantity: 6200,
    achievementPercent: 0,
    remarks: 'Evening shift draft log.',
    status: 'draft',
    createdBy: 'staff-admin-001',
    createdAt: '2026-09-08T15:00:00Z',
    updatedAt: '2026-09-08T15:00:00Z',
  },
];

export const TEST_PRODUCTION_PHOTOS: ProductionPhoto[] = [
  {
    id: 'photo-001',
    orderId: 'TEST-ORDER-001',
    productionUpdateId: 'prod-log-001',
    storagePath: '/orders/TEST-ORDER-001/photos/photo-001.jpg',
    url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80',
    caption: 'Line 4 sewing progression and collar seam check',
    uploadedBy: 'staff-admin-001',
    createdAt: '2026-09-06T16:00:00Z',
  },
  {
    id: 'photo-002',
    orderId: 'TEST-ORDER-001',
    productionUpdateId: 'prod-log-002',
    storagePath: '/orders/TEST-ORDER-001/photos/photo-002.jpg',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    caption: 'Inline QA needle detector and hem stitching check',
    uploadedBy: 'staff-admin-001',
    createdAt: '2026-09-07T16:00:00Z',
  },
];

const inMemoryStages: ProductionStage[] = [...TEST_PRODUCTION_STAGES];
const inMemoryUpdates: ProductionUpdate[] = [...TEST_PRODUCTION_UPDATES];
const inMemoryPhotos: ProductionPhoto[] = [...TEST_PRODUCTION_PHOTOS];

// ============================================================================
// PRODUCTION STAGES API
// ============================================================================

export async function getProductionStages(orderId: string): Promise<ProductionStage[]> {
  if (isConfigured && db) {
    try {
      const stagesRef = collection(db, 'orders', orderId, 'productionStages');
      const q = query(stagesRef, orderBy('sequence', 'asc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            stageId: docSnap.id,
            orderId,
            stageKey: d.stageKey || 'stage',
            stageName: d.stageName || d.name || 'Stage',
            name: d.stageName || d.name || 'Stage',
            sequence: d.sequence || 1,
            enabled: d.enabled ?? true,
            plannedQuantity: d.plannedQuantity || 0,
            completedQuantity: d.completedQuantity || 0,
            targetStartDate: d.targetStartDate || null,
            targetEndDate: d.targetEndDate || d.targetDate || null,
            targetDate: d.targetEndDate || d.targetDate || null,
            status: d.status || 'not_started',
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || new Date().toISOString(),
            updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || new Date().toISOString(),
          };
        });
      }
    } catch (error) {
      console.warn(`[Firestore] Error fetching stages for ${orderId}:`, error);
    }
  }

  const matches = inMemoryStages.filter((s) => s.orderId === orderId);
  if (matches.length > 0) {
    return matches.sort((a, b) => a.sequence - b.sequence);
  }

  return generateDefaultStagesForOrder(orderId);
}

export async function saveProductionStages(
  orderId: string,
  stages: ProductionStage[],
  actor: { uid: string; role: string }
): Promise<void> {
  const now = new Date().toISOString();

  // Update in-memory state
  const otherStages = inMemoryStages.filter((s) => s.orderId !== orderId);
  stages.forEach((s) => {
    otherStages.push({
      ...s,
      orderId,
      updatedAt: now,
    });
  });
  inMemoryStages.length = 0;
  inMemoryStages.push(...otherStages);

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'PRODUCTION_STAGES_CONFIGURED',
    entityId: orderId,
    after: { stageCount: stages.length },
  });

  if (isConfigured && db) {
    try {
      for (const stage of stages) {
        const stageRef = doc(db, 'orders', orderId, 'productionStages', stage.id);
        await setDoc(
          stageRef,
          {
            stageKey: stage.stageKey,
            stageName: stage.stageName,
            sequence: stage.sequence,
            enabled: stage.enabled,
            plannedQuantity: stage.plannedQuantity,
            completedQuantity: stage.completedQuantity,
            targetStartDate: stage.targetStartDate || null,
            targetEndDate: stage.targetEndDate || null,
            status: stage.status,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.error(`[Firestore] Error saving production stages for ${orderId}:`, err);
    }
  }
}

// ============================================================================
// PRODUCTION UPDATES (DAILY FLOOR LOGS) API
// ============================================================================

/**
 * Retrieves all production updates for an order (Internal Staff view).
 * Returns all drafts, submitted, published, and rejected records.
 */
export async function getProductionUpdates(orderId: string): Promise<ProductionUpdate[]> {
  if (isConfigured && db) {
    try {
      const logsRef = collection(db, 'productionUpdates');
      const q = query(logsRef, where('orderId', '==', orderId), orderBy('productionDate', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            orderId: d.orderId,
            buyerOrganizationId: d.buyerOrganizationId,
            productionStageId: d.productionStageId || d.stageId,
            stageId: d.productionStageId || d.stageId,
            stageKey: d.stageKey,
            stageName: d.stageName,
            productionDate: d.productionDate || d.date,
            date: d.productionDate || d.date,
            plannedQuantity: d.plannedQuantity || 0,
            actualQuantity: d.actualQuantity || 0,
            cumulativeQuantity: d.cumulativeQuantity || 0,
            achievementPercent: d.achievementPercent || d.achievementPercentage || 0,
            achievementPercentage: d.achievementPercent || d.achievementPercentage || 0,
            remarks: d.remarks || '',
            issues: d.issues || '',
            correctiveAction: d.correctiveAction || '',
            status: d.status || 'draft',
            publishedAt: d.publishedAt || null,
            publishedBy: d.publishedBy || null,
            createdBy: d.createdBy || 'system',
            updatedBy: d.updatedBy || null,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || new Date().toISOString(),
            updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || new Date().toISOString(),
          };
        });
      }
    } catch (error) {
      console.warn(`[Firestore] Error fetching production updates for ${orderId}:`, error);
    }
  }

  return inMemoryUpdates
    .filter((u) => u.orderId === orderId)
    .sort((a, b) => new Date(b.productionDate || b.date || 0).getTime() - new Date(a.productionDate || a.date || 0).getTime());
}

/**
 * Retrieves PUBLISHED production updates for an authorized buyer.
 * Strictly enforces tenant boundary (buyerOrganizationId) and publication status ('published').
 */
export async function getPublishedProductionUpdatesForBuyer(
  orderId: string,
  buyerOrganizationId: string
): Promise<ProductionUpdate[]> {
  if (isConfigured && db) {
    try {
      const logsRef = collection(db, 'productionUpdates');
      const q = query(
        logsRef,
        where('orderId', '==', orderId),
        where('buyerOrganizationId', '==', buyerOrganizationId),
        where('status', '==', 'published'),
        orderBy('productionDate', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          orderId: d.orderId,
          buyerOrganizationId: d.buyerOrganizationId,
          productionStageId: d.productionStageId || d.stageId,
          stageKey: d.stageKey,
          stageName: d.stageName,
          productionDate: d.productionDate || d.date,
          plannedQuantity: d.plannedQuantity || 0,
          actualQuantity: d.actualQuantity || 0,
          cumulativeQuantity: d.cumulativeQuantity || 0,
          achievementPercent: d.achievementPercent || 0,
          remarks: d.remarks || '',
          status: 'published',
          publishedAt: d.publishedAt || null,
          publishedBy: d.publishedBy || null,
          createdBy: d.createdBy,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt,
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt,
        };
      });
    } catch (error) {
      console.warn(`[Firestore] Error fetching published buyer updates for ${orderId}:`, error);
    }
  }

  // Filter in-memory demo data with strict tenant isolation
  return inMemoryUpdates
    .filter(
      (u) =>
        u.orderId === orderId &&
        u.buyerOrganizationId === buyerOrganizationId &&
        u.status === 'published'
    )
    .sort((a, b) => new Date(b.productionDate || b.date || 0).getTime() - new Date(a.productionDate || a.date || 0).getTime());
}

/**
 * Retrieves a single production log by ID.
 */
export async function getProductionUpdateById(id: string): Promise<ProductionUpdate | null> {
  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'productionUpdates', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          orderId: d.orderId,
          buyerOrganizationId: d.buyerOrganizationId,
          productionStageId: d.productionStageId || d.stageId,
          stageKey: d.stageKey,
          stageName: d.stageName,
          productionDate: d.productionDate || d.date,
          plannedQuantity: d.plannedQuantity || 0,
          actualQuantity: d.actualQuantity || 0,
          cumulativeQuantity: d.cumulativeQuantity || 0,
          achievementPercent: d.achievementPercent || 0,
          remarks: d.remarks || '',
          issues: d.issues || '',
          correctiveAction: d.correctiveAction || '',
          status: d.status,
          publishedAt: d.publishedAt || null,
          publishedBy: d.publishedBy || null,
          createdBy: d.createdBy,
          updatedBy: d.updatedBy || null,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt,
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt,
        };
      }
    } catch (err) {
      console.error(`[Firestore] Error fetching production log ${id}:`, err);
    }
  }

  return inMemoryUpdates.find((u) => u.id === id) || null;
}

/**
 * Creates a new daily production update record.
 */
export async function createProductionUpdate(
  input: CreateProductionUpdateInput,
  actor: { uid: string; role: string }
): Promise<ProductionUpdate> {
  const validated = createProductionUpdateSchema.parse(input);
  const now = new Date().toISOString();

  const achievementPercent = calculateAchievementPercentage(
    validated.actualQuantity,
    validated.plannedQuantity
  );

  // Compute cumulative count including historical records
  const existingUpdates = await getProductionUpdates(validated.orderId);
  const stageUpdates = existingUpdates.filter(
    (u) => (u.productionStageId === validated.productionStageId || u.stageId === validated.productionStageId) && u.status !== 'rejected'
  );
  const previousSum = stageUpdates.reduce((sum, u) => sum + (u.actualQuantity || 0), 0);
  const cumulativeQuantity = previousSum + validated.actualQuantity;

  const newUpdate: ProductionUpdate = {
    id: `prod-log-${Date.now().toString(36)}`,
    orderId: validated.orderId,
    buyerOrganizationId: validated.buyerOrganizationId,
    productionStageId: validated.productionStageId,
    stageId: validated.productionStageId,
    stageKey: validated.stageKey,
    stageName: validated.stageName,
    productionDate: validated.productionDate,
    date: validated.productionDate,
    plannedQuantity: validated.plannedQuantity,
    actualQuantity: validated.actualQuantity,
    cumulativeQuantity,
    achievementPercent,
    achievementPercentage: achievementPercent,
    remarks: validated.remarks || '',
    issues: validated.issues || '',
    correctiveAction: validated.correctiveAction || '',
    status: validated.status,
    publishedAt: validated.status === 'published' ? now : undefined,
    publishedBy: validated.status === 'published' ? actor.uid : undefined,
    createdBy: actor.uid,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryUpdates.unshift(newUpdate);

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'PRODUCTION_UPDATE_CREATED',
    entityId: newUpdate.id,
    after: {
      orderId: newUpdate.orderId,
      stageName: newUpdate.stageName,
      actualQuantity: newUpdate.actualQuantity,
      status: newUpdate.status,
    },
  });

  if (isConfigured && db) {
    try {
      const logsRef = collection(db, 'productionUpdates');
      await setDoc(doc(logsRef, newUpdate.id), {
        ...newUpdate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Firestore] Error creating production log:', err);
    }
  }

  return newUpdate;
}

/**
 * Updates an existing production log.
 */
export async function updateProductionUpdate(
  id: string,
  data: Partial<ProductionUpdate>,
  actor: { uid: string; role: string }
): Promise<ProductionUpdate> {
  const existing = await getProductionUpdateById(id);
  if (!existing) {
    throw new Error(`Production update with ID ${id} not found.`);
  }

  const now = new Date().toISOString();
  const actual = data.actualQuantity !== undefined ? data.actualQuantity : existing.actualQuantity;
  const planned = data.plannedQuantity !== undefined ? data.plannedQuantity : existing.plannedQuantity;
  const achievementPercent = calculateAchievementPercentage(actual, planned);

  const updated: ProductionUpdate = {
    ...existing,
    ...data,
    actualQuantity: actual,
    plannedQuantity: planned,
    achievementPercent,
    achievementPercentage: achievementPercent,
    updatedBy: actor.uid,
    updatedAt: now,
  };

  const idx = inMemoryUpdates.findIndex((u) => u.id === id);
  if (idx !== -1) {
    inMemoryUpdates[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'PRODUCTION_UPDATE_EDITED',
    entityId: id,
    before: { actualQuantity: existing.actualQuantity, status: existing.status },
    after: { actualQuantity: updated.actualQuantity, status: updated.status },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'productionUpdates', id);
      await updateDoc(docRef, {
        ...data,
        actualQuantity: actual,
        plannedQuantity: planned,
        achievementPercent,
        updatedBy: actor.uid,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(`[Firestore] Error updating production log ${id}:`, err);
    }
  }

  return updated;
}

/**
 * Submits a draft production log for merchandiser review.
 */
export async function submitProductionUpdate(
  id: string,
  actor: { uid: string; role: string }
): Promise<ProductionUpdate> {
  return updateProductionUpdate(
    id,
    { status: 'submitted' },
    actor
  );
}

/**
 * Publishes a production update, making it live for authorized buyers.
 */
export async function publishProductionUpdate(
  id: string,
  actor: { uid: string; role: string }
): Promise<ProductionUpdate> {
  const now = new Date().toISOString();
  const updated = await updateProductionUpdate(
    id,
    {
      status: 'published',
      publishedAt: now,
      publishedBy: actor.uid,
    },
    actor
  );

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'PRODUCTION_UPDATE_PUBLISHED',
    entityId: id,
    after: { publishedAt: now, publishedBy: actor.uid },
  });

  return updated;
}

/**
 * Rejects a submitted production update with feedback.
 */
export async function rejectProductionUpdate(
  id: string,
  reason: string,
  actor: { uid: string; role: string }
): Promise<ProductionUpdate> {
  const updated = await updateProductionUpdate(
    id,
    {
      status: 'rejected',
      correctiveAction: reason,
    },
    actor
  );

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'PRODUCTION_UPDATE_REJECTED',
    entityId: id,
    after: { rejectionReason: reason },
  });

  return updated;
}

// ============================================================================
// PRODUCTION PHOTOS API
// ============================================================================

export async function getProductionPhotos(orderId: string, updateId?: string): Promise<ProductionPhoto[]> {
  if (isConfigured && db) {
    try {
      const photosRef = collection(db, 'productionPhotos');
      let q = query(photosRef, where('orderId', '==', orderId), orderBy('createdAt', 'desc'));
      if (updateId) {
        q = query(photosRef, where('orderId', '==', orderId), where('productionUpdateId', '==', updateId));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          orderId: d.orderId,
          productionUpdateId: d.productionUpdateId,
          storagePath: d.storagePath,
          thumbnailPath: d.thumbnailPath || null,
          url: d.url || null,
          caption: d.caption || '',
          uploadedBy: d.uploadedBy,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || new Date().toISOString(),
        };
      });
    } catch (err) {
      console.warn(`[Firestore] Error fetching photos for order ${orderId}:`, err);
    }
  }

  return inMemoryPhotos.filter((p) => {
    if (updateId) return p.orderId === orderId && p.productionUpdateId === updateId;
    return p.orderId === orderId;
  });
}

export async function uploadProductionPhoto(
  orderId: string,
  productionUpdateId: string,
  photoMeta: { caption?: string; storagePath?: string; url?: string },
  actor: { uid: string; role: string }
): Promise<ProductionPhoto> {
  const now = new Date().toISOString();
  const newPhoto: ProductionPhoto = {
    id: `photo-${Date.now().toString(36)}`,
    orderId,
    productionUpdateId,
    storagePath: photoMeta.storagePath || `/orders/${orderId}/photos/${Date.now()}.jpg`,
    url: photoMeta.url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    caption: photoMeta.caption || '',
    uploadedBy: actor.uid,
    createdAt: now,
  };

  inMemoryPhotos.unshift(newPhoto);

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'PRODUCTION_PHOTO_UPLOADED',
    entityId: newPhoto.id,
    after: { orderId, productionUpdateId, caption: newPhoto.caption },
  });

  if (isConfigured && db) {
    try {
      const photosRef = collection(db, 'productionPhotos');
      await setDoc(doc(photosRef, newPhoto.id), {
        ...newPhoto,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Firestore] Error saving photo record:', err);
    }
  }

  return newPhoto;
}

export async function deleteProductionPhoto(
  photoId: string,
  actor: { uid: string; role: string }
): Promise<void> {
  const idx = inMemoryPhotos.findIndex((p) => p.id === photoId);
  if (idx !== -1) {
    inMemoryPhotos.splice(idx, 1);
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'PRODUCTION_PHOTO_DELETED',
    entityId: photoId,
  });
}

// ============================================================================
// PRODUCTION SUMMARY & KPIS
// ============================================================================

export async function getProductionSummary(
  orderId: string,
  orderQuantity: number = 5000,
  exFactoryDate?: string
): Promise<ProductionSummary> {
  const [stages, updates] = await Promise.all([
    getProductionStages(orderId),
    getProductionUpdates(orderId),
  ]);

  const stageSummaries = aggregateStageSummaries(stages, updates);

  // Completed quantity is defined by the latest active or packing/shipment stage
  const packingOrSewingStage =
    stageSummaries.find((s) => s.stageKey === 'packing' || s.stageKey === 'sewing') ||
    stageSummaries[stageSummaries.length - 1];

  const completedQuantity = packingOrSewingStage ? packingOrSewingStage.cumulativeQuantity : 0;
  const remainingQuantity = calculateRemainingQuantity(orderQuantity, completedQuantity);
  const completionPercentage = calculateOverallCompletion(completedQuantity, orderQuantity);

  // Determine current active stage
  const activeStage =
    stageSummaries.find((s) => s.status === 'in_progress' || s.status === 'delayed') ||
    stageSummaries.find((s) => s.status === 'not_started') ||
    stageSummaries[stageSummaries.length - 1];

  let daysRemaining: number | undefined;
  if (exFactoryDate) {
    const exDate = new Date(exFactoryDate).getTime();
    daysRemaining = Math.ceil((exDate - Date.now()) / (1000 * 60 * 60 * 24));
  }

  const latestUpdate = updates[0];
  const healthStatus = determineProductionHealth(completionPercentage, exFactoryDate);

  return {
    orderId,
    orderQuantity,
    completedQuantity,
    remainingQuantity,
    completionPercentage,
    currentStageKey: activeStage ? activeStage.stageKey : 'fabric',
    currentStageName: activeStage ? activeStage.stageName : 'Fabric Sourcing',
    status: healthStatus,
    daysRemaining,
    lastUpdateDate: latestUpdate ? (latestUpdate.productionDate || latestUpdate.date) : undefined,
    stages: stageSummaries,
  };
}

export async function getAdminProductionKpis() {
  const updates = inMemoryUpdates;
  const today = new Date().toISOString().split('T')[0];

  const updatesToday = updates.filter(
    (u) => (u.productionDate || u.date) === today
  ).length;

  const ordersInProduction = new Set(
    updates.filter((u) => u.status === 'published' || u.status === 'submitted').map((u) => u.orderId)
  ).size;

  return {
    ordersInProduction: Math.max(1, ordersInProduction),
    updatesToday,
    delayedStages: 0,
    ordersAtRisk: 0,
  };
}
