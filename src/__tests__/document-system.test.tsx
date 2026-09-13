import { describe, it, expect, vi } from 'vitest';
import {
  getDocuments,
  getDocumentsForBuyer,
  getDocumentById,
  createDocument,
  createDocumentRevision,
  updateDocumentMetadata,
  archiveDocument,
  restoreDocument,
  deleteDocument,
  generateSecureDocumentAccess,
  formatBytes,
} from '@/lib/documents';
import {
  createDocumentSchema,
  createDocumentRevisionSchema,
  updateDocumentMetadataSchema,
  MAX_DOCUMENT_FILE_SIZE,
} from '@/lib/validation/document.schema';

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

describe('Document Management & Secure File Vault — Step 11 Verification', () => {
  const adminActor = {
    uid: 'staff-admin-001',
    role: 'Admin',
    displayName: 'Sarah Admin',
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

  describe('1. Schema Validation & Utility Logic', () => {
    it('correctly formats byte sizes into readable units', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(5242880)).toBe('5 MB');
    });

    it('validates document creation schema with valid inputs', () => {
      const validPayload = {
        title: 'Spring Tech Pack v1.0',
        category: 'Tech Pack' as const,
        orderId: 'TEST-ORDER-001',
        buyerOrganizationId: 'buyer-org-001',
        visibility: 'buyer' as const,
        description: 'Approved tech pack specification for production.',
        url: 'https://storage.googleapis.com/test-bucket/techpack.pdf',
        fileName: 'techpack.pdf',
        fileSize: 4500000,
        mimeType: 'application/pdf',
      };

      const parsed = createDocumentSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it('rejects unsupported MIME types and oversized files in schema', () => {
      const invalidMimePayload = {
        title: 'Executable script',
        category: 'Other' as const,
        orderId: 'TEST-ORDER-001',
        buyerOrganizationId: 'buyer-org-001',
        visibility: 'buyer' as const,
        url: 'https://storage.googleapis.com/test/evil.exe',
        fileName: 'evil.exe',
        fileSize: 1000,
        mimeType: 'application/x-msdownload',
      };

      const result = createDocumentSchema.safeParse(invalidMimePayload);
      expect(result.success).toBe(false);

      const oversizedPayload = {
        title: 'Massive file',
        category: 'Tech Pack' as const,
        orderId: 'TEST-ORDER-001',
        buyerOrganizationId: 'buyer-org-001',
        visibility: 'buyer' as const,
        url: 'https://storage.googleapis.com/test/huge.pdf',
        fileName: 'huge.pdf',
        fileSize: MAX_DOCUMENT_FILE_SIZE + 1000, // > 50MB
        mimeType: 'application/pdf',
      };

      const oversizedResult = createDocumentSchema.safeParse(oversizedPayload);
      expect(oversizedResult.success).toBe(false);
    });

    it('validates revision and metadata schemas', () => {
      const revisionParsed = createDocumentRevisionSchema.safeParse({
        documentId: 'doc-001',
        url: 'https://storage.googleapis.com/test/revision2.pdf',
        fileName: 'techpack_v2.pdf',
        fileSize: 4600000,
        mimeType: 'application/pdf',
        changeNote: 'Updated grading scale for size XL.',
      });
      expect(revisionParsed.success).toBe(true);

      const metadataParsed = updateDocumentMetadataSchema.safeParse({
        documentId: 'doc-001',
        title: 'Updated Title',
        visibility: 'restricted',
        description: 'New description',
      });
      expect(metadataParsed.success).toBe(true);
    });
  });

  describe('2. Document Creation & Staff Operations', () => {
    it('creates a new business document with version 1 and latest flag', async () => {
      const newDoc = await createDocument(
        {
          title: 'Initial Measurement Specs',
          category: 'Tech Pack',
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          visibility: 'buyer',
          description: 'Measurement specs for base size M',
          url: 'https://storage.googleapis.com/test/meas_v1.pdf',
          fileName: 'meas_v1.pdf',
          fileSize: 2048576,
          mimeType: 'application/pdf',
        },
        merchActor
      );

      expect(newDoc.id).toBeDefined();
      expect(newDoc.version).toBe(1);
      expect(newDoc.isLatest).toBe(true);
      expect(newDoc.status).toBe('active');
      expect(newDoc.uploadedBy).toBe(merchActor.uid);
      expect(newDoc.uploaderName).toBe(merchActor.displayName);
      expect(newDoc.downloadCount).toBe(0);
      expect(newDoc.history).toEqual([]);
    });

    it('retrieves all documents for staff including internal & restricted documents', async () => {
      // Create an internal document
      await createDocument(
        {
          title: 'Internal Cost Sheet - DO NOT SHARE',
          category: 'Commercial',
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          visibility: 'internal',
          description: 'Confidential factory margin calculation',
          url: 'https://storage.googleapis.com/test/margins.pdf',
          fileName: 'margins.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
        },
        adminActor
      );

      const staffDocs = await getDocuments();
      expect(staffDocs.length).toBeGreaterThan(0);
      expect(staffDocs.some((d) => d.visibility === 'internal')).toBe(true);
    });
  });

  describe('3. Tenant Isolation & Buyer Visibility Rules', () => {
    it('strictly isolates documents by buyerOrganizationId', async () => {
      // Create document for org 1
      const docOrg1 = await createDocument(
        {
          title: 'Org 1 Lab Dip Approval',
          category: 'Approval',
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          visibility: 'buyer',
          url: 'https://storage.googleapis.com/test/labdip_org1.pdf',
          fileName: 'labdip_org1.pdf',
          fileSize: 1500000,
          mimeType: 'application/pdf',
        },
        merchActor
      );

      // Create document for org 2
      const docOrg2 = await createDocument(
        {
          title: 'Org 2 Lab Dip Approval',
          category: 'Approval',
          orderId: 'TEST-ORDER-002',
          buyerOrganizationId: 'buyer-org-002',
          visibility: 'buyer',
          url: 'https://storage.googleapis.com/test/labdip_org2.pdf',
          fileName: 'labdip_org2.pdf',
          fileSize: 1500000,
          mimeType: 'application/pdf',
        },
        merchActor
      );

      const buyer1Docs = await getDocumentsForBuyer('buyer-org-001');
      expect(buyer1Docs.some((d) => d.id === docOrg1.id)).toBe(true);
      expect(buyer1Docs.some((d) => d.id === docOrg2.id)).toBe(false);

      const buyer2Docs = await getDocumentsForBuyer('buyer-org-002');
      expect(buyer2Docs.some((d) => d.id === docOrg2.id)).toBe(true);
      expect(buyer2Docs.some((d) => d.id === docOrg1.id)).toBe(false);
    });

    it('never exposes internal or restricted documents to buyers', async () => {
      // Create an internal document for org 1
      const internalDoc = await createDocument(
        {
          title: 'Staff Internal Audit Notes',
          category: 'Inspection',
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          visibility: 'internal',
          url: 'https://storage.googleapis.com/test/internal_audit.pdf',
          fileName: 'internal_audit.pdf',
          fileSize: 1000000,
          mimeType: 'application/pdf',
        },
        adminActor
      );

      // Create a restricted document for org 1
      const restrictedDoc = await createDocument(
        {
          title: 'Restricted Executive Contract',
          category: 'Compliance',
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          visibility: 'restricted',
          url: 'https://storage.googleapis.com/test/contract.pdf',
          fileName: 'contract.pdf',
          fileSize: 1000000,
          mimeType: 'application/pdf',
        },
        adminActor
      );

      const buyerDocs = await getDocumentsForBuyer('buyer-org-001');
      expect(buyerDocs.some((d) => d.id === internalDoc.id)).toBe(false);
      expect(buyerDocs.some((d) => d.id === restrictedDoc.id)).toBe(false);
      expect(buyerDocs.every((d) => d.visibility === 'buyer')).toBe(true);
    });

    it('strips internal change notes and staff details from buyer history snapshot', async () => {
      const doc = await createDocument(
        {
          title: 'Tech Pack With Sensitive History',
          category: 'Tech Pack',
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          visibility: 'buyer',
          url: 'https://storage.googleapis.com/test/tp_v1.pdf',
          fileName: 'tp_v1.pdf',
          fileSize: 2000000,
          mimeType: 'application/pdf',
        },
        merchActor
      );

      // Create revision with sensitive change notes
      await createDocumentRevision(
        {
          documentId: doc.id,
          url: 'https://storage.googleapis.com/test/tp_v2.pdf',
          fileName: 'tp_v2.pdf',
          fileSize: 2200000,
          mimeType: 'application/pdf',
          changeNote: 'SECRET: Reduced fabric GSM from 220 to 200 to save cost',
        },
        merchActor
      );

      // Staff query should show full change notes
      const staffDoc = await getDocumentById(doc.id);
      expect(staffDoc?.history?.[0]?.changeNote).toContain('SECRET');

      // Buyer query must sanitize history
      const buyerDocs = await getDocumentsForBuyer('buyer-org-001');
      const buyerDoc = buyerDocs.find((d) => d.id === doc.id);
      expect(buyerDoc).toBeDefined();
      expect(buyerDoc?.history?.[0]?.changeNote).toBe('Revision updated');
      expect(buyerDoc?.history?.[0]?.uploadedBy).toBe('Authorized Staff');
    });
  });

  describe('4. Non-Destructive Versioning Progression (v1 -> v2 -> v3)', () => {
    it('creates revisions, increments version, and archives previous versions in history', async () => {
      // 1. Initial v1
      const doc = await createDocument(
        {
          title: 'Grading Spec Sheet',
          category: 'Specification',
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          visibility: 'buyer',
          url: 'https://storage.googleapis.com/test/grading_v1.pdf',
          fileName: 'grading_v1.pdf',
          fileSize: 1500000,
          mimeType: 'application/pdf',
        },
        merchActor
      );
      expect(doc.version).toBe(1);
      expect(doc.history?.length).toBe(0);

      // 2. Revision v2
      const v2 = await createDocumentRevision(
        {
          documentId: doc.id,
          url: 'https://storage.googleapis.com/test/grading_v2.pdf',
          fileName: 'grading_v2.pdf',
          fileSize: 1600000,
          mimeType: 'application/pdf',
          changeNote: 'Adjusted sleeve tolerances +0.5cm',
        },
        merchActor
      );
      expect(v2.version).toBe(2);
      expect(v2.fileName).toBe('grading_v2.pdf');
      expect(v2.fileSize).toBe(1600000);
      expect(v2.isLatest).toBe(true);
      expect(v2.history?.length).toBe(1);
      expect(v2.history?.[0].version).toBe(1);
      expect(v2.history?.[0].fileName).toBe('grading_v1.pdf');

      // 3. Revision v3
      const v3 = await createDocumentRevision(
        {
          documentId: doc.id,
          url: 'https://storage.googleapis.com/test/grading_v3.pdf',
          fileName: 'grading_v3.pdf',
          fileSize: 1750000,
          mimeType: 'application/pdf',
          changeNote: 'Final production release grading',
        },
        adminActor
      );
      expect(v3.version).toBe(3);
      expect(v3.fileName).toBe('grading_v3.pdf');
      expect(v3.history?.length).toBe(2);
      expect(v3.history?.[0].version).toBe(1);
      expect(v3.history?.[1].version).toBe(2);
    });
  });

  describe('5. Metadata Updates, Archiving & Restoring', () => {
    it('allows updating document metadata (title, category, visibility)', async () => {
      const doc = await createDocument(
        {
          title: 'Draft Packing List',
          category: 'Shipment',
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          visibility: 'internal',
          url: 'https://storage.googleapis.com/test/packing.pdf',
          fileName: 'packing.pdf',
          fileSize: 800000,
          mimeType: 'application/pdf',
        },
        merchActor
      );

      const updated = await updateDocumentMetadata(
        {
          documentId: doc.id,
          title: 'Finalized Verified Packing List',
          category: 'Shipment',
          visibility: 'buyer',
          description: 'Ready for customs clearance.',
        },
        merchActor
      );

      expect(updated.title).toBe('Finalized Verified Packing List');
      expect(updated.visibility).toBe('buyer');
      expect(updated.description).toBe('Ready for customs clearance.');
    });

    it('archives and restores a document, hiding archived files from buyers', async () => {
      const doc = await createDocument(
        {
          title: 'Temporary Test Certificate',
          category: 'Test Report',
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          visibility: 'buyer',
          url: 'https://storage.googleapis.com/test/temp_cert.pdf',
          fileName: 'temp_cert.pdf',
          fileSize: 950000,
          mimeType: 'application/pdf',
        },
        merchActor
      );

      // Verify buyer sees it when active
      let buyerDocs = await getDocumentsForBuyer('buyer-org-001');
      expect(buyerDocs.some((d) => d.id === doc.id)).toBe(true);

      // Archive document
      const archived = await archiveDocument(
        {
          documentId: doc.id,
          reason: 'Superseded by accredited lab certificate',
        },
        adminActor
      );
      expect(archived.status).toBe('archived');
      expect(archived.archivedAt).toBeDefined();
      expect(archived.archivedBy).toBe(adminActor.uid);

      // Buyer must no longer see the archived document
      buyerDocs = await getDocumentsForBuyer('buyer-org-001');
      expect(buyerDocs.some((d) => d.id === doc.id)).toBe(false);

      // Restore document
      const restored = await restoreDocument(doc.id, adminActor);
      expect(restored.status).toBe('active');
      expect(restored.archivedAt).toBeNull();

      // Buyer sees restored document again
      buyerDocs = await getDocumentsForBuyer('buyer-org-001');
      expect(buyerDocs.some((d) => d.id === doc.id)).toBe(true);
    });

    it('soft deletes a document when requested by authorized staff', async () => {
      const doc = await createDocument(
        {
          title: 'Erroneous Upload To Delete',
          category: 'Other',
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          visibility: 'buyer',
          url: 'https://storage.googleapis.com/test/error.pdf',
          fileName: 'error.pdf',
          fileSize: 500000,
          mimeType: 'application/pdf',
        },
        adminActor
      );

      const deleted = await deleteDocument(doc.id, adminActor);
      expect(deleted.status).toBe('archived');

      const found = await getDocumentById(doc.id);
      expect(found).toBeNull();
    });
  });

  describe('6. Secure Access Boundary & Download Auditing', () => {
    it('allows buyer to access their own buyer-visible document and increments download count', async () => {
      const doc = await createDocument(
        {
          title: 'Authorized Buyer Access Doc',
          category: 'Commercial',
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          visibility: 'buyer',
          url: 'https://storage.googleapis.com/test/buyer_invoice.pdf',
          fileName: 'buyer_invoice.pdf',
          fileSize: 1200000,
          mimeType: 'application/pdf',
        },
        merchActor
      );

      const initialDownloads = doc.downloadCount || 0;

      const accessResult = await generateSecureDocumentAccess(doc.id, buyerActorOrg1);
      expect(accessResult.documentId).toBe(doc.id);
      expect(accessResult.url).toBe(doc.url);
      expect(accessResult.fileName).toBe(doc.fileName);

      const refreshed = await getDocumentById(doc.id);
      expect(refreshed?.downloadCount).toBe(initialDownloads + 1);
    });

    it('strictly denies buyer access to another organization document', async () => {
      const docOrg2 = await createDocument(
        {
          title: 'Confidential Org 2 Spec',
          category: 'Tech Pack',
          orderId: 'TEST-ORDER-002',
          buyerOrganizationId: 'buyer-org-002',
          visibility: 'buyer',
          url: 'https://storage.googleapis.com/test/org2_spec.pdf',
          fileName: 'org2_spec.pdf',
          fileSize: 1200000,
          mimeType: 'application/pdf',
        },
        merchActor
      );

      // Buyer from Org 1 attempts to access Org 2 document
      await expect(
        generateSecureDocumentAccess(docOrg2.id, buyerActorOrg1)
      ).rejects.toThrow('Unauthorized');
    });

    it('strictly denies buyer access to internal or archived documents', async () => {
      const internalDoc = await createDocument(
        {
          title: 'Internal Memo for Org 1',
          category: 'Other',
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          visibility: 'internal',
          url: 'https://storage.googleapis.com/test/internal_memo.pdf',
          fileName: 'internal_memo.pdf',
          fileSize: 1200000,
          mimeType: 'application/pdf',
        },
        adminActor
      );

      await expect(
        generateSecureDocumentAccess(internalDoc.id, buyerActorOrg1)
      ).rejects.toThrow('Unauthorized');
    });

    it('allows staff to access any document regardless of visibility', async () => {
      const internalDoc = await createDocument(
        {
          title: 'Staff Only Document',
          category: 'Shipment',
          orderId: 'TEST-ORDER-001',
          buyerOrganizationId: 'buyer-org-001',
          visibility: 'restricted',
          url: 'https://storage.googleapis.com/test/restricted_bl.pdf',
          fileName: 'restricted_bl.pdf',
          fileSize: 1200000,
          mimeType: 'application/pdf',
        },
        adminActor
      );

      const accessResult = await generateSecureDocumentAccess(internalDoc.id, adminActor);
      expect(accessResult.documentId).toBe(internalDoc.id);
      expect(accessResult.url).toBe(internalDoc.url);
    });
  });
});
