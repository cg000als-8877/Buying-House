export interface AuditLog {
  id: string;
  actorUid: string;
  actorRole: string;
  action: string;
  entityType: 'order' | 'buyer' | 'factory' | 'production' | 'document' | 'sample' | 'inspection' | 'user' | 'system';
  entityId: string;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  timestamp: string;
  ipMetadata?: string | null;
}
