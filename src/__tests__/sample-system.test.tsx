import { describe, it, expect, vi } from 'vitest';
import {
  getSamplesByOrder,
  getSamplesForBuyer,
  createSample,
  submitSampleForBuyerReview,
  recordBuyerSampleDecision,
  createSampleRevision,
  addSampleComment,
  uploadSampleAttachment,
  deleteSampleAttachment,
} from '@/lib/samples';
import {
  createSampleSchema,
  buyerSampleDecisionSchema,
} from '@/lib/validation/sample.schema';

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

describe('Sample Management & Buyer Approval Workflow — Step 10 Verification', () => {
  const staffActor = { uid: 'staff-sample-001', role: 'Merchandiser', displayName: 'Jane Merch' };
  const buyerActor = {
    uid: 'buyer-001',
    role: 'Buyer',
    buyerOrganizationId: 'buyer-org-001',
    displayName: 'Alex Buyer',
  };

  describe('1. Sample Validation & Creation', () => {
    it('validates schema and creates a new sample request', async () => {
      const validPayload = {
        orderId: 'TEST-ORDER-001',
        buyerOrganizationId: 'buyer-org-001',
        sampleType: 'Fit Sample' as const,
        targetDate: '2026-09-20',
        courierName: 'DHL Express',
        trackingNumber: 'DHL-8899-TEST',
        internalRemarks: 'Checked pattern grading',
        buyerRemarks: '1st Fit base size M',
        status: 'in_development' as const,
      };

      const parsed = createSampleSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);

      const created = await createSample(validPayload, staffActor);
      expect(created.id).toBeDefined();
      expect(created.revisionNumber).toBe(1);
      expect(created.status).toBe('in_development');
      expect(created.sampleType).toBe('Fit Sample');
      expect(created.internalRemarks).toBe('Checked pattern grading');
    });

    it('rejects invalid sample type or missing required fields in schema', () => {
      const invalidPayload = {
        orderId: '',
        sampleType: 'InvalidSampleType',
      };

      const result = createSampleSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('2. Tenant Isolation & Confidentiality Stripping', () => {
    it('ensures buyers only receive samples matching their buyerOrganizationId', async () => {
      const org1Samples = await getSamplesForBuyer('TEST-ORDER-001', 'buyer-org-001');
      expect(org1Samples.length).toBeGreaterThan(0);
      expect(org1Samples.every((s) => s.buyerOrganizationId === 'buyer-org-001')).toBe(true);

      const org2Samples = await getSamplesForBuyer('TEST-ORDER-001', 'buyer-org-002');
      expect(org2Samples.length).toBe(0);
    });

    it('strictly strips internal remarks, internal comments, and internal attachments from buyer query', async () => {
      // 1. Create a sample with both internal and buyer data
      const sample = await createSample(
        {
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          sampleType: 'Proto Sample',
          internalRemarks: 'SECRET: Factory cost optimization used alternative rib',
          buyerRemarks: 'Initial styling proto',
          status: 'in_development',
        },
        staffActor
      );

      // 2. Add an internal comment and a public comment
      await addSampleComment(sample.id, 'Internal QA note: check stitch density', true, staffActor);
      await addSampleComment(sample.id, 'Public spec update: fabric is 100% organic cotton', false, staffActor);

      // 3. Add an internal attachment and a buyer attachment
      await uploadSampleAttachment(
        sample.id,
        {
          sampleId: sample.id,
          fileName: 'confidential_costing_sheet.pdf',
          fileSize: '1.2 MB',
          fileType: 'application/pdf',
          visibility: 'internal',
          caption: 'Internal factory margin breakdown',
        },
        staffActor
      );
      await uploadSampleAttachment(
        sample.id,
        {
          sampleId: sample.id,
          fileName: 'garment_front_view.jpg',
          fileSize: '3.4 MB',
          fileType: 'image/jpeg',
          visibility: 'buyer',
          caption: 'High-res proto front view',
        },
        staffActor
      );

      // 4. Staff view should have all data intact
      const staffSamples = await getSamplesByOrder('TEST-ORDER-001');
      const staffSample = staffSamples.find((s) => s.id === sample.id);
      expect(staffSample?.internalRemarks).toContain('SECRET');
      expect(staffSample?.comments?.some((c) => c.isInternalOnly)).toBe(true);
      expect(staffSample?.attachments?.some((a) => a.visibility === 'internal')).toBe(true);

      // 5. Buyer view must have internal data completely stripped
      const buyerSamples = await getSamplesForBuyer('TEST-ORDER-001', 'buyer-org-001');
      const buyerSample = buyerSamples.find((s) => s.id === sample.id);
      expect(buyerSample).toBeDefined();
      expect(buyerSample?.internalRemarks).toBeUndefined();

      // Check comments
      expect(buyerSample?.comments?.every((c) => !c.isInternalOnly)).toBe(true);
      expect(buyerSample?.comments?.some((c) => c.comment.includes('100% organic cotton'))).toBe(true);
      expect(buyerSample?.comments?.some((c) => c.comment.includes('Internal QA note'))).toBe(false);

      // Check attachments
      expect(buyerSample?.attachments?.every((a) => a.visibility === 'buyer')).toBe(true);
      expect(buyerSample?.attachments?.some((a) => a.fileName === 'garment_front_view.jpg')).toBe(true);
      expect(buyerSample?.attachments?.some((a) => a.fileName === 'confidential_costing_sheet.pdf')).toBe(false);
    });
  });

  describe('3. Submission & Buyer Review Flow', () => {
    it('allows staff to submit a sample for buyer review with dispatch info', async () => {
      const sample = await createSample(
        {
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          sampleType: 'Size Set',
          status: 'in_development',
        },
        staffActor
      );

      const submitted = await submitSampleForBuyerReview(
        sample.id,
        { courierName: 'FedEx Priority', trackingNumber: 'FDX-9988-7711' },
        staffActor
      );

      expect(submitted.status).toBe('submitted');
      expect(submitted.courierName).toBe('FedEx Priority');
      expect(submitted.trackingNumber).toBe('FDX-9988-7711');
      expect(submitted.submittedAt).toBeDefined();
    });

    it('enforces schema requiring feedback when changes requested or sample rejected', () => {
      const emptyFeedbackDecision = {
        sampleId: 'sample-001',
        decision: 'changes_requested' as const,
        feedback: '',
      };
      const validDecision = {
        sampleId: 'sample-001',
        decision: 'changes_requested' as const,
        feedback: 'Please shorten sleeve length by 1.5cm across all sizes.',
      };

      const failParse = buyerSampleDecisionSchema.safeParse(emptyFeedbackDecision);
      expect(failParse.success).toBe(false);

      const passParse = buyerSampleDecisionSchema.safeParse(validDecision);
      expect(passParse.success).toBe(true);
    });

    it('records buyer approval decision', async () => {
      const sample = await createSample(
        {
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          sampleType: 'Pre-Production (PP)',
          status: 'in_development',
        },
        staffActor
      );

      await submitSampleForBuyerReview(sample.id, {}, staffActor);

      const approved = await recordBuyerSampleDecision(
        sample.id,
        {
          sampleId: sample.id,
          decision: 'approved',
          feedback: 'Looks fantastic! Approved for bulk cut.',
        },
        buyerActor
      );

      expect(approved.status).toBe('approved');
      expect(approved.buyerFeedback).toBe('Looks fantastic! Approved for bulk cut.');
      expect(approved.decidedAt).toBeDefined();
      expect(approved.decidedBy).toBe('Alex Buyer');
    });

    it('rejects buyer decision if tenant organization does not match', async () => {
      const sample = await createSample(
        {
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          sampleType: 'Lab Dip / Strike-Off',
          status: 'submitted',
        },
        staffActor
      );

      await expect(
        recordBuyerSampleDecision(
          sample.id,
          {
            sampleId: sample.id,
            decision: 'approved',
            feedback: 'Approved',
          },
          {
            uid: 'buyer-intruder',
            role: 'Buyer',
            buyerOrganizationId: 'buyer-org-999', // unauthorized tenant
          }
        )
      ).rejects.toThrow('authorized');
    });
  });

  describe('4. Non-Destructive Revision Progression (v1 -> v2 -> v3)', () => {
    it('creates revision round v2 while preserving v1 history and buyer feedback', async () => {
      // 1. Initial sample created & submitted
      const v1 = await createSample(
        {
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          sampleType: 'Fit Sample',
          status: 'in_development',
          buyerRemarks: 'Initial v1 fit',
        },
        staffActor
      );

      await submitSampleForBuyerReview(v1.id, { trackingNumber: 'DHL-1111' }, staffActor);

      // 2. Buyer requests changes
      const rejectedV1 = await recordBuyerSampleDecision(
        v1.id,
        {
          sampleId: v1.id,
          decision: 'changes_requested',
          feedback: 'Chest circumference +2cm too loose. Adjust pattern.',
        },
        buyerActor
      );
      expect(rejectedV1.status).toBe('changes_requested');

      // 3. Merchandiser starts revision v2
      const v2 = await createSampleRevision(
        {
          sampleId: v1.id,
          revisionNotes: 'Pattern graded down 2cm on chest circumference.',
          targetDate: '2026-09-25',
        },
        staffActor
      );

      expect(v2.revisionNumber).toBe(2);
      expect(v2.status).toBe('in_development');
      expect(v2.buyerFeedback).toBeUndefined(); // Cleared for the new round
      expect(v2.history).toBeDefined();
      expect(v2.history?.length).toBe(1);

      const archivedRound1 = v2.history?.[0];
      expect(archivedRound1?.revisionNumber).toBe(1);
      expect(archivedRound1?.status).toBe('changes_requested');
      expect(archivedRound1?.buyerFeedback).toBe('Chest circumference +2cm too loose. Adjust pattern.');
      expect(archivedRound1?.notes).toBe('Revision 2 started: Pattern graded down 2cm on chest circumference.');
    });
  });

  describe('5. Sample Attachment & Discussion Lifecycle', () => {
    it('supports adding and deleting attachments', async () => {
      const sample = await createSample(
        {
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          sampleType: 'Pre-Production (PP)',
          status: 'in_development',
        },
        staffActor
      );

      const attachment = await uploadSampleAttachment(
        sample.id,
        {
          sampleId: sample.id,
          fileName: 'collar_construction_detail.png',
          fileSize: '1.8 MB',
          fileType: 'image/png',
          visibility: 'buyer',
          caption: 'Collar rib join close-up',
        },
        staffActor
      );

      expect(attachment.id).toBeDefined();

      const updated = await deleteSampleAttachment(sample.id, attachment.id, staffActor);
      expect(updated.attachments?.some((a) => a.id === attachment.id)).toBe(false);
    });
  });
});
