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
  | 'documents.archive'
  | 'documents.delete'
  | 'documents.restricted'
  | 'samples.read'
  | 'samples.write'
  | 'samples.approve'
  | 'quality.read'
  | 'quality.write'
  | 'quality.publish'
  | 'quality.reinspection'
  | 'quality.labReports'
  | 'quality.configure'
  | 'shipments.read'
  | 'shipments.write'
  | 'shipments.status'
  | 'shipments.documents'
  | 'shipments.tracking'
  | 'shipments.confirmDelivery'
  | 'shipments.configure'
  | 'notifications.read'
  | 'notifications.manage'
  | 'notifications.configure'
  | 'notifications.email'
  | 'notifications.system'
  | 'reports.read'
  | 'reports.export'
  | 'reports.advanced'
  | 'reports.configure'
  | 'users.read'
  | 'users.write'
  | 'settings.read'
  | 'settings.write'
  | 'auditLogs.read';
