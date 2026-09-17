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
  Sample,
  SampleAttachment,
  SampleComment,
  SampleRevisionHistory,
} from '@/types/sample';
import {
  CreateSampleInput,
  BuyerSampleDecisionInput,
  SampleAttachmentInput,
  CreateSampleRevisionInput,
  createSampleSchema,
  buyerSampleDecisionSchema,
  createSampleRevisionSchema,
} from '@/lib/validation/sample.schema';
import { logSecurityEvent } from '@/lib/audit';
import { normalizeBuyerOrgId } from '@/lib/auth/session';

// ============================================================================
// IN-MEMORY DEMO FIXTURES (For development fallback and unit testing)
// ============================================================================

export const TEST_SAMPLES: Sample[] = [
  {
    id: 'sample-001',
    orderId: 'TEST-ORDER-001',
    buyerOrganizationId: 'buyer-org-001',
    sampleType: 'Fit Sample',
    status: 'submitted',
    revisionNumber: 1,
    targetDate: '2026-08-15',
    submittedAt: '2026-08-12T10:00:00Z',
    courierName: 'DHL Express',
    trackingNumber: 'DHL-8890-4122-BD',
    courierDispatchedAt: '2026-08-12T14:30:00Z',
    internalRemarks: 'Checked collar rib tension and chest width on mannequin. Approved internally by Senior Merchandiser.',
    buyerRemarks: '1st Fit Sample dispatched in Navy Blue & Heather Grey, 100% Cotton 180 GSM Single Jersey. Grading strictly according to Tech Pack v2.1.',
    remarks: '1st Fit Sample dispatched in Navy Blue & Heather Grey, 100% Cotton 180 GSM Single Jersey.',
    attachments: [
      {
        id: 'att-001',
        sampleId: 'sample-001',
        revisionNumber: 1,
        fileName: 'Fit_Sample_v1_Mannequin_Front.jpg',
        fileSize: '2.4 MB',
        fileType: 'image/jpeg',
        storagePath: '/orders/TEST-ORDER-001/samples/sample-001/fit_front.jpg',
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        caption: 'Mannequin front drape and chest line fit',
        visibility: 'buyer',
        uploadedBy: 'staff-admin-001',
        createdAt: '2026-08-12T09:30:00Z',
      },
      {
        id: 'att-002',
        sampleId: 'sample-001',
        revisionNumber: 1,
        fileName: 'Internal_Cutting_Pattern_Deviation.pdf',
        fileSize: '1.1 MB',
        fileType: 'application/pdf',
        storagePath: '/orders/TEST-ORDER-001/samples/sample-001/internal_dev.pdf',
        caption: 'CAD tolerance report for factory pattern maker',
        visibility: 'internal',
        uploadedBy: 'staff-admin-001',
        createdAt: '2026-08-12T09:40:00Z',
      },
    ],
    history: [
      {
        id: 'hist-001',
        revisionNumber: 1,
        status: 'submitted',
        submittedAt: '2026-08-12T10:00:00Z',
        courierName: 'DHL Express',
        trackingNumber: 'DHL-8890-4122-BD',
        notes: 'Initial Fit Sample submitted for buyer fitting session.',
        createdAt: '2026-08-12T10:00:00Z',
      },
    ],
    comments: [
      {
        id: 'comm-001',
        sampleId: 'sample-001',
        authorUid: 'staff-admin-001',
        authorRole: 'Merchandiser',
        authorName: 'Senior Merchandiser',
        comment: 'Sample dispatched via DHL Express on Airway Bill #DHL-8890-4122-BD. Expected arrival at buyer HQ within 3 business days.',
        isInternalOnly: false,
        createdAt: '2026-08-12T14:45:00Z',
      },
    ],
    createdBy: 'staff-admin-001',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-12T14:30:00Z',
  },
  {
    id: 'sample-002',
    orderId: 'TEST-ORDER-001',
    buyerOrganizationId: 'buyer-org-001',
    sampleType: 'Proto Sample',
    status: 'approved',
    revisionNumber: 1,
    targetDate: '2026-07-25',
    submittedAt: '2026-07-20T10:00:00Z',
    reviewedAt: '2026-07-23T15:00:00Z',
    approvedAt: '2026-07-23T15:00:00Z',
    courierName: 'FedEx Priority',
    trackingNumber: 'FDX-9921-004-BD',
    internalRemarks: 'Fabric hand-feel and weight verified.',
    buyerRemarks: 'Initial fabric and styling proto sample.',
    buyerFeedback: 'Approved as submitted. Hand-feel and silicone wash finish match design intent perfectly.',
    history: [
      {
        id: 'hist-002',
        revisionNumber: 1,
        status: 'approved',
        submittedAt: '2026-07-20T10:00:00Z',
        decidedAt: '2026-07-23T15:00:00Z',
        decidedBy: 'buyer-user-001',
        decisionRole: 'Buyer',
        decision: 'approved',
        feedback: 'Approved as submitted. Hand-feel and silicone wash finish match design intent perfectly.',
        createdAt: '2026-07-23T15:00:00Z',
      },
    ],
    createdBy: 'staff-admin-001',
    createdAt: '2026-07-10T08:00:00Z',
    updatedAt: '2026-07-23T15:00:00Z',
  },
  {
    id: 'sample-003',
    orderId: 'TEST-ORDER-001',
    buyerOrganizationId: 'buyer-org-001',
    sampleType: 'Pre-Production (PP)',
    status: 'in_development',
    revisionNumber: 1,
    targetDate: '2026-08-25',
    internalRemarks: 'Awaiting bulk fabric lot from weaving unit before cutting PP panels.',
    buyerRemarks: 'PP sample preparation will commence immediately upon bulk fabric test release.',
    createdBy: 'staff-admin-001',
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
];

const inMemorySamples: Sample[] = [...TEST_SAMPLES];

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Retrieves all sample development records for an order (Staff / Internal View).
 * Preserves internal remarks, internal attachments, and private comments.
 */
export async function getSamplesByOrder(orderId: string): Promise<Sample[]> {
  if (isConfigured && db) {
    try {
      const samplesRef = collection(db, 'samples');
      const q = query(samplesRef, where('orderId', '==', orderId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            orderId: d.orderId,
            buyerOrganizationId: d.buyerOrganizationId,
            sampleType: d.sampleType,
            status: d.status,
            revisionNumber: d.revisionNumber || 1,
            targetDate: d.targetDate || null,
            submittedAt: d.submittedAt || null,
            reviewedAt: d.reviewedAt || null,
            approvedAt: d.approvedAt || null,
            rejectedAt: d.rejectedAt || null,
            courierName: d.courierName || '',
            trackingNumber: d.trackingNumber || '',
            courierDispatchedAt: d.courierDispatchedAt || null,
            internalRemarks: d.internalRemarks || '',
            buyerRemarks: d.buyerRemarks || d.remarks || '',
            remarks: d.buyerRemarks || d.remarks || '',
            buyerFeedback: d.buyerFeedback || '',
            attachments: d.attachments || [],
            history: d.history || [],
            comments: d.comments || [],
            createdBy: d.createdBy || 'system',
            updatedBy: d.updatedBy || null,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || new Date().toISOString(),
            updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || new Date().toISOString(),
          };
        });
      }
    } catch (error) {
      console.warn(`[Firestore] Error fetching samples for order ${orderId}:`, error);
    }
  }

  return inMemorySamples
    .filter((s) => s.orderId === orderId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Retrieves sample development records for an authorized buyer.
 * Strictly enforces tenant isolation (`buyerOrganizationId`), hides internal remarks,
 * and filters out internal-only attachments and internal comments.
 */
export async function getSamplesForBuyer(
  orderId: string,
  buyerOrganizationId: string
): Promise<Sample[]> {
  const allSamples = await getSamplesByOrder(orderId);
  const normId = normalizeBuyerOrgId(buyerOrganizationId);

  // Filter for matching organization
  const orgSamples = allSamples.filter(
    (s) => normalizeBuyerOrgId(s.buyerOrganizationId) === normId
  );

  // Sanitize buyer-visible data
  return orgSamples.map((sample) => ({
    ...sample,
    internalRemarks: undefined, // Strictly stripped
    attachments: (sample.attachments || []).filter((a) => a.visibility === 'buyer'),
    comments: (sample.comments || []).filter((c) => !c.isInternalOnly),
  }));
}

/**
 * Retrieves a single sample by ID.
 */
export async function getSampleById(sampleId: string): Promise<Sample | null> {
  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'samples', sampleId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          orderId: d.orderId,
          buyerOrganizationId: d.buyerOrganizationId,
          sampleType: d.sampleType,
          status: d.status,
          revisionNumber: d.revisionNumber || 1,
          targetDate: d.targetDate || null,
          submittedAt: d.submittedAt || null,
          reviewedAt: d.reviewedAt || null,
          approvedAt: d.approvedAt || null,
          rejectedAt: d.rejectedAt || null,
          courierName: d.courierName || '',
          trackingNumber: d.trackingNumber || '',
          courierDispatchedAt: d.courierDispatchedAt || null,
          internalRemarks: d.internalRemarks || '',
          buyerRemarks: d.buyerRemarks || d.remarks || '',
          buyerFeedback: d.buyerFeedback || '',
          attachments: d.attachments || [],
          history: d.history || [],
          comments: d.comments || [],
          createdBy: d.createdBy,
          updatedBy: d.updatedBy,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt,
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt,
        };
      }
    } catch (err) {
      console.error(`[Firestore] Error fetching sample ${sampleId}:`, err);
    }
  }

  return inMemorySamples.find((s) => s.id === sampleId) || null;
}

/**
 * Creates a new sample record for an order.
 */
export async function createSample(
  input: CreateSampleInput,
  actor: { uid: string; role: string }
): Promise<Sample> {
  const validated = createSampleSchema.parse(input);
  const now = new Date().toISOString();

  const newSample: Sample = {
    id: `sample-${Date.now().toString(36)}`,
    orderId: validated.orderId,
    buyerOrganizationId: validated.buyerOrganizationId,
    sampleType: validated.sampleType,
    status: validated.status,
    revisionNumber: 1,
    targetDate: validated.targetDate || undefined,
    courierName: validated.courierName || '',
    trackingNumber: validated.trackingNumber || '',
    internalRemarks: validated.internalRemarks || '',
    buyerRemarks: validated.buyerRemarks || '',
    remarks: validated.buyerRemarks || '',
    attachments: [],
    history: [],
    comments: [],
    createdBy: actor.uid,
    createdAt: now,
    updatedAt: now,
  };

  inMemorySamples.unshift(newSample);

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'SAMPLE_CREATED',
    entityId: newSample.id,
    after: {
      orderId: newSample.orderId,
      sampleType: newSample.sampleType,
      status: newSample.status,
    },
  });

  if (isConfigured && db) {
    try {
      const samplesRef = collection(db, 'samples');
      await setDoc(doc(samplesRef, newSample.id), {
        ...newSample,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Firestore] Error saving sample:', err);
    }
  }

  return newSample;
}

/**
 * Updates sample information (e.g. remarks, target date, status).
 */
export async function updateSample(
  sampleId: string,
  data: Partial<Sample>,
  actor: { uid: string; role: string }
): Promise<Sample> {
  const existing = await getSampleById(sampleId);
  if (!existing) {
    throw new Error(`Sample with ID ${sampleId} not found.`);
  }

  const now = new Date().toISOString();
  const updated: Sample = {
    ...existing,
    ...data,
    updatedBy: actor.uid,
    updatedAt: now,
  };

  const idx = inMemorySamples.findIndex((s) => s.id === sampleId);
  if (idx !== -1) {
    inMemorySamples[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'SAMPLE_UPDATED',
    entityId: sampleId,
    before: { status: existing.status },
    after: { status: updated.status },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'samples', sampleId);
      await updateDoc(docRef, {
        ...data,
        updatedBy: actor.uid,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(`[Firestore] Error updating sample ${sampleId}:`, err);
    }
  }

  return updated;
}

/**
 * Submits a sample for buyer review, with optional courier tracking information.
 */
export async function submitSampleForBuyerReview(
  sampleId: string,
  courierInfo: { courierName?: string; trackingNumber?: string },
  actor: { uid: string; role: string }
): Promise<Sample> {
  const existing = await getSampleById(sampleId);
  if (!existing) {
    throw new Error(`Sample with ID ${sampleId} not found.`);
  }

  const now = new Date().toISOString();

  const updated: Sample = {
    ...existing,
    status: 'submitted',
    submittedAt: now,
    courierName: courierInfo.courierName || existing.courierName,
    trackingNumber: courierInfo.trackingNumber || existing.trackingNumber,
    courierDispatchedAt: courierInfo.trackingNumber ? now : existing.courierDispatchedAt,
    updatedBy: actor.uid,
    updatedAt: now,
  };

  const idx = inMemorySamples.findIndex((s) => s.id === sampleId);
  if (idx !== -1) {
    inMemorySamples[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'SAMPLE_SUBMITTED',
    entityId: sampleId,
    after: {
      revisionNumber: existing.revisionNumber,
      courierName: updated.courierName,
      trackingNumber: updated.trackingNumber,
    },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'samples', sampleId);
      await updateDoc(docRef, {
        status: 'submitted',
        submittedAt: now,
        courierName: updated.courierName,
        trackingNumber: updated.trackingNumber,
        courierDispatchedAt: updated.courierDispatchedAt,
        history: updated.history,
        updatedBy: actor.uid,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(`[Firestore] Error submitting sample ${sampleId}:`, err);
    }
  }

  return updated;
}

/**
 * Records a Buyer's decision (Approve, Request Changes, Reject) on a submitted sample.
 * Strictly validates tenant ownership and updates revision history.
 */
export async function recordBuyerSampleDecision(
  sampleId: string,
  decisionInput: BuyerSampleDecisionInput,
  actor: { uid: string; role: string; buyerOrganizationId?: string; displayName?: string }
): Promise<Sample> {
  const validated = buyerSampleDecisionSchema.parse(decisionInput);
  const existing = await getSampleById(sampleId);
  if (!existing) {
    throw new Error(`Sample with ID ${sampleId} not found.`);
  }

  // Tenant Security Check
  if (actor.buyerOrganizationId && actor.buyerOrganizationId !== existing.buyerOrganizationId) {
    throw new Error('Security Error: You are not authorized to make decisions on samples belonging to another organization.');
  }

  if (existing.status !== 'submitted') {
    throw new Error(`Cannot record decision on a sample with status "${existing.status}". Must be in "submitted" state.`);
  }

  const now = new Date().toISOString();
  let nextStatus: Sample['status'] = 'approved';
  let auditAction: 'SAMPLE_APPROVED' | 'SAMPLE_CHANGES_REQUESTED' | 'SAMPLE_REJECTED' = 'SAMPLE_APPROVED';

  if (validated.decision === 'changes_requested') {
    nextStatus = 'changes_requested';
    auditAction = 'SAMPLE_CHANGES_REQUESTED';
  } else if (validated.decision === 'rejected') {
    nextStatus = 'rejected';
    auditAction = 'SAMPLE_REJECTED';
  }

  const historyEntry: SampleRevisionHistory = {
    id: `hist-${Date.now().toString(36)}`,
    revisionNumber: existing.revisionNumber,
    status: nextStatus,
    decidedAt: now,
    decidedBy: actor.displayName || actor.uid,
    decisionRole: actor.role,
    decision: validated.decision,
    feedback: validated.feedback || '',
    buyerFeedback: validated.feedback || '',
    attachments: existing.attachments?.filter((a) => a.revisionNumber === existing.revisionNumber),
    createdAt: now,
  };

  const decisionComment: SampleComment = {
    id: `comm-${Date.now().toString(36)}`,
    sampleId,
    authorUid: actor.uid,
    authorRole: actor.role,
    authorName: actor.displayName || 'Buyer Representative',
    comment: validated.feedback || `Sample ${validated.decision.replace('_', ' ').toUpperCase()}`,
    actionTaken: validated.decision,
    isInternalOnly: false,
    createdAt: now,
  };

  const updated: Sample = {
    ...existing,
    status: nextStatus,
    reviewedAt: now,
    decidedAt: now,
    decidedBy: actor.displayName || actor.uid,
    approvedAt: nextStatus === 'approved' ? now : undefined,
    rejectedAt: nextStatus === 'rejected' ? now : undefined,
    buyerFeedback: validated.feedback || '',
    history: [...(existing.history || []), historyEntry],
    comments: [...(existing.comments || []), decisionComment],
    updatedBy: actor.uid,
    updatedAt: now,
  };

  const idx = inMemorySamples.findIndex((s) => s.id === sampleId);
  if (idx !== -1) {
    inMemorySamples[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: auditAction,
    entityId: sampleId,
    after: {
      decision: validated.decision,
      revisionNumber: existing.revisionNumber,
      feedback: validated.feedback,
    },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'samples', sampleId);
      await updateDoc(docRef, {
        status: nextStatus,
        reviewedAt: now,
        approvedAt: updated.approvedAt || null,
        rejectedAt: updated.rejectedAt || null,
        buyerFeedback: updated.buyerFeedback,
        history: updated.history,
        comments: updated.comments,
        updatedBy: actor.uid,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(`[Firestore] Error saving buyer decision on ${sampleId}:`, err);
    }
  }

  return updated;
}

/**
 * Creates the next revision round (e.g. v2, v3) after changes requested or rejection.
 * Increments revisionNumber, resets status to 'in_development', preserving historical decisions.
 */
export async function createSampleRevision(
  input: CreateSampleRevisionInput,
  actor: { uid: string; role: string }
): Promise<Sample> {
  const validated = createSampleRevisionSchema.parse(input);
  const existing = await getSampleById(validated.sampleId);
  if (!existing) {
    throw new Error(`Sample with ID ${validated.sampleId} not found.`);
  }

  const now = new Date().toISOString();
  const nextRevision = existing.revisionNumber + 1;

  const updatedHistory: SampleRevisionHistory[] = [...(existing.history || [])];
  const existingRoundIdx = updatedHistory.findIndex((h) => h.revisionNumber === existing.revisionNumber);

  if (existingRoundIdx !== -1) {
    updatedHistory[existingRoundIdx] = {
      ...updatedHistory[existingRoundIdx],
      notes: `Revision ${nextRevision} started: ${validated.revisionNotes}`,
      revisionNotes: validated.revisionNotes,
    };
  } else {
    updatedHistory.push({
      id: `hist-${Date.now().toString(36)}`,
      revisionNumber: existing.revisionNumber,
      status: existing.status,
      submittedAt: existing.submittedAt,
      decidedAt: existing.decidedAt,
      decidedBy: existing.decidedBy,
      decision: existing.status === 'approved' ? 'approved' : existing.status === 'changes_requested' ? 'changes_requested' : existing.status === 'rejected' ? 'rejected' : undefined,
      feedback: existing.buyerFeedback,
      buyerFeedback: existing.buyerFeedback,
      notes: `Revision ${nextRevision} started: ${validated.revisionNotes}`,
      revisionNotes: validated.revisionNotes,
      courierName: existing.courierName,
      trackingNumber: existing.trackingNumber,
      attachments: existing.attachments?.filter((a) => a.revisionNumber === existing.revisionNumber),
      createdAt: now,
    });
  }

  const updated: Sample = {
    ...existing,
    status: 'in_development',
    revisionNumber: nextRevision,
    targetDate: validated.targetDate || existing.targetDate,
    submittedAt: undefined,
    reviewedAt: undefined,
    decidedAt: undefined,
    decidedBy: undefined,
    approvedAt: undefined,
    rejectedAt: undefined,
    buyerFeedback: undefined,
    history: updatedHistory,
    internalRemarks: `${existing.internalRemarks || ''}\n[Rev ${nextRevision} Note]: ${validated.revisionNotes}`.trim(),
    updatedBy: actor.uid,
    updatedAt: now,
  };

  const idx = inMemorySamples.findIndex((s) => s.id === validated.sampleId);
  if (idx !== -1) {
    inMemorySamples[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'SAMPLE_REVISION_CREATED',
    entityId: validated.sampleId,
    after: {
      newRevision: nextRevision,
      notes: validated.revisionNotes,
    },
  });

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'samples', validated.sampleId);
      await updateDoc(docRef, {
        status: 'in_development',
        revisionNumber: nextRevision,
        targetDate: updated.targetDate || null,
        submittedAt: null,
        reviewedAt: null,
        approvedAt: null,
        rejectedAt: null,
        buyerFeedback: null,
        history: updated.history,
        internalRemarks: updated.internalRemarks,
        updatedBy: actor.uid,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(`[Firestore] Error creating sample revision for ${validated.sampleId}:`, err);
    }
  }

  return updated;
}

/**
 * Appends a comment to the sample discussion thread.
 */
export async function addSampleComment(
  sampleId: string,
  comment: string,
  isInternalOnly: boolean,
  actor: { uid: string; role: string; displayName?: string }
): Promise<SampleComment> {
  const existing = await getSampleById(sampleId);
  if (!existing) {
    throw new Error(`Sample ${sampleId} not found.`);
  }

  const now = new Date().toISOString();
  const newComment: SampleComment = {
    id: `comm-${Date.now().toString(36)}`,
    sampleId,
    authorUid: actor.uid,
    authorRole: actor.role,
    authorName: actor.displayName || actor.role,
    comment: comment.trim(),
    isInternalOnly,
    createdAt: now,
  };

  const updatedComments = [...(existing.comments || []), newComment];
  await updateSample(sampleId, { comments: updatedComments }, actor);

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'SAMPLE_COMMENT_ADDED',
    entityId: sampleId,
    after: { commentId: newComment.id, isInternalOnly },
  });

  return newComment;
}

/**
 * Uploads/registers an attachment for a sample revision.
 */
export async function uploadSampleAttachment(
  sampleId: string,
  attachmentInput: SampleAttachmentInput,
  actor: { uid: string; role: string }
): Promise<SampleAttachment> {
  const existing = await getSampleById(sampleId);
  if (!existing) {
    throw new Error(`Sample ${sampleId} not found.`);
  }

  const now = new Date().toISOString();
  const newAttachment: SampleAttachment = {
    id: `att-${Date.now().toString(36)}`,
    sampleId,
    revisionNumber: existing.revisionNumber,
    fileName: attachmentInput.fileName,
    fileSize: attachmentInput.fileSize,
    fileType: attachmentInput.fileType,
    storagePath: `/orders/${existing.orderId}/samples/${sampleId}/${attachmentInput.fileName}`,
    url: attachmentInput.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    caption: attachmentInput.caption || '',
    visibility: attachmentInput.visibility,
    uploadedBy: actor.uid,
    createdAt: now,
  };

  const updatedAttachments = [...(existing.attachments || []), newAttachment];
  await updateSample(sampleId, { attachments: updatedAttachments }, actor);

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'SAMPLE_ATTACHMENT_UPLOADED',
    entityId: sampleId,
    after: {
      attachmentId: newAttachment.id,
      fileName: newAttachment.fileName,
      visibility: newAttachment.visibility,
    },
  });

  return newAttachment;
}

/**
 * Deletes an attachment from a sample.
 */
export async function deleteSampleAttachment(
  sampleId: string,
  attachmentId: string,
  actor: { uid: string; role: string }
): Promise<Sample> {
  const existing = await getSampleById(sampleId);
  if (!existing) {
    throw new Error(`Sample ${sampleId} not found.`);
  }

  const updatedAttachments = (existing.attachments || []).filter((a) => a.id !== attachmentId);
  const updated = await updateSample(sampleId, { attachments: updatedAttachments }, actor);

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'SAMPLE_ATTACHMENT_DELETED',
    entityId: sampleId,
    after: { attachmentId },
  });

  return updated;
}
