import { UserRole } from './auth';

export type NotificationCategory =
  | 'ORDER'
  | 'PRODUCTION'
  | 'SAMPLE'
  | 'DOCUMENT'
  | 'QUALITY'
  | 'SHIPMENT'
  | 'SYSTEM';

export type NotificationSeverity = 'info' | 'warning' | 'critical' | 'success';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'ALL';

export type NotificationEntityType =
  | 'order'
  | 'production'
  | 'sample'
  | 'document'
  | 'quality_inspection'
  | 'quality_cap'
  | 'lab_report'
  | 'shipment'
  | 'system';

/**
 * Complete Event Catalog covering all platform domains.
 */
export type NotificationEventType =
  // Orders
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'ORDER_STATUS_CHANGED'
  // Production
  | 'PRODUCTION_UPDATE_PUBLISHED'
  | 'PRODUCTION_DELAY_DETECTED'
  | 'PRODUCTION_ISSUE_REPORTED'
  // Samples
  | 'SAMPLE_SUBMITTED_FOR_REVIEW'
  | 'SAMPLE_APPROVED'
  | 'SAMPLE_CHANGES_REQUESTED'
  | 'SAMPLE_REJECTED'
  | 'SAMPLE_REVISION_CREATED'
  // Documents
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_REQUIRES_REVIEW'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_ARCHIVED'
  // Quality
  | 'INSPECTION_CREATED'
  | 'INSPECTION_PUBLISHED'
  | 'INSPECTION_FAILED'
  | 'CAP_CREATED'
  | 'CAP_OVERDUE'
  | 'REINSPECTION_REQUIRED'
  | 'REINSPECTION_COMPLETED'
  | 'LAB_REPORT_PUBLISHED'
  // Shipments
  | 'SHIPMENT_CREATED'
  | 'SHIPMENT_BOOKED'
  | 'SHIPMENT_READY_TO_SHIP'
  | 'SHIPMENT_DISPATCHED'
  | 'SHIPMENT_IN_TRANSIT'
  | 'SHIPMENT_DELAYED'
  | 'SHIPMENT_ARRIVED'
  | 'SHIPMENT_DELIVERED'
  | 'DELIVERY_CONFIRMED'
  // System / Alerts
  | 'SYSTEM_ALERT'
  | 'SECURITY_ALERT';

/**
 * Legacy alias for backwards-compatibility.
 */
export type NotificationType = NotificationEventType | string;

export interface AppNotification {
  id: string;
  recipientUserId: string;
  recipientRole?: UserRole;
  buyerOrganizationId?: string | null;
  type: NotificationEventType;
  category: NotificationCategory;
  title: string;
  message: string;
  severity: NotificationSeverity;
  channel: NotificationChannel;
  entityType: NotificationEntityType;
  entityId?: string;
  orderId?: string;
  shipmentId?: string;
  sampleId?: string;
  inspectionId?: string;
  documentId?: string;
  relatedOrderId?: string;
  isRead: boolean;
  read?: boolean;
  readAt?: string | null;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
  createdAt: string;
  expiresAt?: string | null;
}

export type Notification = AppNotification;

export interface NotificationSummaryMetrics {
  totalCount: number;
  unreadCount: number;
  criticalCount: number;
  unreadByCategory: Record<NotificationCategory, number>;
}

