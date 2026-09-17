import {
  Inspection,
  InspectionType,
  InspectionStatus,
  InspectionResult,
  DefectItem,
  CorrectiveAction,
  LabTestReport,
  LabTestCategory,
  AQLConfig,
  QualitySummaryMetrics,
} from '@/types/quality';
import { db, isConfigured } from '@/lib/firebase/client';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { logSecurityEvent } from '@/lib/audit';
import { hasPermission } from '@/lib/auth/permissions';
import { normalizeBuyerOrgId } from '@/lib/auth/session';
import { UserRole } from '@/types/auth';
import {
  CreateInspectionInput,
  DefectItemInput,
  CorrectiveActionInput,
  LabTestReportInput,
  createInspectionSchema,
  defectItemSchema,
  correctiveActionSchema,
  labTestReportSchema,
} from '@/lib/validation/quality.schema';
import { calculateAQLResult, getSampleSize } from './calculations';

export const DEFAULT_QUALITY_CONFIG: AQLConfig = {
  defaultLevel: 'GII',
  majorAQL: 2.5,
  minorAQL: 4.0,
  criticalAQL: 0.0,
  allowConditionalMinor: true,
};

let inMemoryQualityConfig: AQLConfig = { ...DEFAULT_QUALITY_CONFIG };

export const TEST_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-001',
    orderId: 'TEST-ORDER-001',
    orderNumber: 'PO-2026-0891',
    styleNumber: 'STY-KNIT-401',
    buyerOrganizationId: 'buyer-org-001',
    factoryId: 'FAC-001',
    inspectionType: 'INLINE',
    inspectionDate: '2026-09-02',
    inspectorId: 'qc-staff-001',
    inspectorName: 'Mahmudur Rahman (Lead QA)',
    inspectionStatus: 'completed',
    orderQuantity: 10000,
    inspectedQuantity: 200,
    sampleSize: 200,
    aqlLevel: 'GII',
    aqlMajor: 2.5,
    aqlMinor: 4.0,
    criticalDefects: 0,
    majorDefects: 3,
    minorDefects: 7,
    totalDefects: 10,
    maxAllowedMajor: 10,
    maxAllowedMinor: 14,
    result: 'PASS',
    defects: [
      {
        id: 'def-001',
        inspectionId: 'insp-001',
        category: 'Workmanship',
        severity: 'MAJOR',
        quantity: 2,
        location: 'Collar Rib Joint',
        description: 'Uneven neck rib seam tension (+2mm variance)',
      },
      {
        id: 'def-002',
        inspectionId: 'insp-001',
        category: 'Cleanliness / Spots',
        severity: 'MINOR',
        quantity: 4,
        location: 'Left Chest',
        description: 'Minor chalk marking easily removable with steam',
      },
      {
        id: 'def-003',
        inspectionId: 'insp-001',
        category: 'Measurement',
        severity: 'MAJOR',
        quantity: 1,
        location: 'Body Length',
        description: 'Body length +1.5cm over tolerance on Size L',
      },
      {
        id: 'def-004',
        inspectionId: 'insp-001',
        category: 'Trims / Accessories',
        severity: 'MINOR',
        quantity: 3,
        location: 'Care Label',
        description: 'Care label stitched 3mm skewed from side seam',
      },
    ],
    remarks: 'Inline assembly inspection passed. Line 4 sewing tension adjusted immediately.',
    internalNotes: 'Internal QC station 2 was retrained on collar attachment alignment.',
    reinspectionRequired: false,
    published: true,
    publishedAt: '2026-09-02T14:30:00Z',
    publishedBy: 'merch-001',
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-02T14:30:00Z',
  },
  {
    id: 'insp-002',
    orderId: 'TEST-ORDER-001',
    orderNumber: 'PO-2026-0891',
    styleNumber: 'STY-KNIT-401',
    buyerOrganizationId: 'buyer-org-001',
    factoryId: 'FAC-001',
    inspectionType: 'FINAL_RANDOM',
    inspectionDate: '2026-09-06',
    inspectorId: 'qc-staff-002',
    inspectorName: 'Anisul Hoque (Senior Auditor)',
    inspectionStatus: 'completed',
    orderQuantity: 10000,
    inspectedQuantity: 200,
    sampleSize: 200,
    aqlLevel: 'GII',
    aqlMajor: 2.5,
    aqlMinor: 4.0,
    criticalDefects: 0,
    majorDefects: 4,
    minorDefects: 6,
    totalDefects: 10,
    maxAllowedMajor: 10,
    maxAllowedMinor: 14,
    result: 'PASS',
    defects: [
      {
        id: 'def-005',
        inspectionId: 'insp-002',
        category: 'Measurement',
        severity: 'MAJOR',
        quantity: 3,
        location: 'Chest Width',
        description: 'Chest circumference +1cm tolerance variance on size M',
      },
      {
        id: 'def-006',
        inspectionId: 'insp-002',
        category: 'Packaging / Labeling',
        severity: 'MINOR',
        quantity: 6,
        location: 'Barcode Hangtag',
        description: 'Polybag sticker offset 5mm from bottom right corner',
      },
      {
        id: 'def-007',
        inspectionId: 'insp-002',
        category: 'Workmanship',
        severity: 'MAJOR',
        quantity: 1,
        location: 'Bottom Hem',
        description: 'Skip stitch on lower hem (repaired on spot)',
      },
    ],
    remarks: 'Final Random Inspection (FRI) conducted under ISO 2859-1 Level II. Passed AQL 2.5/4.0 standards.',
    internalNotes: 'Carton drop test (10-point ISTA 1A) verified without damage.',
    reinspectionRequired: false,
    published: true,
    publishedAt: '2026-09-06T16:00:00Z',
    publishedBy: 'staff-admin-001',
    createdAt: '2026-09-06T11:00:00Z',
    updatedAt: '2026-09-06T16:00:00Z',
  },
  {
    id: 'insp-003',
    orderId: 'TEST-ORDER-002',
    orderNumber: 'PO-2026-0902',
    styleNumber: 'STY-DENIM-502',
    buyerOrganizationId: 'buyer-org-002',
    factoryId: 'FAC-002',
    inspectionType: 'MIDLINE',
    inspectionDate: '2026-09-05',
    inspectorId: 'qc-staff-001',
    inspectorName: 'Mahmudur Rahman',
    inspectionStatus: 'completed',
    orderQuantity: 5000,
    inspectedQuantity: 200,
    sampleSize: 200,
    aqlLevel: 'GII',
    aqlMajor: 2.5,
    aqlMinor: 4.0,
    criticalDefects: 0,
    majorDefects: 12,
    minorDefects: 16,
    totalDefects: 28,
    maxAllowedMajor: 10,
    maxAllowedMinor: 14,
    result: 'FAIL',
    defects: [
      {
        id: 'def-008',
        inspectionId: 'insp-003',
        category: 'Color / Shade',
        severity: 'MAJOR',
        quantity: 8,
        location: 'Back Pocket Wash',
        description: 'Shade variation across different dye lots on enzyme wash',
      },
      {
        id: 'def-009',
        inspectionId: 'insp-003',
        category: 'Workmanship',
        severity: 'MAJOR',
        quantity: 4,
        location: 'Waistband Stitches',
        description: 'Broken twin-needle chain stitch on rear waistband',
      },
    ],
    remarks: 'Failed AQL 2.5 Major threshold. 100% sorting required on washing shade bands.',
    internalNotes: 'Factory laundry master requested to re-calibrate batch recipe.',
    correctiveAction: {
      id: 'cap-001',
      inspectionId: 'insp-003',
      orderId: 'TEST-ORDER-002',
      issueDescription: 'Shade variation exceeding tolerance on back pockets.',
      rootCause: 'Washing machine temperature fluctuation during enzymatic treatment.',
      actionRequired: '100% shade grouping and re-wash off-tone panels.',
      responsibleParty: 'Factory Laundry Lead (Mr. K. Alam)',
      dueDate: '2026-09-12',
      status: 'in_progress',
      createdAt: '2026-09-05T14:00:00Z',
      updatedAt: '2026-09-05T14:00:00Z',
    },
    reinspectionRequired: true,
    published: false,
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-09-05T14:00:00Z',
  },
  {
    id: 'insp-004',
    orderId: 'TEST-ORDER-005',
    orderNumber: 'PO-2026-0925',
    styleNumber: 'STY-ACT-305',
    buyerOrganizationId: 'buyer-org-003',
    factoryId: 'fac-unit-activewear',
    inspectionType: 'INLINE',
    inspectionDate: '2026-09-07',
    inspectorId: 'qc-staff-001',
    inspectorName: 'Mahmudur Rahman (Lead QA)',
    inspectionStatus: 'completed',
    orderQuantity: 15000,
    inspectedQuantity: 315,
    sampleSize: 315,
    aqlLevel: 'GII',
    aqlMajor: 2.5,
    aqlMinor: 4.0,
    criticalDefects: 0,
    majorDefects: 5,
    minorDefects: 8,
    totalDefects: 13,
    maxAllowedMajor: 14,
    maxAllowedMinor: 21,
    result: 'PASS',
    defects: [
      {
        id: 'def-010',
        inspectionId: 'insp-004',
        category: 'Workmanship',
        severity: 'MAJOR',
        quantity: 3,
        location: 'Flatlock Inseam',
        description: 'Minor loose thread loop on 4-needle flatlock seam',
      },
      {
        id: 'def-011',
        inspectionId: 'insp-004',
        category: 'Measurement',
        severity: 'MAJOR',
        quantity: 2,
        location: 'Waistband Elasticity',
        description: 'Waistband recovery test +0.8cm from nominal specification',
      },
    ],
    remarks: 'Activewear compression fit meets high stretch elasticity recovery thresholds. Flatlock tension calibrated.',
    reinspectionRequired: false,
    published: true,
    publishedAt: '2026-09-07T16:00:00Z',
    publishedBy: 'merch-001',
    createdAt: '2026-09-07T10:00:00Z',
    updatedAt: '2026-09-07T16:00:00Z',
  },
  {
    id: 'insp-005',
    orderId: 'TEST-ORDER-007',
    orderNumber: 'PO-2026-0801',
    styleNumber: 'STY-OUT-990',
    buyerOrganizationId: 'buyer-org-005',
    factoryId: 'fac-unit-outerwear',
    inspectionType: 'FINAL_RANDOM',
    inspectionDate: '2026-09-08',
    inspectorId: 'qc-staff-002',
    inspectorName: 'Anisul Hoque (Senior Auditor)',
    inspectionStatus: 'completed',
    orderQuantity: 3800,
    inspectedQuantity: 125,
    sampleSize: 125,
    aqlLevel: 'GII',
    aqlMajor: 2.5,
    aqlMinor: 4.0,
    criticalDefects: 0,
    majorDefects: 2,
    minorDefects: 4,
    totalDefects: 6,
    maxAllowedMajor: 7,
    maxAllowedMinor: 10,
    result: 'PASS',
    defects: [
      {
        id: 'def-012',
        inspectionId: 'insp-005',
        category: 'Workmanship',
        severity: 'MAJOR',
        quantity: 2,
        location: 'Waterproof Zipper Garage',
        description: 'Zipper garage tape misalignment (1.5mm variance)',
      },
    ],
    remarks: 'Hydrostatic water column test (>15,000mm H2O) passed on all 125 sample units. Taped seams verified 100% leak-proof.',
    reinspectionRequired: false,
    published: true,
    publishedAt: '2026-09-08T15:30:00Z',
    publishedBy: 'staff-admin-001',
    createdAt: '2026-09-08T11:00:00Z',
    updatedAt: '2026-09-08T15:30:00Z',
  },
];

export const TEST_LAB_REPORTS: LabTestReport[] = [
  {
    id: 'lab-001',
    reportNumber: 'LAB-2026-BD-8801',
    testCategory: 'Color Fastness',
    labName: 'Bureau Veritas Consumer Products Services (Dhaka Lab)',
    reportDate: '2026-09-01',
    sampleReference: 'Bulk Production Fabric (Lot #BF-44)',
    orderId: 'TEST-ORDER-001',
    orderNumber: 'PO-2026-0891',
    buyerOrganizationId: 'buyer-org-001',
    documentId: 'doc-lab-001',
    documentUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
    fileName: 'Color_Fastness_Test_Report_PO8801.pdf',
    result: 'PASS',
    status: 'active',
    verificationStatus: 'VERIFIED',
    visibility: 'buyer',
    remarks: 'Grade 4-5 Color Fastness to Washing (ISO 105-C06) and Rubbing (ISO 105-X12). Meets buyer standard.',
    testParameters: [
      { parameter: 'Color Fastness to Washing (Color Change)', standard: 'ISO 105-C06', result: 'Grade 4-5 (Min 4.0)', pass: true },
      { parameter: 'Color Fastness to Washing (Staining Cotton)', standard: 'ISO 105-C06', result: 'Grade 4.5 (Min 4.0)', pass: true },
      { parameter: 'Color Fastness to Rubbing (Dry)', standard: 'ISO 105-X12', result: 'Grade 4-5 (Min 4.0)', pass: true },
      { parameter: 'Color Fastness to Rubbing (Wet)', standard: 'ISO 105-X12', result: 'Grade 3-4 (Min 3.0)', pass: true },
    ],
    published: true,
    publishedAt: '2026-09-01T15:00:00Z',
    publishedBy: 'merch-001',
    createdAt: '2026-09-01T12:00:00Z',
    updatedAt: '2026-09-01T15:00:00Z',
  },
  {
    id: 'lab-002',
    reportNumber: 'LAB-2026-SGS-9902',
    testCategory: 'Shrinkage',
    labName: 'SGS Bangladesh Ltd. (Testing Center)',
    reportDate: '2026-09-03',
    sampleReference: 'Knit Single Jersey 100% Organic Cotton',
    orderId: 'TEST-ORDER-001',
    orderNumber: 'PO-2026-0891',
    buyerOrganizationId: 'buyer-org-001',
    documentId: 'doc-lab-002',
    documentUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
    fileName: 'Dimensional_Stability_Report_PO8801.pdf',
    result: 'PASS',
    status: 'active',
    verificationStatus: 'VERIFIED',
    visibility: 'buyer',
    remarks: 'Dimensional stability to home laundering: Length -2.2%, Width -1.8%. Tolerance: ±4.0%.',
    testParameters: [
      { parameter: 'Lengthwise Shrinkage (3 Cycles)', standard: 'ISO 6330', result: '-2.2% (Max -4.0%)', pass: true },
      { parameter: 'Widthwise Shrinkage (3 Cycles)', standard: 'ISO 6330', result: '-1.8% (Max -4.0%)', pass: true },
      { parameter: 'Spirality / Torque after washing', standard: 'ISO 16322', result: '1.2% (Max 3.0%)', pass: true },
    ],
    published: true,
    publishedAt: '2026-09-03T16:30:00Z',
    publishedBy: 'merch-001',
    createdAt: '2026-09-03T14:00:00Z',
    updatedAt: '2026-09-03T16:30:00Z',
  },
  {
    id: 'lab-003',
    reportNumber: 'LAB-2026-ITS-1104',
    testCategory: 'Restricted Substance Testing',
    labName: 'Intertek Bangladesh (Consumer Goods Lab)',
    reportDate: '2026-09-04',
    sampleReference: 'Metal Shank Buttons & Zipper Pullers',
    orderId: 'TEST-ORDER-002',
    orderNumber: 'PO-2026-0902',
    buyerOrganizationId: 'buyer-org-002',
    documentId: 'doc-lab-003',
    documentUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
    fileName: 'OEKO_TEX_RSL_Chemical_Report.pdf',
    result: 'PASS',
    status: 'active',
    verificationStatus: 'VERIFIED',
    visibility: 'buyer',
    remarks: 'Lead, Cadmium, and Nickel release under detection limits according to REACH Annex XVII.',
    testParameters: [
      { parameter: 'Total Lead Content', standard: 'CPSC-CH-E1001-08', result: 'Not Detected (< 10 ppm)', pass: true },
      { parameter: 'Total Cadmium Content', standard: 'EN 1122', result: 'Not Detected (< 5 ppm)', pass: true },
      { parameter: 'Nickel Release', standard: 'EN 1811:2011+A1:2015', result: '< 0.1 ug/cm²/week (Pass)', pass: true },
    ],
    published: false,
    createdAt: '2026-09-04T10:00:00Z',
    updatedAt: '2026-09-04T10:00:00Z',
  },
  {
    id: 'lab-004',
    reportNumber: 'LAB-2026-TUV-7719',
    testCategory: 'Tensile Strength',
    labName: 'TUV SUD Bangladesh Product Testing Lab',
    reportDate: '2026-09-06',
    sampleReference: '3-Layer Membrane Bonded Ripstop Fabric',
    orderId: 'TEST-ORDER-007',
    orderNumber: 'PO-2026-0801',
    buyerOrganizationId: 'buyer-org-005',
    documentId: 'doc-lab-004',
    documentUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
    fileName: 'Tensile_Tear_Strength_PO801.pdf',
    result: 'PASS',
    status: 'active',
    verificationStatus: 'VERIFIED',
    visibility: 'buyer',
    remarks: 'Tensile strength Warp: 850N, Weft: 790N. Tear resistance exceeds ISO 13937-2 standards.',
    testParameters: [
      { parameter: 'Tensile Strength (Warp)', standard: 'ISO 13934-1', result: '850 N (Min 600 N)', pass: true },
      { parameter: 'Tensile Strength (Weft)', standard: 'ISO 13934-1', result: '790 N (Min 550 N)', pass: true },
      { parameter: 'Hydrostatic Head Pressure', standard: 'ISO 811', result: '16,200 mm H2O (Min 10,000)', pass: true },
    ],
    published: true,
    publishedAt: '2026-09-06T17:00:00Z',
    publishedBy: 'merch-001',
    createdAt: '2026-09-06T14:00:00Z',
    updatedAt: '2026-09-06T17:00:00Z',
  },
];

const inMemoryInspections = [...TEST_INSPECTIONS];
const inMemoryLabReports = [...TEST_LAB_REPORTS];

export interface InspectionFilters {
  orderId?: string | 'ALL';
  buyerOrganizationId?: string | 'ALL';
  factoryId?: string | 'ALL';
  inspectionType?: InspectionType | 'ALL';
  result?: InspectionResult | 'ALL';
  inspectionStatus?: InspectionStatus | 'ALL';
  published?: boolean | 'ALL';
  searchQuery?: string;
}

/**
 * Retrieves global quality configuration.
 */
export async function getQualityConfig(): Promise<AQLConfig> {
  return { ...inMemoryQualityConfig };
}

/**
 * Updates global quality configuration. Restricted to Super Admin and Admin.
 */
export async function updateQualityConfig(
  newConfig: Partial<AQLConfig>,
  actor: { uid: string; role: string }
): Promise<AQLConfig> {
  if (!hasPermission(actor.role as UserRole, 'quality.configure')) {
    throw new Error('Access Denied: You do not have permission to modify quality configuration.');
  }

  inMemoryQualityConfig = {
    ...inMemoryQualityConfig,
    ...newConfig,
  };

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'INSPECTION_UPDATED',
    entityId: 'quality-config',
    after: { ...inMemoryQualityConfig },
  });

  return inMemoryQualityConfig;
}

/**
 * Retrieves all inspections for staff operations with comprehensive filtering.
 */
export async function getInspections(
  filters?: InspectionFilters,
  _actor?: { uid: string; role: string }
): Promise<Inspection[]> {
  let results = [...inMemoryInspections];

  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'inspections'));
      if (!snap.empty) {
        results = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
          } as Inspection;
        });
      }
    } catch (err) {
      console.warn('[Firestore] Error reading inspections, falling back to local memory:', err);
    }
  }

  if (filters) {
    if (filters.orderId && filters.orderId !== 'ALL') {
      results = results.filter((i) => i.orderId === filters.orderId);
    }
    if (filters.buyerOrganizationId && filters.buyerOrganizationId !== 'ALL') {
      results = results.filter((i) => i.buyerOrganizationId === filters.buyerOrganizationId);
    }
    if (filters.factoryId && filters.factoryId !== 'ALL') {
      results = results.filter((i) => i.factoryId === filters.factoryId);
    }
    if (filters.inspectionType && filters.inspectionType !== 'ALL') {
      results = results.filter((i) => i.inspectionType === filters.inspectionType);
    }
    if (filters.result && filters.result !== 'ALL') {
      results = results.filter((i) => i.result === filters.result);
    }
    if (filters.inspectionStatus && filters.inspectionStatus !== 'ALL') {
      results = results.filter((i) => i.inspectionStatus === filters.inspectionStatus);
    }
    if (filters.published !== undefined && filters.published !== 'ALL') {
      results = results.filter((i) => i.published === filters.published);
    }
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase();
      results = results.filter(
        (i) =>
          i.orderNumber.toLowerCase().includes(q) ||
          i.styleNumber.toLowerCase().includes(q) ||
          i.inspectorName.toLowerCase().includes(q) ||
          i.factoryId.toLowerCase().includes(q) ||
          (i.remarks || '').toLowerCase().includes(q)
      );
    }
  }

  return results.sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime());
}

/**
 * Retrieves inspections for a specific order.
 */
export async function getInspectionsForOrder(
  orderId: string,
  buyerOrganizationId?: string
): Promise<Inspection[]> {
  if (buyerOrganizationId) {
    return getInspectionsForBuyer(buyerOrganizationId, { orderId });
  }

  const all = await getInspections();
  return all.filter((i) => i.orderId === orderId);
}

/**
 * Retrieves a single inspection by its ID.
 */
export async function getInspectionById(inspectionId: string): Promise<Inspection | null> {
  const all = await getInspections();
  const found = all.find((i) => i.id === inspectionId);
  return found || null;
}

/**
 * Retrieves inspections for an authenticated Buyer Organization.
 * Enforces:
 *  1. `buyerOrganizationId === buyerOrgId` (Strict Tenant Isolation)
 *  2. `published === true` (Only finalized / approved reports)
 *  3. Redacts internal staff notes and private factory remarks.
 */
export async function getInspectionsForBuyer(
  buyerOrganizationId: string,
  filters?: {
    orderId?: string | 'ALL';
    inspectionType?: InspectionType | 'ALL';
    result?: InspectionResult | 'ALL';
    searchQuery?: string;
  }
): Promise<Inspection[]> {
  const all = await getInspections();
  const normId = normalizeBuyerOrgId(buyerOrganizationId);

  let buyerInspections = all.filter(
    (i) => normalizeBuyerOrgId(i.buyerOrganizationId) === normId && i.published === true
  );

  if (filters) {
    if (filters.orderId && filters.orderId !== 'ALL') {
      buyerInspections = buyerInspections.filter((i) => i.orderId === filters.orderId);
    }
    if (filters.inspectionType && filters.inspectionType !== 'ALL') {
      buyerInspections = buyerInspections.filter((i) => i.inspectionType === filters.inspectionType);
    }
    if (filters.result && filters.result !== 'ALL') {
      buyerInspections = buyerInspections.filter((i) => i.result === filters.result);
    }
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase();
      buyerInspections = buyerInspections.filter(
        (i) =>
          i.orderNumber.toLowerCase().includes(q) ||
          i.styleNumber.toLowerCase().includes(q) ||
          (i.remarks || '').toLowerCase().includes(q)
      );
    }
  }

  // Redact internal notes for buyer confidentiality
  return buyerInspections.map((insp) => ({
    ...insp,
    internalNotes: undefined,
  }));
}

/**
 * Creates and records a new multi-stage quality inspection.
 * Computes AQL result deterministically using standard ISO 2859-1 tables.
 */
export async function createInspection(
  input: CreateInspectionInput,
  actor: { uid: string; role: string; displayName?: string }
): Promise<Inspection> {
  if (!hasPermission(actor.role as UserRole, 'quality.write')) {
    throw new Error('Access Denied: You do not have permission to record quality inspections.');
  }

  const validated = createInspectionSchema.parse(input);

  const sampleSize = validated.inspectedQuantity || getSampleSize(validated.orderQuantity, validated.aqlLevel);

  // Aggregate defects by severity
  let criticalCount = 0;
  let majorCount = 0;
  let minorCount = 0;

  const defectList: DefectItem[] = validated.defects.map((d, index) => {
    const qty = d.quantity || 1;
    if (d.severity === 'CRITICAL') criticalCount += qty;
    if (d.severity === 'MAJOR') majorCount += qty;
    if (d.severity === 'MINOR') minorCount += qty;

    return {
      id: d.id || `def-${Date.now().toString(36)}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      inspectionId: '',
      category: d.category,
      code: d.code,
      severity: d.severity,
      quantity: qty,
      location: d.location,
      description: d.description,
      photoUrl: d.photoUrl,
    };
  });

  // Calculate AQL Result Deterministically
  const aqlResult = calculateAQLResult({
    lotSize: validated.orderQuantity,
    inspectedQuantity: sampleSize,
    level: validated.aqlLevel,
    majorAQL: validated.aqlMajor,
    minorAQL: validated.aqlMinor,
    criticalAQL: 0,
    defects: {
      critical: criticalCount,
      major: majorCount,
      minor: minorCount,
    },
  });

  const now = new Date().toISOString();
  const inspectionId = `insp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

  defectList.forEach((d) => {
    d.inspectionId = inspectionId;
  });

  const newInspection: Inspection = {
    id: inspectionId,
    orderId: validated.orderId,
    orderNumber: validated.orderNumber,
    styleNumber: validated.styleNumber,
    buyerOrganizationId: validated.buyerOrganizationId,
    factoryId: validated.factoryId,
    inspectionType: validated.inspectionType,
    inspectionDate: validated.inspectionDate,
    inspectorId: validated.inspectorId,
    inspectorName: validated.inspectorName,
    inspectionStatus: 'completed',
    orderQuantity: validated.orderQuantity,
    inspectedQuantity: sampleSize,
    sampleSize: sampleSize,
    aqlLevel: validated.aqlLevel,
    aqlMajor: validated.aqlMajor,
    aqlMinor: validated.aqlMinor,
    criticalDefects: criticalCount,
    majorDefects: majorCount,
    minorDefects: minorCount,
    totalDefects: criticalCount + majorCount + minorCount,
    maxAllowedMajor: aqlResult.maxAllowedMajor,
    maxAllowedMinor: aqlResult.maxAllowedMinor,
    result: aqlResult.result,
    defects: defectList,
    remarks: validated.remarks || '',
    internalNotes: validated.internalNotes || '',
    reportDocumentId: validated.reportDocumentId || null,
    reinspectionRequired: aqlResult.result === 'FAIL',
    reinspectionOfId: validated.reinspectionOfId || null,
    reinspectionIds: [],
    published: validated.published ?? false,
    publishedAt: validated.published ? now : null,
    publishedBy: validated.published ? actor.uid : null,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryInspections.unshift(newInspection);

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'INSPECTION_CREATED',
    entityId: inspectionId,
    after: {
      orderId: newInspection.orderId,
      orderNumber: newInspection.orderNumber,
      inspectionType: newInspection.inspectionType,
      result: newInspection.result,
      sampleSize: newInspection.sampleSize,
      totalDefects: newInspection.totalDefects,
    },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'inspections', inspectionId);
      await setDoc(docRef, {
        ...newInspection,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Firestore] Error creating inspection record:', err);
    }
  }

  return newInspection;
}

/**
 * Updates an existing inspection record.
 */
export async function updateInspection(
  inspectionId: string,
  input: Partial<CreateInspectionInput> & { inspectionStatus?: InspectionStatus },
  actor: { uid: string; role: string; displayName?: string }
): Promise<Inspection> {
  const existing = await getInspectionById(inspectionId);
  if (!existing) {
    throw new Error(`Inspection ${inspectionId} not found.`);
  }

  if (!hasPermission(actor.role as UserRole, 'quality.write')) {
    throw new Error('Access Denied: You do not have permission to update inspections.');
  }

  const now = new Date().toISOString();

  // If defects or quantities are updated, re-evaluate AQL
  let criticalCount = existing.criticalDefects;
  let majorCount = existing.majorDefects;
  let minorCount = existing.minorDefects;
  let defectList = existing.defects;

  if (input.defects) {
    criticalCount = 0;
    majorCount = 0;
    minorCount = 0;
    defectList = input.defects.map((d, index) => {
      const qty = d.quantity || 1;
      if (d.severity === 'CRITICAL') criticalCount += qty;
      if (d.severity === 'MAJOR') majorCount += qty;
      if (d.severity === 'MINOR') minorCount += qty;

      return {
        id: d.id || `def-${Date.now().toString(36)}-${index}`,
        inspectionId,
        category: d.category,
        code: d.code,
        severity: d.severity,
        quantity: qty,
        location: d.location,
        description: d.description,
        photoUrl: d.photoUrl,
      };
    });
  }

  const orderQty = input.orderQuantity || existing.orderQuantity;
  const inspectedQty = input.inspectedQuantity || existing.inspectedQuantity;
  const aqlLvl = input.aqlLevel || existing.aqlLevel;
  const aqlMaj = input.aqlMajor || existing.aqlMajor;
  const aqlMin = input.aqlMinor || existing.aqlMinor;

  const aqlResult = calculateAQLResult({
    lotSize: orderQty,
    inspectedQuantity: inspectedQty,
    level: aqlLvl,
    majorAQL: aqlMaj,
    minorAQL: aqlMin,
    criticalAQL: 0,
    defects: {
      critical: criticalCount,
      major: majorCount,
      minor: minorCount,
    },
  });

  const updated: Inspection = {
    ...existing,
    inspectionStatus: input.inspectionStatus || existing.inspectionStatus,
    inspectionDate: input.inspectionDate || existing.inspectionDate,
    orderQuantity: orderQty,
    inspectedQuantity: inspectedQty,
    sampleSize: inspectedQty,
    aqlLevel: aqlLvl,
    aqlMajor: aqlMaj,
    aqlMinor: aqlMin,
    criticalDefects: criticalCount,
    majorDefects: majorCount,
    minorDefects: minorCount,
    totalDefects: criticalCount + majorCount + minorCount,
    maxAllowedMajor: aqlResult.maxAllowedMajor,
    maxAllowedMinor: aqlResult.maxAllowedMinor,
    result: aqlResult.result,
    defects: defectList,
    remarks: input.remarks !== undefined ? input.remarks : existing.remarks,
    internalNotes: input.internalNotes !== undefined ? input.internalNotes : existing.internalNotes,
    reportDocumentId: input.reportDocumentId !== undefined ? input.reportDocumentId : existing.reportDocumentId,
    reinspectionRequired: aqlResult.result === 'FAIL',
    updatedAt: now,
  };

  const idx = inMemoryInspections.findIndex((i) => i.id === inspectionId);
  if (idx !== -1) {
    inMemoryInspections[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'INSPECTION_UPDATED',
    entityId: inspectionId,
    before: { result: existing.result, totalDefects: existing.totalDefects },
    after: { result: updated.result, totalDefects: updated.totalDefects },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'inspections', inspectionId);
      await updateDoc(docRef, {
        ...updated,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Firestore] Error updating inspection:', err);
    }
  }

  return updated;
}

/**
 * Appends a defect item to an existing inspection and recalculates the AQL result.
 */
export async function addInspectionDefect(
  inspectionId: string,
  defectInput: DefectItemInput,
  actor: { uid: string; role: string; displayName?: string }
): Promise<Inspection> {
  const existing = await getInspectionById(inspectionId);
  if (!existing) {
    throw new Error(`Inspection ${inspectionId} not found.`);
  }

  if (!hasPermission(actor.role as UserRole, 'quality.write')) {
    throw new Error('Access Denied: You do not have permission to add defects.');
  }

  const validatedDefect = defectItemSchema.parse(defectInput);
  const newDefect: DefectItem = {
    id: `def-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    inspectionId,
    category: validatedDefect.category,
    code: validatedDefect.code,
    severity: validatedDefect.severity,
    quantity: validatedDefect.quantity,
    location: validatedDefect.location,
    description: validatedDefect.description,
    photoUrl: validatedDefect.photoUrl,
  };

  const updatedDefects = [...existing.defects, newDefect];

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'DEFECT_ADDED',
    entityId: inspectionId,
    after: {
      defectId: newDefect.id,
      category: newDefect.category,
      severity: newDefect.severity,
      quantity: newDefect.quantity,
    },
  });

  return updateInspection(
    inspectionId,
    { defects: updatedDefects },
    actor
  );
}

/**
 * Publishes an inspection report, making it officially visible to the buyer organization.
 * Restricted to Merchandiser, Operations Manager, Admin, and Super Admin roles.
 */
export async function publishInspection(
  inspectionId: string,
  actor: { uid: string; role: string }
): Promise<Inspection> {
  const existing = await getInspectionById(inspectionId);
  if (!existing) {
    throw new Error(`Inspection ${inspectionId} not found.`);
  }

  if (!hasPermission(actor.role as UserRole, 'quality.publish')) {
    throw new Error('Access Denied: Only authorized managers and merchandisers can publish inspection reports.');
  }

  const now = new Date().toISOString();
  const updated: Inspection = {
    ...existing,
    published: true,
    publishedAt: now,
    publishedBy: actor.uid,
    updatedAt: now,
  };

  const idx = inMemoryInspections.findIndex((i) => i.id === inspectionId);
  if (idx !== -1) {
    inMemoryInspections[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'INSPECTION_PUBLISHED',
    entityId: inspectionId,
    after: {
      orderId: updated.orderId,
      result: updated.result,
      buyerOrganizationId: updated.buyerOrganizationId,
    },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'inspections', inspectionId);
      await updateDoc(docRef, {
        published: true,
        publishedAt: serverTimestamp(),
        publishedBy: actor.uid,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Firestore] Error publishing inspection:', err);
    }
  }

  return updated;
}

/**
 * Rejects or revokes an inspection report.
 */
export async function rejectInspection(
  inspectionId: string,
  reason: string,
  actor: { uid: string; role: string }
): Promise<Inspection> {
  const existing = await getInspectionById(inspectionId);
  if (!existing) {
    throw new Error(`Inspection ${inspectionId} not found.`);
  }

  if (!hasPermission(actor.role as UserRole, 'quality.publish')) {
    throw new Error('Access Denied: Insufficient permissions to reject inspection.');
  }

  const now = new Date().toISOString();
  const updated: Inspection = {
    ...existing,
    inspectionStatus: 'cancelled',
    published: false,
    remarks: `${existing.remarks ? existing.remarks + ' | ' : ''}Rejected: ${reason}`,
    updatedAt: now,
  };

  const idx = inMemoryInspections.findIndex((i) => i.id === inspectionId);
  if (idx !== -1) {
    inMemoryInspections[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'INSPECTION_REJECTED',
    entityId: inspectionId,
    after: { reason },
  });

  return updated;
}

/**
 * Attaches or creates a formal Corrective Action Plan (CAP) on an inspection.
 */
export async function createCorrectiveAction(
  inspectionId: string,
  input: CorrectiveActionInput,
  actor: { uid: string; role: string; displayName?: string }
): Promise<Inspection> {
  const existing = await getInspectionById(inspectionId);
  if (!existing) {
    throw new Error(`Inspection ${inspectionId} not found.`);
  }

  if (!hasPermission(actor.role as UserRole, 'quality.write')) {
    throw new Error('Access Denied: You do not have permission to create corrective actions.');
  }

  const validated = correctiveActionSchema.parse(input);
  const now = new Date().toISOString();

  const issue = validated.issueDescription || validated.rootCause || 'Quality non-conformity remediation';
  const action = validated.actionRequired || validated.actionPlan || 'Corrective re-work and process adjustment';
  const party = validated.responsibleParty || validated.assignedTo || 'Factory Floor Manager';
  const due = validated.dueDate || validated.targetDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const capStatus = (validated.status?.toUpperCase() || 'OPEN') as CorrectiveAction['status'];

  const cap: CorrectiveAction = {
    id: `cap-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    inspectionId,
    orderId: existing.orderId,
    issueDescription: issue,
    rootCause: validated.rootCause || issue,
    actionRequired: action,
    actionPlan: action,
    responsibleParty: party,
    assignedTo: party,
    dueDate: due,
    targetDate: due,
    status: capStatus,
    resolutionNotes: validated.resolutionNotes || '',
    verificationNotes: validated.verificationNotes || '',
    createdAt: now,
    updatedAt: now,
  };

  const existingCaps = existing.correctiveActions || (existing.correctiveAction ? [existing.correctiveAction] : []);
  const updatedCaps = [...existingCaps, cap];

  const updated: Inspection = {
    ...existing,
    correctiveAction: cap,
    correctiveActions: updatedCaps,
    reinspectionRequired: true,
    updatedAt: now,
  };

  const idx = inMemoryInspections.findIndex((i) => i.id === inspectionId);
  if (idx !== -1) {
    inMemoryInspections[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'CORRECTIVE_ACTION_CREATED',
    entityId: cap.id,
    after: {
      inspectionId,
      issueDescription: cap.issueDescription,
      responsibleParty: cap.responsibleParty,
      dueDate: cap.dueDate,
    },
  });

  return updated;
}

/**
 * Updates the status and resolution notes of an active Corrective Action Plan.
 */
export async function updateCorrectiveAction(
  inspectionId: string,
  arg2: Partial<CorrectiveAction> | CorrectiveAction['status'] | string,
  arg3?: Partial<CorrectiveAction> | string | { uid: string; role: string; displayName?: string },
  arg4?: { uid: string; role: string; displayName?: string }
): Promise<Inspection> {
  const existing = await getInspectionById(inspectionId);
  if (!existing || (!existing.correctiveAction && (!existing.correctiveActions || existing.correctiveActions.length === 0))) {
    throw new Error(`Inspection ${inspectionId} has no active corrective action.`);
  }

  let actor: { uid: string; role: string; displayName?: string };
  let status: string | undefined;
  let resolutionNotes: string | undefined;
  let verificationNotes: string | undefined;
  let capId: string | undefined;

  if (arg4) {
    actor = arg4;
    if (typeof arg3 === 'object' && arg3 !== null) {
      capId = arg2 as string;
      const opts = arg3 as { status?: string; resolutionNotes?: string; verificationNotes?: string };
      status = opts.status;
      resolutionNotes = opts.resolutionNotes;
      verificationNotes = opts.verificationNotes;
    } else {
      status = arg2 as string;
      resolutionNotes = arg3 as string;
      capId = existing.correctiveAction?.id;
    }
  } else {
    actor = arg3 as { uid: string; role: string; displayName?: string };
    if (typeof arg2 === 'object' && arg2 !== null) {
      const opts = arg2 as Partial<CorrectiveAction>;
      status = opts.status;
      resolutionNotes = opts.resolutionNotes;
      verificationNotes = opts.verificationNotes;
      capId = opts.id || existing.correctiveAction?.id;
    } else {
      status = arg2 as string;
      capId = existing.correctiveAction?.id;
    }
  }

  if (!hasPermission(actor.role as UserRole, 'quality.write')) {
    throw new Error('Access Denied: Insufficient permissions to update corrective action.');
  }

  const now = new Date().toISOString();
  const existingCap =
    (existing.correctiveActions && capId ? existing.correctiveActions.find((c) => c.id === capId) : null) ||
    existing.correctiveAction ||
    existing.correctiveActions?.[0];

  if (!existingCap) {
    throw new Error(`Corrective action not found on inspection ${inspectionId}.`);
  }

  const normStatus = (status ? status.toUpperCase() : existingCap.status.toUpperCase()) as CorrectiveAction['status'];
  const isResolved = normStatus === 'COMPLETED' || normStatus === 'VERIFIED';
  const isVerified = normStatus === 'VERIFIED';

  const updatedCap: CorrectiveAction = {
    ...existingCap,
    status: normStatus,
    resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : existingCap.resolutionNotes,
    verificationNotes: verificationNotes !== undefined ? verificationNotes : existingCap.verificationNotes,
    resolvedAt: isResolved ? (existingCap.resolvedAt || now) : existingCap.resolvedAt,
    resolvedBy: isResolved ? (existingCap.resolvedBy || actor.uid) : existingCap.resolvedBy,
    verifiedAt: isVerified ? (existingCap.verifiedAt || now) : existingCap.verifiedAt,
    verifiedBy: isVerified ? (existingCap.verifiedBy || actor.uid) : existingCap.verifiedBy,
    updatedAt: now,
  };

  const existingCaps = existing.correctiveActions || (existing.correctiveAction ? [existing.correctiveAction] : []);
  const updatedCaps = existingCaps.map((c) => (c.id === updatedCap.id ? updatedCap : c));
  if (!updatedCaps.some((c) => c.id === updatedCap.id)) {
    updatedCaps.push(updatedCap);
  }

  const updated: Inspection = {
    ...existing,
    correctiveAction: updatedCap,
    correctiveActions: updatedCaps,
    updatedAt: now,
  };

  const idx = inMemoryInspections.findIndex((i) => i.id === inspectionId);
  if (idx !== -1) {
    inMemoryInspections[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'CORRECTIVE_ACTION_UPDATED',
    entityId: updatedCap.id,
    after: { status: normStatus, resolutionNotes, verificationNotes },
  });

  return updated;
}

/**
 * Flags an inspection for Re-inspection.
 */
export async function requestReinspection(
  inspectionId: string,
  reason: string,
  actor: { uid: string; role: string }
): Promise<Inspection> {
  const existing = await getInspectionById(inspectionId);
  if (!existing) {
    throw new Error(`Inspection ${inspectionId} not found.`);
  }

  if (!hasPermission(actor.role as UserRole, 'quality.reinspection')) {
    throw new Error('Access Denied: You do not have permission to request re-inspections.');
  }

  const now = new Date().toISOString();
  const updated: Inspection = {
    ...existing,
    reinspectionRequired: true,
    remarks: `${existing.remarks ? existing.remarks + ' | ' : ''}Re-inspection requested: ${reason}`,
    updatedAt: now,
  };

  const idx = inMemoryInspections.findIndex((i) => i.id === inspectionId);
  if (idx !== -1) {
    inMemoryInspections[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'REINSPECTION_REQUESTED',
    entityId: inspectionId,
    after: { reason },
  });

  return updated;
}

/**
 * Creates a new linked Re-inspection round after corrective actions have been applied.
 */
export async function createReinspection(
  parentInspectionId: string,
  input: Partial<CreateInspectionInput>,
  actor: { uid: string; role: string; displayName?: string }
): Promise<Inspection> {
  const parent = await getInspectionById(parentInspectionId);
  if (!parent) {
    throw new Error(`Parent inspection ${parentInspectionId} not found.`);
  }

  if (!hasPermission(actor.role as UserRole, 'quality.reinspection')) {
    throw new Error('Access Denied: You do not have permission to conduct re-inspections.');
  }

  // Create the new inspection round with REINSPECTION type, inheriting parent metadata
  const payload: CreateInspectionInput = {
    orderId: parent.orderId,
    orderNumber: parent.orderNumber,
    styleNumber: parent.styleNumber,
    buyerOrganizationId: parent.buyerOrganizationId,
    factoryId: parent.factoryId,
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorId: actor.uid,
    inspectorName: actor.displayName || 'Staff Inspector',
    orderQuantity: parent.orderQuantity,
    inspectedQuantity: parent.inspectedQuantity,
    aqlLevel: parent.aqlLevel,
    aqlMajor: parent.aqlMajor,
    aqlMinor: parent.aqlMinor,
    defects: [],
    ...input,
    inspectionType: 'REINSPECTION',
    reinspectionOfId: parentInspectionId,
  };

  const reinspection = await createInspection(payload, actor);

  // Link child ID to parent inspection
  const parentIdx = inMemoryInspections.findIndex((i) => i.id === parentInspectionId);
  if (parentIdx !== -1) {
    inMemoryInspections[parentIdx] = {
      ...inMemoryInspections[parentIdx],
      reinspectionIds: [...(inMemoryInspections[parentIdx].reinspectionIds || []), reinspection.id],
      reinspectionRequired: reinspection.result === 'FAIL',
      updatedAt: new Date().toISOString(),
    };
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'REINSPECTION_COMPLETED',
    entityId: reinspection.id,
    after: {
      parentInspectionId,
      result: reinspection.result,
    },
  });

  return reinspection;
}

/**
 * Retrieves all laboratory test reports.
 */
export async function getLabTestReports(
  filters?: { orderId?: string | 'ALL'; testCategory?: LabTestCategory | 'ALL'; buyerOrgId?: string }
): Promise<LabTestReport[]> {
  let results = [...inMemoryLabReports];

  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'labReports'));
      if (!snap.empty) {
        results = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
          } as LabTestReport;
        });
      }
    } catch (err) {
      console.warn('[Firestore] Error reading lab reports:', err);
    }
  }

  if (filters) {
    if (filters.orderId && filters.orderId !== 'ALL') {
      results = results.filter((r) => r.orderId === filters.orderId);
    }
    if (filters.testCategory && filters.testCategory !== 'ALL') {
      results = results.filter((r) => r.testCategory === filters.testCategory);
    }
    if (filters.buyerOrgId && filters.buyerOrgId !== 'ALL') {
      results = results.filter((r) => r.buyerOrganizationId === filters.buyerOrgId);
    }
  }

  return results.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
}

/**
 * Retrieves laboratory test reports for an authenticated Buyer Organization.
 * Strictly isolates by `buyerOrganizationId === buyerOrgId`, `published === true`, and `visibility === 'buyer'`.
 */
export async function getLabTestReportsForBuyer(
  buyerOrganizationId: string,
  filters?: { orderId?: string | 'ALL'; testCategory?: LabTestCategory | 'ALL' }
): Promise<LabTestReport[]> {
  const all = await getLabTestReports();
  const normId = normalizeBuyerOrgId(buyerOrganizationId);

  let buyerReports = all.filter(
    (r) =>
      normalizeBuyerOrgId(r.buyerOrganizationId) === normId &&
      r.published === true &&
      r.visibility === 'buyer' &&
      r.status === 'active'
  );

  if (filters) {
    if (filters.orderId && filters.orderId !== 'ALL') {
      buyerReports = buyerReports.filter((r) => r.orderId === filters.orderId);
    }
    if (filters.testCategory && filters.testCategory !== 'ALL') {
      buyerReports = buyerReports.filter((r) => r.testCategory === filters.testCategory);
    }
  }

  return buyerReports;
}

/**
 * Records / registers a new laboratory test report.
 */
export async function createLabTestReport(
  input: LabTestReportInput,
  actor: { uid: string; role: string; displayName?: string }
): Promise<LabTestReport> {
  if (!hasPermission(actor.role as UserRole, 'quality.labReports')) {
    throw new Error('Access Denied: You do not have permission to upload laboratory reports.');
  }

  const validated = labTestReportSchema.parse(input);

  const now = new Date().toISOString();
  const reportId = `lab-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

  const newReport: LabTestReport = {
    id: reportId,
    reportNumber: validated.reportNumber,
    testCategory: validated.testCategory,
    labName: validated.labName,
    reportDate: validated.reportDate,
    sampleReference: validated.sampleReference || '',
    orderId: validated.orderId,
    orderNumber: validated.orderNumber || '',
    buyerOrganizationId: validated.buyerOrganizationId,
    documentId: validated.documentId || null,
    documentUrl: validated.documentUrl || null,
    fileName: validated.fileName || `${validated.testCategory.replace(/\s+/g, '_')}_Report.pdf`,
    result: validated.result || 'PASS',
    status: 'active',
    verificationStatus: validated.verificationStatus || 'VERIFICATION_REQUIRED',
    visibility: validated.visibility || 'buyer',
    remarks: validated.remarks || '',
    testParameters: validated.testParameters || input.testParameters || [],
    published: validated.published ?? false,
    publishedAt: validated.published ? now : null,
    publishedBy: validated.published ? actor.uid : null,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryLabReports.unshift(newReport);

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'LAB_REPORT_UPLOADED',
    entityId: reportId,
    after: {
      reportNumber: newReport.reportNumber,
      testCategory: newReport.testCategory,
      labName: newReport.labName,
      result: newReport.result,
      buyerOrganizationId: newReport.buyerOrganizationId,
    },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'labReports', reportId);
      await setDoc(docRef, {
        ...newReport,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Firestore] Error creating lab test report:', err);
    }
  }

  return newReport;
}

/**
 * Publishes a laboratory test report for buyer view.
 */
export async function publishLabTestReport(
  reportId: string,
  actor: { uid: string; role: string }
): Promise<LabTestReport> {
  const all = await getLabTestReports();
  const existing = all.find((r) => r.id === reportId);
  if (!existing) {
    throw new Error(`Lab report ${reportId} not found.`);
  }

  if (!hasPermission(actor.role as UserRole, 'quality.publish')) {
    throw new Error('Access Denied: Insufficient permissions to publish lab report.');
  }

  const now = new Date().toISOString();
  const updated: LabTestReport = {
    ...existing,
    published: true,
    publishedAt: now,
    publishedBy: actor.uid,
    updatedAt: now,
  };

  const idx = inMemoryLabReports.findIndex((r) => r.id === reportId);
  if (idx !== -1) {
    inMemoryLabReports[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'LAB_REPORT_PUBLISHED',
    entityId: reportId,
    after: {
      reportNumber: updated.reportNumber,
      buyerOrganizationId: updated.buyerOrganizationId,
    },
  });

  return updated;
}

/**
 * Computes high-level quality KPI summary metrics.
 */
export async function getQualityMetrics(orderId?: string): Promise<QualitySummaryMetrics> {
  const inspections = orderId ? await getInspectionsForOrder(orderId) : await getInspections();
  const labReports = orderId ? await getLabTestReports({ orderId }) : await getLabTestReports();

  const total = inspections.length;
  const passed = inspections.filter((i) => i.result === 'PASS').length;
  const conditional = inspections.filter((i) => i.result === 'CONDITIONAL').length;
  const failed = inspections.filter((i) => i.result === 'FAIL').length;
  const pending = inspections.filter((i) => i.result === 'PENDING').length;
  const reinspections = inspections.filter((i) => i.inspectionType === 'REINSPECTION' || i.reinspectionRequired).length;
  const openCAPs = inspections.filter((i) => {
    const caps = i.correctiveActions || (i.correctiveAction ? [i.correctiveAction] : []);
    return caps.some((c) => c.status !== 'verified' && c.status !== 'VERIFIED');
  }).length;

  const passRate = total > 0 ? Math.round(((passed + conditional) / total) * 100) : 100;
  const verifiedLabs = labReports.filter((r) => r.verificationStatus === 'VERIFIED').length;

  return {
    totalInspections: total,
    passedCount: passed,
    conditionalCount: conditional,
    failedCount: failed,
    pendingCount: pending,
    reinspectionCount: reinspections,
    passRatePercentage: passRate,
    passRate: passRate,
    openCorrectiveActions: openCAPs,
    totalLabReports: labReports.length,
    verifiedLabReports: verifiedLabs,
  };
}
