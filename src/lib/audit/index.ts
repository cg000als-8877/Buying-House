import { AuditLog } from '@/types/audit';

export async function logAuditEvent(event: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  // In production, records to Firestore auditLogs collection via Cloud Function/Admin SDK
  console.info('[Audit Log]', event);
}
