import {
  BusinessDocument,
  DocumentCategory,
  DocumentVisibility,
  DocumentStatus,
  DocumentRevisionHistory,
} from '@/types/document';
import { db, isConfigured } from '@/lib/firebase/client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { logSecurityEvent } from '@/lib/audit';
import { hasPermission } from '@/lib/auth/permissions';
import { UserRole } from '@/types/auth';
import {
  CreateDocumentInput,
  CreateDocumentRevisionInput,
  createDocumentSchema,
  createDocumentRevisionSchema,
} from '@/lib/validation/document.schema';

/**
 * Human-readable file size formatter
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Seed documents fixture for offline development, local demonstration, and integration tests.
 * All fixtures are synthetic test records clearly marked for QA.
 */
export const TEST_DOCUMENTS: BusinessDocument[] = [
  {
    id: 'doc-demo-001',
    title: 'Approved Tech Pack v2.1 - Organic Jersey Crewneck',
    fileName: 'STY-KNIT-880_Approved_TechPack_v2.1.pdf',
    storagePath: '/orders/TEST-ORDER-001/documents/STY-KNIT-880_Approved_TechPack_v2.1.pdf',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    category: 'Tech Pack',
    type: 'Tech Pack',
    name: 'Approved Tech Pack v2.1 - Organic Jersey Crewneck',
    visibility: 'buyer',
    status: 'active',
    version: 2,
    mimeType: 'application/pdf',
    fileSize: 4404019, // ~4.2 MB
    fileSizeFormatted: '4.2 MB',
    buyerOrganizationId: 'buyer-org-001',
    orderId: 'TEST-ORDER-001',
    orderNumber: 'PO-2026-9901',
    styleNumber: 'STY-KNIT-880',
    description: 'Technical measurement specs, grading tolerances, and stitching detail breakdown.',
    uploadedBy: 'staff-admin-001',
    uploaderName: 'Super Admin',
    uploaderRole: 'Super Admin',
    isLatest: true,
    downloadCount: 14,
    verified: true,
    history: [
      {
        id: 'hist-doc-001-v1',
        documentId: 'doc-demo-001',
        version: 1,
        fileName: 'STY-KNIT-880_TechPack_v1.0.pdf',
        fileSize: 4194304,
        fileSizeFormatted: '4.0 MB',
        mimeType: 'application/pdf',
        storagePath: '/orders/TEST-ORDER-001/documents/STY-KNIT-880_TechPack_v1.0.pdf',
        changeNote: 'Initial tech pack release from merchandiser',
        uploadedBy: 'merch-001',
        uploaderName: 'Jane Merchandiser',
        uploaderRole: 'Merchandiser',
        createdAt: '2026-08-15T09:00:00Z',
      },
    ],
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-08-20T11:30:00Z',
  },
  {
    id: 'doc-demo-002',
    title: 'Spectrophotometer Lab-Dip Colorway Approval Report',
    fileName: 'LabDip_ShadeApproval_STY-KNIT-880.pdf',
    storagePath: '/orders/TEST-ORDER-001/documents/LabDip_ShadeApproval_STY-KNIT-880.pdf',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    category: 'Approval',
    type: 'Approval',
    name: 'Spectrophotometer Lab-Dip Colorway Approval Report',
    visibility: 'buyer',
    status: 'active',
    version: 1,
    mimeType: 'application/pdf',
    fileSize: 1887436, // ~1.8 MB
    fileSizeFormatted: '1.8 MB',
    buyerOrganizationId: 'buyer-org-001',
    orderId: 'TEST-ORDER-001',
    orderNumber: 'PO-2026-9901',
    styleNumber: 'STY-KNIT-880',
    description: 'Delta E spectrophotometer color matching under D65 / TL84 light sources.',
    uploadedBy: 'merch-001',
    uploaderName: 'Jane Merchandiser',
    uploaderRole: 'Merchandiser',
    isLatest: true,
    downloadCount: 6,
    verified: true,
    history: [],
    createdAt: '2026-08-22T14:15:00Z',
    updatedAt: '2026-08-22T14:15:00Z',
  },
  {
    id: 'doc-demo-003',
    title: 'Inline Quality Audit & Needle Metal Detection Certificate',
    fileName: 'Inline_QC_Audit_Report_PO-2026-9901.pdf',
    storagePath: '/orders/TEST-ORDER-001/documents/Inline_QC_Audit_Report_PO-2026-9901.pdf',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    category: 'Inspection',
    type: 'Inspection',
    name: 'Inline Quality Audit & Needle Metal Detection Certificate',
    visibility: 'buyer',
    status: 'active',
    version: 1,
    mimeType: 'application/pdf',
    fileSize: 3250585, // ~3.1 MB
    fileSizeFormatted: '3.1 MB',
    buyerOrganizationId: 'buyer-org-001',
    orderId: 'TEST-ORDER-001',
    orderNumber: 'PO-2026-9901',
    styleNumber: 'STY-KNIT-880',
    description: 'AQL 1.5 inline audit log signed by Lead QA Inspector.',
    uploadedBy: 'staff-prod-001',
    uploaderName: 'QC Lead Inspector',
    uploaderRole: 'QC Staff',
    isLatest: true,
    downloadCount: 8,
    verified: true,
    history: [],
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'doc-demo-004',
    title: 'Internal Factory Margin & Subcontractor Cost Breakdown',
    fileName: 'Internal_Cost_Yield_PO-2026-9901_CONFIDENTIAL.xlsx',
    storagePath: '/documents/buyer-org-001/doc-demo-004/Internal_Cost_Yield_PO-2026-9901_CONFIDENTIAL.xlsx',
    category: 'Commercial',
    type: 'Commercial',
    name: 'Internal Factory Margin & Subcontractor Cost Breakdown',
    visibility: 'internal',
    status: 'active',
    version: 1,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileSize: 819200, // ~800 KB
    fileSizeFormatted: '800 KB',
    buyerOrganizationId: 'buyer-org-001',
    orderId: 'TEST-ORDER-001',
    orderNumber: 'PO-2026-9901',
    description: 'CONFIDENTIAL: Internal factory labor efficiency and yarn consumption costing.',
    uploadedBy: 'merch-001',
    uploaderName: 'Jane Merchandiser',
    uploaderRole: 'Merchandiser',
    isLatest: true,
    downloadCount: 2,
    history: [],
    createdAt: '2026-08-16T16:00:00Z',
    updatedAt: '2026-08-16T16:00:00Z',
  },
  {
    id: 'doc-demo-005',
    title: 'Executive Supplier Governance & Banking Escrow Agreement',
    fileName: 'Executive_Escrow_Contract_RESTRICTED.pdf',
    storagePath: '/documents/buyer-org-001/doc-demo-005/Executive_Escrow_Contract_RESTRICTED.pdf',
    category: 'Commercial',
    type: 'Commercial',
    name: 'Executive Supplier Governance & Banking Escrow Agreement',
    visibility: 'restricted',
    status: 'active',
    version: 1,
    mimeType: 'application/pdf',
    fileSize: 2097152, // ~2.0 MB
    fileSizeFormatted: '2.0 MB',
    buyerOrganizationId: 'buyer-org-001',
    description: 'Executive legal agreement under British Commercial Law.',
    uploadedBy: 'staff-admin-001',
    uploaderName: 'Super Admin',
    uploaderRole: 'Super Admin',
    isLatest: true,
    downloadCount: 1,
    history: [],
    createdAt: '2026-08-01T12:00:00Z',
    updatedAt: '2026-08-01T12:00:00Z',
  },
  {
    id: 'doc-demo-006',
    title: 'Archived Fitting Spec Sheet v1.0 - Obsolete',
    fileName: 'STY-KNIT-880_Old_Spec_Archived.pdf',
    storagePath: '/orders/TEST-ORDER-001/documents/STY-KNIT-880_Old_Spec_Archived.pdf',
    category: 'Specification',
    type: 'Specification',
    name: 'Archived Fitting Spec Sheet v1.0 - Obsolete',
    visibility: 'buyer',
    status: 'archived',
    version: 1,
    mimeType: 'application/pdf',
    fileSize: 1572864, // ~1.5 MB
    fileSizeFormatted: '1.5 MB',
    buyerOrganizationId: 'buyer-org-001',
    orderId: 'TEST-ORDER-001',
    orderNumber: 'PO-2026-9901',
    description: 'Superseded specification document.',
    uploadedBy: 'merch-001',
    uploaderName: 'Jane Merchandiser',
    uploaderRole: 'Merchandiser',
    isLatest: false,
    archivedAt: '2026-08-20T11:25:00Z',
    archivedBy: 'merch-001',
    archivedReason: 'Superseded by Approved Tech Pack v2.1',
    downloadCount: 3,
    history: [],
    createdAt: '2026-08-10T08:00:00Z',
    updatedAt: '2026-08-20T11:25:00Z',
  },
  {
    id: 'doc-demo-007',
    title: 'Nordic Fashion PO-2026-8840 Master Tech Pack',
    fileName: 'PO-2026-8840_TechPack_Master.pdf',
    storagePath: '/documents/buyer-org-002/doc-demo-007/PO-2026-8840_TechPack_Master.pdf',
    category: 'Tech Pack',
    type: 'Tech Pack',
    name: 'Nordic Fashion PO-2026-8840 Master Tech Pack',
    visibility: 'buyer',
    status: 'active',
    version: 1,
    mimeType: 'application/pdf',
    fileSize: 3145728,
    fileSizeFormatted: '3.0 MB',
    buyerOrganizationId: 'buyer-org-002',
    orderId: 'PO-2026-8840',
    orderNumber: 'PO-2026-8840',
    description: 'Tech Pack for Buyer Org 002.',
    uploadedBy: 'merch-001',
    isLatest: true,
    history: [],
    createdAt: '2026-08-25T10:00:00Z',
    updatedAt: '2026-08-25T10:00:00Z',
  },
];

let inMemoryDocuments: BusinessDocument[] = [...TEST_DOCUMENTS];

export interface DocumentFilters {
  category?: DocumentCategory | 'ALL';
  visibility?: DocumentVisibility | 'ALL';
  status?: DocumentStatus | 'ALL';
  buyerOrganizationId?: string | 'ALL';
  orderId?: string | 'ALL';
  searchQuery?: string;
}

/**
 * Retrieves all business documents for administrative and operational staff.
 * Filters restricted documents if the user lacks elevated 'documents.restricted' permission.
 */
export async function getDocuments(
  filters?: DocumentFilters,
  actor?: { uid: string; role: string }
): Promise<BusinessDocument[]> {
  let results = [...inMemoryDocuments];

  if (isConfigured && db) {
    try {
      const docsRef = collection(db, 'documents');
      const snap = await getDocs(docsRef);
      if (!snap.empty) {
        results = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || data.name,
            fileName: data.fileName,
            storagePath: data.storagePath,
            url: data.url,
            category: data.category || data.type,
            type: data.type || data.category,
            name: data.name || data.title,
            visibility: data.visibility || 'buyer',
            status: data.status || 'active',
            version: data.version || 1,
            mimeType: data.mimeType || 'application/pdf',
            fileSize: data.fileSize || 0,
            fileSizeFormatted: data.fileSizeFormatted || formatBytes(data.fileSize || 0),
            buyerOrganizationId: data.buyerOrganizationId,
            orderId: data.orderId || null,
            orderNumber: data.orderNumber || null,
            styleNumber: data.styleNumber || null,
            description: data.description || '',
            uploadedBy: data.uploadedBy,
            uploaderName: data.uploaderName,
            uploaderRole: data.uploaderRole,
            isLatest: data.isLatest ?? true,
            revisionOf: data.revisionOf || null,
            history: data.history || [],
            archivedAt: data.archivedAt?.toDate ? data.archivedAt.toDate().toISOString() : data.archivedAt || null,
            archivedBy: data.archivedBy || null,
            archivedReason: data.archivedReason || null,
            downloadCount: data.downloadCount || 0,
            verified: data.verified ?? false,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
          };
        });
      }
    } catch (err) {
      console.warn('[Firestore] Error reading documents, falling back to local store:', err);
    }
  }

  // RBAC Restricted Filter: If actor role is specified and does not have documents.restricted permission
  if (actor?.role && !hasPermission(actor.role as UserRole, 'documents.restricted')) {
    results = results.filter((d) => d.visibility !== 'restricted');
  }

  if (filters) {
    if (filters.category && filters.category !== 'ALL') {
      results = results.filter((d) => d.category === filters.category);
    }
    if (filters.visibility && filters.visibility !== 'ALL') {
      results = results.filter((d) => d.visibility === filters.visibility);
    }
    if (filters.status && filters.status !== 'ALL') {
      results = results.filter((d) => d.status === filters.status);
    }
    if (filters.buyerOrganizationId && filters.buyerOrganizationId !== 'ALL') {
      results = results.filter((d) => d.buyerOrganizationId === filters.buyerOrganizationId);
    }
    if (filters.orderId && filters.orderId !== 'ALL') {
      results = results.filter((d) => d.orderId === filters.orderId);
    }
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase();
      results = results.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.fileName.toLowerCase().includes(q) ||
          (d.orderNumber || '').toLowerCase().includes(q) ||
          (d.description || '').toLowerCase().includes(q)
      );
    }
  }

  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Retrieves documents specifically for an authenticated Buyer Organization.
 * Strictly enforces:
 *  1. `buyerOrganizationId === buyerOrgId` (Tenant Isolation)
 *  2. `visibility === 'buyer'` (Hides internal and restricted documents)
 *  3. `status === 'active'` (Hides internal drafts and archived docs unless explicitly permitted)
 *  4. Strips internal metadata and staff-only revision histories.
 */
export async function getDocumentsForBuyer(
  buyerOrganizationId: string,
  filters?: { category?: DocumentCategory | 'ALL'; orderId?: string | 'ALL'; searchQuery?: string }
): Promise<BusinessDocument[]> {
  const allDocs = await getDocuments();

  // Strict Tenant Isolation & Visibility Boundary
  let buyerDocs = allDocs.filter(
    (d) =>
      d.buyerOrganizationId === buyerOrganizationId &&
      d.visibility === 'buyer' &&
      d.status === 'active'
  );

  if (filters) {
    if (filters.category && filters.category !== 'ALL') {
      buyerDocs = buyerDocs.filter((d) => d.category === filters.category);
    }
    if (filters.orderId && filters.orderId !== 'ALL') {
      buyerDocs = buyerDocs.filter((d) => d.orderId === filters.orderId);
    }
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase();
      buyerDocs = buyerDocs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.fileName.toLowerCase().includes(q) ||
          (d.orderNumber || '').toLowerCase().includes(q)
      );
    }
  }

  // Sanitize: strip internal change notes from historical revisions
  return buyerDocs.map((doc) => ({
    ...doc,
    history: (doc.history || []).map((h) => ({
      id: h.id,
      documentId: h.documentId,
      version: h.version,
      fileName: h.fileName,
      fileSize: h.fileSize,
      fileSizeFormatted: h.fileSizeFormatted,
      mimeType: h.mimeType,
      storagePath: h.storagePath,
      url: h.url,
      changeNote: 'Revision updated',
      uploadedBy: 'Authorized Staff',
      createdAt: h.createdAt,
    })),
  }));
}

/**
 * Retrieves documents linked to a specific Purchase Order.
 * If `buyerOrganizationId` is supplied, applies strict tenant and buyer-visibility filtering.
 */
export async function getDocumentsByOrder(
  orderId: string,
  buyerOrganizationId?: string
): Promise<BusinessDocument[]> {
  if (buyerOrganizationId) {
    return getDocumentsForBuyer(buyerOrganizationId, { orderId });
  }

  const allDocs = await getDocuments();
  return allDocs.filter((d) => d.orderId === orderId);
}

/**
 * Retrieves a single document by its ID.
 */
export async function getDocumentById(documentId: string): Promise<BusinessDocument | null> {
  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'documents', documentId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: snap.id,
          title: data.title || data.name,
          fileName: data.fileName,
          storagePath: data.storagePath,
          url: data.url,
          category: data.category || data.type,
          type: data.type || data.category,
          name: data.name || data.title,
          visibility: data.visibility || 'buyer',
          status: data.status || 'active',
          version: data.version || 1,
          mimeType: data.mimeType || 'application/pdf',
          fileSize: data.fileSize || 0,
          fileSizeFormatted: data.fileSizeFormatted || formatBytes(data.fileSize || 0),
          buyerOrganizationId: data.buyerOrganizationId,
          orderId: data.orderId || null,
          orderNumber: data.orderNumber || null,
          styleNumber: data.styleNumber || null,
          description: data.description || '',
          uploadedBy: data.uploadedBy,
          uploaderName: data.uploaderName,
          uploaderRole: data.uploaderRole,
          isLatest: data.isLatest ?? true,
          revisionOf: data.revisionOf || null,
          history: data.history || [],
          archivedAt: data.archivedAt?.toDate ? data.archivedAt.toDate().toISOString() : data.archivedAt || null,
          archivedBy: data.archivedBy || null,
          archivedReason: data.archivedReason || null,
          downloadCount: data.downloadCount || 0,
          verified: data.verified ?? false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('[Firestore] Error getting document:', err);
    }
  }

  return inMemoryDocuments.find((d) => d.id === documentId) || null;
}

/**
 * Registers / Uploads a new business document record into the vault.
 */
export async function createDocument(
  input: CreateDocumentInput,
  actor: { uid: string; role: string; displayName?: string }
): Promise<BusinessDocument> {
  const validated = createDocumentSchema.parse(input);

  if (!hasPermission(actor.role as UserRole, 'documents.write')) {
    throw new Error('Access Denied: You do not have permission to upload documents.');
  }

  if (validated.visibility === 'restricted' && !hasPermission(actor.role as UserRole, 'documents.restricted')) {
    throw new Error('Access Denied: You are not authorized to create restricted governance documents.');
  }

  const now = new Date().toISOString();
  const docId = `doc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
  const storagePath = validated.orderId
    ? `/orders/${validated.orderId}/documents/${validated.fileName}`
    : `/documents/${validated.buyerOrganizationId}/${docId}/${validated.fileName}`;

  const newDoc: BusinessDocument = {
    id: docId,
    title: validated.title,
    name: validated.title,
    fileName: validated.fileName,
    storagePath,
    url: validated.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    category: validated.category,
    type: validated.category,
    visibility: validated.visibility,
    status: validated.status,
    version: 1,
    mimeType: validated.mimeType,
    fileSize: validated.fileSize,
    fileSizeFormatted: formatBytes(validated.fileSize),
    buyerOrganizationId: validated.buyerOrganizationId,
    orderId: validated.orderId || null,
    orderNumber: validated.orderNumber || null,
    styleNumber: validated.styleNumber || null,
    description: validated.description || '',
    uploadedBy: actor.uid,
    uploaderName: actor.displayName || actor.role,
    uploaderRole: actor.role,
    isLatest: true,
    history: [],
    downloadCount: 0,
    verified: true,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryDocuments.unshift(newDoc);

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'DOCUMENT_UPLOADED',
    entityId: docId,
    after: {
      title: newDoc.title,
      fileName: newDoc.fileName,
      category: newDoc.category,
      visibility: newDoc.visibility,
      buyerOrganizationId: newDoc.buyerOrganizationId,
      orderId: newDoc.orderId,
    },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'documents', docId);
      await setDoc(docRef, {
        ...newDoc,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Firestore] Error creating document:', err);
    }
  }

  return newDoc;
}

/**
 * Creates a new version (v2, v3) of an existing document without destructive overwrites.
 * Archives the previous version into immutable history and updates the latest pointer.
 */
export async function createDocumentRevision(
  input: CreateDocumentRevisionInput,
  actor: { uid: string; role: string; displayName?: string }
): Promise<BusinessDocument> {
  const validated = createDocumentRevisionSchema.parse(input);

  if (!hasPermission(actor.role as UserRole, 'documents.write')) {
    throw new Error('Access Denied: You do not have permission to upload document revisions.');
  }

  const existing = await getDocumentById(validated.documentId);
  if (!existing) {
    throw new Error(`Document with ID ${validated.documentId} not found.`);
  }

  if (existing.status === 'archived') {
    throw new Error('Cannot upload revision to an archived document. Please restore it first.');
  }

  const now = new Date().toISOString();
  const nextVersion = existing.version + 1;

  const previousRoundHistory: DocumentRevisionHistory = {
    id: `hist-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
    documentId: existing.id,
    version: existing.version,
    fileName: existing.fileName,
    fileSize: existing.fileSize,
    fileSizeFormatted: existing.fileSizeFormatted,
    mimeType: existing.mimeType,
    storagePath: existing.storagePath,
    url: existing.url,
    changeNote: validated.changeNote,
    uploadedBy: existing.uploadedBy,
    uploaderName: existing.uploaderName,
    uploaderRole: existing.uploaderRole,
    createdAt: existing.updatedAt || existing.createdAt,
  };

  const newStoragePath = existing.orderId
    ? `/orders/${existing.orderId}/documents/${validated.fileName}`
    : `/documents/${existing.buyerOrganizationId}/${existing.id}/${validated.fileName}`;

  const updated: BusinessDocument = {
    ...existing,
    fileName: validated.fileName,
    fileSize: validated.fileSize,
    fileSizeFormatted: formatBytes(validated.fileSize),
    mimeType: validated.mimeType,
    storagePath: newStoragePath,
    url: validated.url || existing.url,
    version: nextVersion,
    isLatest: true,
    history: [...(existing.history || []), previousRoundHistory],
    uploadedBy: actor.uid,
    uploaderName: actor.displayName || actor.role,
    uploaderRole: actor.role,
    updatedAt: now,
  };

  const idx = inMemoryDocuments.findIndex((d) => d.id === validated.documentId);
  if (idx !== -1) {
    inMemoryDocuments[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'DOCUMENT_REVISION_CREATED',
    entityId: existing.id,
    after: {
      newVersion: nextVersion,
      changeNote: validated.changeNote,
      fileName: validated.fileName,
    },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'documents', existing.id);
      await updateDoc(docRef, {
        fileName: updated.fileName,
        fileSize: updated.fileSize,
        fileSizeFormatted: updated.fileSizeFormatted,
        mimeType: updated.mimeType,
        storagePath: updated.storagePath,
        url: updated.url,
        version: nextVersion,
        history: updated.history,
        uploadedBy: actor.uid,
        uploaderName: updated.uploaderName,
        uploaderRole: updated.uploaderRole,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Firestore] Error creating revision:', err);
    }
  }

  return updated;
}

/**
 * Updates document metadata (title, category, visibility, description).
 */
export async function updateDocumentMetadata(
  documentIdOrPayload: string | (Partial<CreateDocumentInput> & { documentId: string }),
  updatesOrActor: Partial<CreateDocumentInput> | { uid: string; role: string },
  maybeActor?: { uid: string; role: string }
): Promise<BusinessDocument> {
  const documentId = typeof documentIdOrPayload === 'string' ? documentIdOrPayload : documentIdOrPayload.documentId;
  const updates: Partial<CreateDocumentInput> = typeof documentIdOrPayload === 'object' ? documentIdOrPayload : (updatesOrActor as Partial<CreateDocumentInput>);
  const actor = maybeActor || (updatesOrActor as { uid: string; role: string });

  const existing = await getDocumentById(documentId);
  if (!existing) {
    throw new Error(`Document ${documentId} not found.`);
  }

  if (!hasPermission(actor.role as UserRole, 'documents.write')) {
    throw new Error('Access Denied: You do not have permission to modify document metadata.');
  }

  const now = new Date().toISOString();
  const visibilityChanged = updates.visibility && updates.visibility !== existing.visibility;

  const updated: BusinessDocument = {
    ...existing,
    title: updates.title || existing.title,
    name: updates.title || existing.title,
    category: updates.category || existing.category,
    type: updates.category || existing.type,
    visibility: updates.visibility || existing.visibility,
    description: updates.description !== undefined ? updates.description : existing.description,
    orderId: updates.orderId !== undefined ? updates.orderId : existing.orderId,
    orderNumber: updates.orderNumber !== undefined ? updates.orderNumber : existing.orderNumber,
    updatedAt: now,
  };

  const idx = inMemoryDocuments.findIndex((d) => d.id === documentId);
  if (idx !== -1) {
    inMemoryDocuments[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: visibilityChanged ? 'DOCUMENT_VISIBILITY_CHANGED' : 'DOCUMENT_UPDATED',
    entityId: documentId,
    before: { visibility: existing.visibility, title: existing.title },
    after: { visibility: updated.visibility, title: updated.title },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'documents', documentId);
      await updateDoc(docRef, {
        title: updated.title,
        name: updated.title,
        category: updated.category,
        type: updated.type,
        visibility: updated.visibility,
        description: updated.description,
        orderId: updated.orderId,
        orderNumber: updated.orderNumber,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Firestore] Error updating document metadata:', err);
    }
  }

  return updated;
}

/**
 * Soft-archives a document from active circulation.
 */
export async function archiveDocument(
  documentIdOrPayload: string | { documentId: string; reason?: string },
  reasonOrActor?: string | { uid: string; role: string },
  maybeActor?: { uid: string; role: string }
): Promise<BusinessDocument> {
  const documentId = typeof documentIdOrPayload === 'string' ? documentIdOrPayload : documentIdOrPayload.documentId;
  const reason = typeof documentIdOrPayload === 'object' ? documentIdOrPayload.reason || '' : (typeof reasonOrActor === 'string' ? reasonOrActor : '');
  const actor = maybeActor || (typeof reasonOrActor === 'object' ? reasonOrActor : { uid: 'system', role: 'Super Admin' });

  const existing = await getDocumentById(documentId);
  if (!existing) {
    throw new Error(`Document ${documentId} not found.`);
  }

  if (!hasPermission(actor.role as UserRole, 'documents.archive')) {
    throw new Error('Access Denied: You do not have permission to archive documents.');
  }

  const now = new Date().toISOString();
  const updated: BusinessDocument = {
    ...existing,
    status: 'archived',
    archivedAt: now,
    archivedBy: actor.uid,
    archivedReason: reason || 'Archived by operational staff',
    isLatest: false,
    updatedAt: now,
  };

  const idx = inMemoryDocuments.findIndex((d) => d.id === documentId);
  if (idx !== -1) {
    inMemoryDocuments[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'DOCUMENT_ARCHIVED',
    entityId: documentId,
    after: { reason },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'documents', documentId);
      await updateDoc(docRef, {
        status: 'archived',
        archivedAt: serverTimestamp(),
        archivedBy: actor.uid,
        archivedReason: reason,
        isLatest: false,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Firestore] Error archiving document:', err);
    }
  }

  return updated;
}

/**
 * Restores an archived document back to active status.
 */
export async function restoreDocument(
  documentId: string,
  actor: { uid: string; role: string }
): Promise<BusinessDocument> {
  const existing = await getDocumentById(documentId);
  if (!existing) {
    throw new Error(`Document ${documentId} not found.`);
  }

  if (!hasPermission(actor.role as UserRole, 'documents.archive')) {
    throw new Error('Access Denied: You do not have permission to restore documents.');
  }

  const now = new Date().toISOString();
  const updated: BusinessDocument = {
    ...existing,
    status: 'active',
    archivedAt: null,
    archivedBy: null,
    archivedReason: null,
    isLatest: true,
    updatedAt: now,
  };

  const idx = inMemoryDocuments.findIndex((d) => d.id === documentId);
  if (idx !== -1) {
    inMemoryDocuments[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'DOCUMENT_RESTORED',
    entityId: documentId,
    after: { status: 'active' },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'documents', documentId);
      await updateDoc(docRef, {
        status: 'active',
        archivedAt: null,
        archivedBy: null,
        archivedReason: null,
        isLatest: true,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Firestore] Error restoring document:', err);
    }
  }

  return updated;
}

/**
 * Hard-deletes a document record. Restricted strictly to Super Admin and Admin roles.
 */
export async function deleteDocument(
  documentId: string,
  actor: { uid: string; role: string }
): Promise<BusinessDocument> {
  const existing = await getDocumentById(documentId);
  if (!existing) {
    throw new Error(`Document ${documentId} not found.`);
  }

  if (!hasPermission(actor.role as UserRole, 'documents.delete')) {
    throw new Error('Access Denied: Only Super Admin and Admin may permanently delete documents.');
  }

  const archivedDoc: BusinessDocument = {
    ...existing,
    status: 'archived',
    archivedAt: new Date().toISOString(),
    archivedBy: actor.uid,
    archivedReason: 'Deleted / Purged by Admin',
  };

  inMemoryDocuments = inMemoryDocuments.filter((d) => d.id !== documentId);

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'DOCUMENT_DELETED',
    entityId: documentId,
    before: { title: existing.title, fileName: existing.fileName },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'documents', documentId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('[Firestore] Error deleting document:', err);
    }
  }

  return archivedDoc;
}

/**
 * Security access boundary for document downloading / viewing.
 * Validates authenticated role, buyer tenant isolation, document visibility, and active status.
 * Increments download telemetry and emits immutable audit logs.
 */
export async function generateSecureDocumentAccess(
  documentId: string,
  actor: { uid: string; role: string; buyerOrganizationId?: string }
): Promise<{ documentId: string; downloadUrl: string; url: string; fileName: string; mimeType: string }> {
  const docData = await getDocumentById(documentId);
  if (!docData) {
    throw new Error('Document not found or inaccessible.');
  }

  // Tenant Security Check for Buyers
  if (actor.role === 'Buyer') {
    if (!actor.buyerOrganizationId || actor.buyerOrganizationId !== docData.buyerOrganizationId) {
      throw new Error('Unauthorized: You do not have access to documents belonging to another organization.');
    }
    if (docData.visibility !== 'buyer') {
      throw new Error('Unauthorized: This document is classified as internal and cannot be accessed.');
    }
    if (docData.status !== 'active') {
      throw new Error('Unauthorized: This document is not in active status.');
    }
  } else {
    // Staff Security Check
    if (docData.visibility === 'restricted' && !hasPermission(actor.role as UserRole, 'documents.restricted')) {
      throw new Error('Unauthorized: Elevated permissions required for restricted documents.');
    }
  }

  // Increment download count
  docData.downloadCount = (docData.downloadCount || 0) + 1;
  const idx = inMemoryDocuments.findIndex((d) => d.id === documentId);
  if (idx !== -1) {
    inMemoryDocuments[idx].downloadCount = docData.downloadCount;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'DOCUMENT_DOWNLOADED',
    entityId: documentId,
    after: {
      fileName: docData.fileName,
      buyerOrganizationId: docData.buyerOrganizationId,
      version: docData.version,
    },
  });

  const fileUri = docData.url || docData.storagePath;

  return {
    documentId: docData.id,
    downloadUrl: fileUri,
    url: fileUri,
    fileName: docData.fileName,
    mimeType: docData.mimeType,
  };
}
