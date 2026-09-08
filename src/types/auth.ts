export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'Operations Manager'
  | 'Merchandiser'
  | 'Production Staff'
  | 'QC Staff'
  | 'Buyer';

export type UserStatus = 'active' | 'invited' | 'suspended' | 'disabled';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  buyerOrganizationId?: string | null;
  status: UserStatus;
  photoURL?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export type Permission =
  | 'buyers.read'
  | 'buyers.write'
  | 'orders.read'
  | 'orders.write'
  | 'production.read'
  | 'production.write'
  | 'production.publish'
  | 'documents.read'
  | 'documents.write'
  | 'documents.delete'
  | 'samples.read'
  | 'samples.write'
  | 'samples.approve'
  | 'quality.read'
  | 'quality.write'
  | 'shipments.read'
  | 'shipments.write'
  | 'users.read'
  | 'users.write'
  | 'settings.read'
  | 'settings.write'
  | 'auditLogs.read';
