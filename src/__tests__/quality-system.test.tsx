import { describe, it, expect, vi } from 'vitest';
import {
  getCodeLetter,
  getSampleSize,
  getMaxAllowedDefects,
  calculateAQLResult,
} from '@/lib/quality/calculations';
import {
  createInspectionSchema,
  correctiveActionSchema,
  labTestReportSchema,
} from '@/lib/validation/quality.schema';
import {
  getInspectionsForBuyer,
  getInspectionById,
  createInspection,
  addInspectionDefect,
  publishInspection,
  createCorrectiveAction,
  updateCorrectiveAction,
  createReinspection,
  getLabTestReportsForBuyer,
  createLabTestReport,
  publishLabTestReport,
  getQualityMetrics,
  updateQualityConfig,
} from '@/lib/quality';

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

describe('Quality Assurance, AQL Inspection & Lab Test Management — Step 12 Verification', () => {
  const adminActor = {
    uid: 'staff-admin-001',
    role: 'Admin',
    displayName: 'Sarah Admin',
  };

  const qcStaffActor = {
    uid: 'staff-qc-001',
    role: 'QC Staff',
    displayName: 'Mahmudur Rahman (Lead QA)',
  };

  const merchActor = {
    uid: 'staff-merch-001',
    role: 'Merchandiser',
    displayName: 'Jane Merchandiser',
  };

  const buyerActorOrg1 = {
    uid: 'buyer-001',
    role: 'Buyer',
    buyerOrganizationId: 'buyer-org-001',
    displayName: 'Alex Buyer (Nordic Trends)',
  };

  const buyerActorOrg2 = {
    uid: 'buyer-002',
    role: 'Buyer',
    buyerOrganizationId: 'buyer-org-002',
    displayName: 'Elena Buyer (Urban Outfitters)',
  };

  /* -------------------------------------------------------------------------- */
  /* 1. AQL Calculation Engine & ISO 2859-1 (ANSI/ASQ Z1.4) Sampling Logic     */
  /* -------------------------------------------------------------------------- */
  describe('1. AQL Calculation Engine & Sampling Tables', () => {
    it('correctly maps lot sizes to code letters across standard inspection levels', () => {
      // General Level II
      expect(getCodeLetter(10, 'GII')).toBe('B');
      expect(getCodeLetter(50, 'GII')).toBe('D');
      expect(getCodeLetter(200, 'GII')).toBe('G');
      expect(getCodeLetter(1000, 'GII')).toBe('J');
      expect(getCodeLetter(5000, 'GII')).toBe('L');
      expect(getCodeLetter(15000, 'GII')).toBe('M');
      expect(getCodeLetter(50000, 'GII')).toBe('N');
      expect(getCodeLetter(200000, 'GII')).toBe('P');
      expect(getCodeLetter(600000, 'GII')).toBe('Q');

      // General Level I (Reduced)
      expect(getCodeLetter(5000, 'GI')).toBe('J');

      // General Level III (Tightened)
      expect(getCodeLetter(5000, 'GIII')).toBe('M');
    });

    it('returns exact sample sizes for standard lot sizes', () => {
      expect(getSampleSize(1000, 'GII')).toBe(80); // Code Letter J -> 80
      expect(getSampleSize(5000, 'GII')).toBe(200); // Code Letter L -> 200
      expect(getSampleSize(15000, 'GII')).toBe(315); // Code Letter M -> 315
    });

    it('determines max allowable defect thresholds (Ac/Re) correctly', () => {
      // Sample size 200 (Letter L), Major AQL 2.5 => Ac=10
      const limitL_25 = getMaxAllowedDefects(200, 2.5);
      expect(limitL_25).toBe(10);

      // Sample size 200 (Letter L), Minor AQL 4.0 => Ac=14
      const limitL_40 = getMaxAllowedDefects(200, 4.0);
      expect(limitL_40).toBe(14);

      // Sample size 80 (Letter J), Major AQL 1.5 => Ac=3
      const limitJ_15 = getMaxAllowedDefects(80, 1.5);
      expect(limitJ_15).toBe(3);
    });

    it('deterministically calculates AQL PASS when defect tallies are within limits', () => {
      const evaluation = calculateAQLResult({
        lotSize: 5000,
        inspectedQuantity: 200,
        level: 'GII',
        majorAQL: 2.5,
        minorAQL: 4.0,
        criticalAQL: 0,
        defects: {
          critical: 0,
          major: 8, // max allowed is 10
          minor: 12, // max allowed is 14
        },
      });

      expect(evaluation.result).toBe('PASS');
      expect(evaluation.codeLetter).toBe('L');
      expect(evaluation.sampleSize).toBe(200);
      expect(evaluation.majorMaxAllowed).toBe(10);
      expect(evaluation.minorMaxAllowed).toBe(14);
      expect(evaluation.criticalCount).toBe(0);
      expect(evaluation.totalDefects).toBe(20);
    });

    it('deterministically calculates AQL FAIL when major defects exceed allowable limit', () => {
      const evaluation = calculateAQLResult({
        lotSize: 5000,
        inspectedQuantity: 200,
        level: 'GII',
        majorAQL: 2.5,
        minorAQL: 4.0,
        criticalAQL: 0,
        defects: {
          critical: 0,
          major: 11, // exceeds max allowed of 10
          minor: 5,
        },
      });

      expect(evaluation.result).toBe('FAIL');
      expect(evaluation.majorDefectsPass).toBe(false);
      expect(evaluation.minorDefectsPass).toBe(true);
    });

    it('deterministically calculates AQL FAIL when minor defects exceed allowable limit', () => {
      const evaluation = calculateAQLResult({
        lotSize: 5000,
        inspectedQuantity: 200,
        level: 'GII',
        majorAQL: 2.5,
        minorAQL: 4.0,
        criticalAQL: 0,
        defects: {
          critical: 0,
          major: 4,
          minor: 16, // exceeds max allowed of 14
        },
      });

      expect(evaluation.result).toBe('FAIL');
      expect(evaluation.majorDefectsPass).toBe(true);
      expect(evaluation.minorDefectsPass).toBe(false);
    });

    it('enforces strict Zero Critical Defect rule (any critical defect = immediate FAIL)', () => {
      const evaluation = calculateAQLResult({
        lotSize: 10000,
        inspectedQuantity: 315,
        level: 'GII',
        majorAQL: 2.5,
        minorAQL: 4.0,
        criticalAQL: 0,
        defects: {
          critical: 1, // Broken needle / safety hazard
          major: 0,
          minor: 0,
        },
      });

      expect(evaluation.result).toBe('FAIL');
      expect(evaluation.criticalDefectsPass).toBe(false);
    });

    it('guards against invalid inputs (non-positive lot size, negative defects, exceeding sample)', () => {
      expect(() => {
        calculateAQLResult({
          lotSize: 0,
          inspectedQuantity: 100,
          level: 'GII',
          majorAQL: 2.5,
          minorAQL: 4.0,
          criticalAQL: 0,
          defects: { critical: 0, major: 0, minor: 0 },
        });
      }).toThrow(/lot size.*greater than 0/i);

      expect(() => {
        calculateAQLResult({
          lotSize: 1000,
          inspectedQuantity: 80,
          level: 'GII',
          majorAQL: 2.5,
          minorAQL: 4.0,
          criticalAQL: 0,
          defects: { critical: -1, major: 0, minor: 0 },
        });
      }).toThrow('Defect counts cannot be negative');

      expect(() => {
        calculateAQLResult({
          lotSize: 1000,
          inspectedQuantity: 80,
          level: 'GII',
          majorAQL: 2.5,
          minorAQL: 4.0,
          criticalAQL: 0,
          defects: { critical: 0, major: 90, minor: 0 },
        });
      }).toThrow(/Total defects.*cannot exceed/i);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. Schema Validation Layer                                                */
  /* -------------------------------------------------------------------------- */
  describe('2. Validation Schemas', () => {
    it('validates standard createInspectionSchema payload', () => {
      const validPayload = {
        orderId: 'TEST-ORDER-001',
        orderNumber: 'PO-2026-0891',
        styleNumber: 'STY-KNIT-401',
        buyerOrganizationId: 'buyer-org-001',
        factoryId: 'FAC-001',
        inspectionType: 'INLINE' as const,
        inspectionDate: '2026-09-08',
        inspectorId: 'qc-staff-001',
        inspectorName: 'Mahmudur Rahman',
        orderQuantity: 5000,
        inspectedQuantity: 200,
        aqlLevel: 'GII' as const,
        aqlMajor: 2.5,
        aqlMinor: 4.0,
        defects: [
          {
            category: 'Workmanship' as const,
            severity: 'MAJOR' as const,
            quantity: 2,
            location: 'Collar Rib',
            description: 'Uneven tension',
          },
        ],
        remarks: 'Audit completed successfully on floor A.',
      };

      const parsed = createInspectionSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it('rejects inspection schema if defect count exceeds sample size', () => {
      const invalidPayload = {
        orderId: 'TEST-ORDER-001',
        orderNumber: 'PO-2026-0891',
        styleNumber: 'STY-KNIT-401',
        buyerOrganizationId: 'buyer-org-001',
        factoryId: 'FAC-001',
        inspectionType: 'INLINE' as const,
        inspectionDate: '2026-09-08',
        inspectorId: 'qc-staff-001',
        inspectorName: 'Mahmudur Rahman',
        orderQuantity: 1000,
        inspectedQuantity: 50,
        aqlLevel: 'GII' as const,
        aqlMajor: 2.5,
        aqlMinor: 4.0,
        defects: [
          {
            category: 'Workmanship' as const,
            severity: 'MAJOR' as const,
            quantity: 60, // 60 > 50
            location: 'Front panel',
            description: 'Mass stitching flaws',
          },
        ],
      };

      const parsed = createInspectionSchema.safeParse(invalidPayload);
      expect(parsed.success).toBe(false);
    });

    it('validates corrective action schema', () => {
      const validCAP = {
        rootCause: 'Operator misalignment on flatlock seam station #4.',
        actionPlan: 'Re-calibrated station tension guides and re-trained seamstress.',
        targetDate: '2026-09-12',
        assignedTo: 'Line 4 Supervisor',
      };

      const parsed = correctiveActionSchema.safeParse(validCAP);
      expect(parsed.success).toBe(true);
    });

    it('validates lab test report schema', () => {
      const validLabReport = {
        reportNumber: 'LAB-2026-BD-9001',
        testCategory: 'Color Fastness' as const,
        labName: 'Bureau Veritas CPS Bangladesh',
        reportDate: '2026-09-05',
        sampleReference: 'Knit fabric batch #KB-12',
        orderId: 'TEST-ORDER-001',
        orderNumber: 'PO-2026-0891',
        buyerOrganizationId: 'buyer-org-001',
        result: 'PASS' as const,
        testParameters: [
          {
            parameter: 'Color fastness to washing',
            standard: 'ISO 105-C06',
            result: 'Grade 4-5',
            pass: true,
          },
        ],
      };

      const parsed = labTestReportSchema.safeParse(validLabReport);
      expect(parsed.success).toBe(true);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. Inspection Service & Lifecycle Workflow                                */
  /* -------------------------------------------------------------------------- */
  describe('3. Inspection Service & Lifecycle Workflow', () => {
    let createdInspectionId: string;

    it('allows QC Staff to create an inspection with deterministic AQL calculation', async () => {
      const newInsp = await createInspection(
        {
          orderId: 'TEST-ORDER-001',
          orderNumber: 'PO-2026-0891',
          styleNumber: 'STY-KNIT-401',
          buyerOrganizationId: 'buyer-org-001',
          factoryId: 'FAC-001',
          inspectionType: 'FINAL_RANDOM',
          inspectionDate: '2026-09-08',
          inspectorId: qcStaffActor.uid,
          inspectorName: qcStaffActor.displayName,
          orderQuantity: 3200,
          aqlLevel: 'GII',
          aqlMajor: 2.5,
          aqlMinor: 4.0,
          defects: [
            {
              category: 'Workmanship',
              severity: 'MAJOR',
              quantity: 2,
              location: 'Bottom hem',
              description: 'Loose thread loops',
            },
            {
              category: 'Cleanliness / Spots',
              severity: 'MINOR',
              quantity: 3,
              location: 'Sleeve',
              description: 'Light dust spot',
            },
          ],
          remarks: 'Initial Final Random inspection pass.',
          internalNotes: 'Factory floor was cooperative. Packing lines are on schedule.',
        },
        qcStaffActor
      );

      expect(newInsp.id).toBeDefined();
      expect(newInsp.sampleSize).toBe(125); // 3200 pcs GII -> Letter K -> 125
      expect(newInsp.result).toBe('PASS');
      expect(newInsp.maxAllowedMajor).toBe(7);
      expect(newInsp.maxAllowedMinor).toBe(10);
      expect(newInsp.published).toBe(false);

      createdInspectionId = newInsp.id;
    });

    it('allows adding defect items and recalculating AQL results in real-time', async () => {
      const updated = await addInspectionDefect(
        createdInspectionId,
        {
          category: 'Workmanship',
          severity: 'MAJOR',
          quantity: 6, // Total major becomes 2 + 6 = 8 (which exceeds maxAllowedMajor of 7)
          location: 'Front placket',
          description: 'Misaligned placket buttons',
        },
        qcStaffActor
      );

      expect(updated.majorDefects).toBe(8);
      expect(updated.result).toBe('FAIL'); // Changed deterministically from PASS to FAIL
    });

    it('allows Merchandiser/Admin to publish inspection for buyer visibility', async () => {
      const published = await publishInspection(createdInspectionId, merchActor);
      expect(published.published).toBe(true);
      expect(published.publishedBy).toBe(merchActor.uid);
      expect(published.publishedAt).toBeDefined();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 4. Multi-Tenant Isolation & Confidentiality Redaction                      */
  /* -------------------------------------------------------------------------- */
  describe('4. Multi-Tenant Isolation & Confidentiality', () => {
    it('isolates buyer inspections strictly to their own organization', async () => {
      const buyer1Inspections = await getInspectionsForBuyer('buyer-org-001');
      const buyer2Inspections = await getInspectionsForBuyer('buyer-org-002');

      expect(buyer1Inspections.length).toBeGreaterThan(0);
      buyer1Inspections.forEach((insp) => {
        expect(insp.buyerOrganizationId).toBe('buyer-org-001');
      });

      buyer2Inspections.forEach((insp) => {
        expect(insp.buyerOrganizationId).toBe('buyer-org-002');
      });
    });

    it('redacts internal inspector notes from all buyer queries', async () => {
      const buyerInspections = await getInspectionsForBuyer('buyer-org-001');
      buyerInspections.forEach((insp) => {
        expect(insp.internalNotes).toBeUndefined();
      });
    });

    it('hides unpublished draft inspections from buyer queries', async () => {
      const buyerInspections = await getInspectionsForBuyer('buyer-org-001');
      buyerInspections.forEach((insp) => {
        expect(insp.published).toBe(true);
      });
    });

    it('isolates lab test reports strictly to buyer organization', async () => {
      const buyer1Labs = await getLabTestReportsForBuyer('buyer-org-001');
      expect(buyer1Labs.length).toBeGreaterThan(0);
      buyer1Labs.forEach((report) => {
        expect(report.buyerOrganizationId).toBe('buyer-org-001');
        expect(report.published).toBe(true);
      });
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 5. Role-Based Access Control (RBAC) Enforcement                           */
  /* -------------------------------------------------------------------------- */
  describe('5. RBAC & Permissions Enforcement', () => {
    it('prevents Buyer from creating quality inspections', async () => {
      await expect(
        createInspection(
          {
            orderId: 'TEST-ORDER-001',
            orderNumber: 'PO-2026-0891',
            styleNumber: 'STY-KNIT-401',
            buyerOrganizationId: 'buyer-org-001',
            factoryId: 'FAC-001',
            inspectionType: 'INLINE',
            inspectionDate: '2026-09-08',
            inspectorId: buyerActorOrg1.uid,
            inspectorName: buyerActorOrg1.displayName,
            orderQuantity: 1000,
            aqlLevel: 'GII',
            aqlMajor: 2.5,
            aqlMinor: 4.0,
            defects: [],
          },
          buyerActorOrg1
        )
      ).rejects.toThrow('Access Denied');
    });

    it('prevents Buyer from publishing quality inspections', async () => {
      await expect(
        publishInspection('insp-001', buyerActorOrg1)
      ).rejects.toThrow('Access Denied');
    });

    it('allows Admin and Merchandiser to manage quality config', async () => {
      const updatedConfig = await updateQualityConfig(
        {
          defaultLevel: 'GIII',
          majorAQL: 1.5,
          minorAQL: 2.5,
        },
        adminActor
      );

      expect(updatedConfig.defaultLevel).toBe('GIII');
      expect(updatedConfig.majorAQL).toBe(1.5);
      expect(updatedConfig.minorAQL).toBe(2.5);

      // Restore defaults
      await updateQualityConfig(
        {
          defaultLevel: 'GII',
          majorAQL: 2.5,
          minorAQL: 4.0,
        },
        adminActor
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 6. Corrective Action Plan (CAP) & Re-inspection Round Progression         */
  /* -------------------------------------------------------------------------- */
  describe('6. Corrective Action Plan (CAP) & Re-inspection Progression', () => {
    let capId: string;
    let failedInspId: string;

    it('attaches a Corrective Action Plan (CAP) to a failed inspection', async () => {
      // Create a failed inspection
      const failedInsp = await createInspection(
        {
          orderId: 'TEST-ORDER-001',
          orderNumber: 'PO-2026-0891',
          styleNumber: 'STY-KNIT-401',
          buyerOrganizationId: 'buyer-org-001',
          factoryId: 'FAC-001',
          inspectionType: 'MIDLINE',
          inspectionDate: '2026-09-07',
          inspectorId: qcStaffActor.uid,
          inspectorName: qcStaffActor.displayName,
          orderQuantity: 5000,
          aqlLevel: 'GII',
          aqlMajor: 2.5,
          aqlMinor: 4.0,
          defects: [
            {
              category: 'Workmanship',
              severity: 'MAJOR',
              quantity: 15, // > maxAllowed 10
              location: 'Shoulder seam',
              description: 'Open seam and puckering',
            },
          ],
        },
        qcStaffActor
      );

      failedInspId = failedInsp.id;
      expect(failedInsp.result).toBe('FAIL');

      const updatedWithCap = await createCorrectiveAction(
        failedInsp.id,
        {
          rootCause: 'Improper needle feed dog alignment on Line 2.',
          actionPlan: 'Replaced feed dogs and re-inspected 100% of finished bundles.',
          targetDate: '2026-09-10',
          assignedTo: 'Factory Floor Manager (K. Hossain)',
        },
        qcStaffActor
      );

      expect(updatedWithCap.correctiveActions).toBeDefined();
      expect(updatedWithCap.correctiveActions?.length).toBe(1);
      const createdCap = updatedWithCap.correctiveActions![0];
      expect(createdCap.status).toBe('OPEN');
      capId = createdCap.id;
    });

    it('progresses CAP status from OPEN -> IN_PROGRESS -> COMPLETED -> VERIFIED', async () => {
      // In Progress
      let updated = await updateCorrectiveAction(
        failedInspId,
        capId,
        { status: 'IN_PROGRESS' },
        qcStaffActor
      );
      expect(updated.correctiveActions?.find((c) => c.id === capId)?.status).toBe('IN_PROGRESS');

      // Completed
      updated = await updateCorrectiveAction(
        failedInspId,
        capId,
        { status: 'COMPLETED' },
        qcStaffActor
      );
      expect(updated.correctiveActions?.find((c) => c.id === capId)?.status).toBe('COMPLETED');

      // Verified by QA
      updated = await updateCorrectiveAction(
        failedInspId,
        capId,
        {
          status: 'VERIFIED',
          verificationNotes: 'Checked 200 reworked garments. Zero seam puckering.',
        },
        qcStaffActor
      );
      expect(updated.correctiveActions?.find((c) => c.id === capId)?.status).toBe('VERIFIED');
    });

    it('creates a Re-Inspection round linked to the original failed audit', async () => {
      const reinspection = await createReinspection(
        failedInspId,
        {
          inspectionDate: '2026-09-11',
          inspectorId: qcStaffActor.uid,
          inspectorName: qcStaffActor.displayName,
          defects: [
            {
              category: 'Cleanliness / Spots',
              severity: 'MINOR',
              quantity: 2,
              location: 'Packaging',
              description: 'Dust on polybag',
            },
          ],
          remarks: 'Re-inspection after CAP implementation: PASS.',
        },
        qcStaffActor
      );

      expect(reinspection.inspectionType).toBe('REINSPECTION');
      expect(reinspection.reinspectionOfId).toBe(failedInspId);
      expect(reinspection.result).toBe('PASS');

      // Verify parent has reinspection ID in chain
      const parent = await getInspectionById(failedInspId);
      expect(parent?.reinspectionIds).toContain(reinspection.id);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 7. Accredited Laboratory Test Report Lifecycle                            */
  /* -------------------------------------------------------------------------- */
  describe('7. Accredited Laboratory Test Reports', () => {
    let labReportId: string;

    it('allows Merchandiser to record a verified third-party laboratory test report', async () => {
      const report = await createLabTestReport(
        {
          reportNumber: 'LAB-2026-SGS-9905',
          testCategory: 'Flammability',
          labName: 'SGS Consumer Testing Bangladesh Ltd.',
          reportDate: '2026-09-06',
          sampleReference: 'Organic Cotton Children Sleepwear',
          orderId: 'TEST-ORDER-001',
          orderNumber: 'PO-2026-0891',
          buyerOrganizationId: 'buyer-org-001',
          result: 'PASS',
          verificationStatus: 'VERIFIED',
          visibility: 'buyer',
          remarks: 'Class 1 Normal Flammability compliant with 16 CFR Part 1610.',
          testParameters: [
            {
              parameter: 'Flame Spread Time',
              standard: '16 CFR Part 1610',
              result: 'No ignition (> 7.0 seconds)',
              pass: true,
            },
          ],
        },
        merchActor
      );

      expect(report.id).toBeDefined();
      expect(report.verificationStatus).toBe('VERIFIED');
      expect(report.published).toBe(false);
      labReportId = report.id;
    });

    it('publishes lab test report for buyer viewing & certification download', async () => {
      const published = await publishLabTestReport(labReportId, merchActor);
      expect(published.published).toBe(true);
      expect(published.publishedBy).toBe(merchActor.uid);

      // Verify it appears in buyer lab reports
      const buyerReports = await getLabTestReportsForBuyer('buyer-org-001');
      expect(buyerReports.some((r) => r.id === labReportId)).toBe(true);
    });

    it('computes quality summary metrics accurately across the system', async () => {
      const metrics = await getQualityMetrics();
      expect(metrics.totalInspections).toBeGreaterThan(0);
      expect(metrics.passRate).toBeGreaterThanOrEqual(0);
      expect(metrics.passRate).toBeLessThanOrEqual(100);
      expect(metrics.verifiedLabReports).toBeGreaterThan(0);
    });
  });
});
