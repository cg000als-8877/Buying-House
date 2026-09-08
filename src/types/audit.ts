export interface AuditLog {
  id: string;
  actorUid: string;
  actorRole: string;
  action: string;
  entityType: 'order' | 'buyer' | 'factory' | 'production' | 'document' | 'sample' | 'inspection' | 'user' | 'system';
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  timestamp: string;
  ipMetadata?: string | null;
}
