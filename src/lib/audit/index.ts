import { AuditLog } from '@/types/audit';
import { db, isConfigured } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type SecurityAuditEvent =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_PASSWORD_RESET_REQUEST'
  | 'AUTH_ACCOUNT_STATUS_CHANGE'
  | 'AUTH_ROLE_CHANGE';

export interface LogSecurityEventParams {
  actorUid: string;
  actorRole: string;
  action: SecurityAuditEvent;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ipMetadata?: string | null;
}

/**
 * Records a security or operational event to Firestore `auditLogs`.
 * Audit logs are append-only. Only Super Admin has read permissions.
 */
export async function logSecurityEvent(params: LogSecurityEventParams): Promise<void> {
  if (!db || !isConfigured) {
    // In development or when offline, log safely to debug console
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

export async function fetchAuditLogs(_limitCount = 50): Promise<AuditLog[]> {
  // In production this is queried by Super Admin from Firestore / Cloud Functions
  return [];
}
