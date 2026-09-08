import { AuditLog } from '@/types/audit';
import { db, isConfigured } from '@/lib/firebase/client';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';

export type SecurityAuditEvent =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_PASSWORD_RESET_REQUEST'
  | 'AUTH_ACCOUNT_STATUS_CHANGE'
  | 'AUTH_ROLE_CHANGE'
  | 'PRODUCTION_STAGES_CONFIGURED'
  | 'PRODUCTION_UPDATE_CREATED'
  | 'PRODUCTION_UPDATE_EDITED'
  | 'PRODUCTION_UPDATE_SUBMITTED'
  | 'PRODUCTION_UPDATE_PUBLISHED'
  | 'PRODUCTION_UPDATE_REJECTED'
  | 'PRODUCTION_PHOTO_UPLOADED'
  | 'PRODUCTION_PHOTO_DELETED'
  | 'SAMPLE_CREATED'
  | 'SAMPLE_UPDATED'
  | 'SAMPLE_SUBMITTED'
  | 'SAMPLE_APPROVED'
  | 'SAMPLE_CHANGES_REQUESTED'
  | 'SAMPLE_REJECTED'
  | 'SAMPLE_REVISION_CREATED'
  | 'SAMPLE_ATTACHMENT_UPLOADED'
  | 'SAMPLE_ATTACHMENT_DELETED'
  | 'SAMPLE_COMMENT_ADDED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_UPDATED'
  | 'DOCUMENT_REVISION_CREATED'
  | 'DOCUMENT_VISIBILITY_CHANGED'
  | 'DOCUMENT_ARCHIVED'
  | 'DOCUMENT_RESTORED'
  | 'DOCUMENT_DELETED'
  | 'DOCUMENT_DOWNLOADED'
  | 'INSPECTION_CREATED'
  | 'INSPECTION_UPDATED'
  | 'INSPECTION_PUBLISHED'
  | 'INSPECTION_REJECTED'
  | 'DEFECT_ADDED'
  | 'CORRECTIVE_ACTION_CREATED'
  | 'CORRECTIVE_ACTION_UPDATED'
  | 'REINSPECTION_REQUESTED'
  | 'REINSPECTION_COMPLETED'
  | 'LAB_REPORT_UPLOADED'
  | 'LAB_REPORT_PUBLISHED'
  | 'SHIPMENT_CREATED'
  | 'SHIPMENT_UPDATED'
  | 'SHIPMENT_STATUS_CHANGED'
  | 'SHIPMENT_STATUS_CORRECTED'
  | 'SHIPMENT_CANCELLED'
  | 'PACKING_ITEM_CREATED'
  | 'PACKING_ITEM_UPDATED'
  | 'PACKING_ITEM_DELETED'
  | 'SHIPMENT_DOCUMENT_STATUS_CHANGED'
  | 'SHIPMENT_EVENT_CREATED'
  | 'SHIPMENT_TRACKING_UPDATED'
  | 'SHIPMENT_READY_TO_SHIP'
  | 'DELIVERY_CONFIRMED'
  | 'NOTIFICATION_CREATED'
  | 'NOTIFICATION_READ'
  | 'NOTIFICATION_PREFERENCES_UPDATED'
  | 'EMAIL_QUEUED'
  | 'EMAIL_SENT'
  | 'EMAIL_FAILED'
  | 'EMAIL_RETRY'
  | 'NOTIFICATION_DISPATCH_FAILED'
  | 'REPORT_GENERATED'
  | 'REPORT_EXPORTED'
  | 'REPORT_SNAPSHOT_CREATED'
  | 'REPORT_CONFIGURATION_UPDATED';

export interface LogSecurityEventParams {
  actorUid: string;
  actorRole: string;
  action: SecurityAuditEvent;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ipMetadata?: string | null;
}

export const TEST_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    actorUid: 'staff-admin-001',
    actorRole: 'Super Admin',
    action: 'AUTH_ACCOUNT_STATUS_CHANGE',
    entityType: 'buyer',
    entityId: 'buyer-org-001',
    before: { status: 'pending' },
    after: { status: 'active' },
    timestamp: '2026-09-08T08:30:00Z',
    ipMetadata: '103.145.118.22 (Dhaka, BD)',
  },
  {
    id: 'audit-002',
    actorUid: 'staff-admin-001',
    actorRole: 'Super Admin',
    action: 'AUTH_ROLE_CHANGE',
    entityType: 'user',
    entityId: 'merch-002',
    before: { role: 'Production Staff' },
    after: { role: 'Merchandiser' },
    timestamp: '2026-09-07T14:15:00Z',
    ipMetadata: '103.145.118.22 (Dhaka, BD)',
  },
  {
    id: 'audit-003',
    actorUid: 'merch-001',
    actorRole: 'Merchandiser',
    action: 'AUTH_ACCOUNT_STATUS_CHANGE',
    entityType: 'order',
    entityId: 'TEST-ORDER-003',
    before: { currentStatus: 'Production' },
    after: { currentStatus: 'QC' },
    timestamp: '2026-09-07T11:00:00Z',
    ipMetadata: '103.145.118.25 (Dhaka, BD)',
  },
  {
    id: 'audit-004',
    actorUid: 'staff-admin-001',
    actorRole: 'Super Admin',
    action: 'AUTH_LOGIN_SUCCESS',
    entityType: 'user',
    entityId: 'staff-admin-001',
    timestamp: '2026-09-07T08:00:00Z',
    ipMetadata: '103.145.118.22 (Dhaka, BD)',
  },
];

const inMemoryAuditLogs = [...TEST_AUDIT_LOGS];

/**
 * Records a security or operational event to Firestore `auditLogs`.
 * Audit logs are append-only. Only Super Admin has read permissions.
 */
export async function logSecurityEvent(params: LogSecurityEventParams): Promise<void> {
  const newLog: AuditLog = {
    id: `log-${Date.now().toString(36)}`,
    actorUid: params.actorUid,
    actorRole: params.actorRole,
    action: params.action,
    entityType: 'system',
    entityId: params.entityId,
    before: params.before || null,
    after: params.after || null,
    timestamp: new Date().toISOString(),
    ipMetadata: params.ipMetadata || 'internal-dispatch',
  };

  inMemoryAuditLogs.unshift(newLog);

  if (!db || !isConfigured) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[Security Audit Log]', {
        timestamp: new Date().toISOString(),
        ...params,
      });
    }
    return;
  }

  try {
    const logsCollection = collection(db, 'auditLogs');
    await addDoc(logsCollection, {
      actorUid: params.actorUid,
      actorRole: params.actorRole,
      action: params.action,
      entityType: 'user',
      entityId: params.entityId,
      before: params.before || null,
      after: params.after || null,
      timestamp: serverTimestamp(),
      ipMetadata: params.ipMetadata || null,
    });
  } catch (err) {
    console.error('[Security Audit Log] Failed to persist audit record:', err);
  }
}

export async function fetchAuditLogs(limitCount = 50): Promise<AuditLog[]> {
  if (isConfigured && db) {
    try {
      const logsRef = collection(db, 'auditLogs');
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      const results: AuditLog[] = [];
      snapshot.forEach((snap) => {
        const data = snap.data();
        results.push({
          id: snap.id,
          actorUid: data.actorUid,
          actorRole: data.actorRole,
          action: data.action,
          entityType: data.entityType || 'system',
          entityId: data.entityId,
          before: data.before || null,
          after: data.after || null,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
          ipMetadata: data.ipMetadata || null,
        });
      });
      return results;
    } catch (error) {
      console.warn('[Firestore] Error fetching audit logs, falling back to in-memory fixtures:', error);
    }
  }

  return inMemoryAuditLogs.slice(0, limitCount);
}
