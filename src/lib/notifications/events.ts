import {
  NotificationEventType,
  NotificationCategory,
  NotificationSeverity,
  NotificationEntityType,
  AppNotification,
} from '@/types/notification';
import { UserRole } from '@/types/auth';
import { logSecurityEvent } from '@/lib/audit';
import { sendEmail } from './email';
import { renderEmailTemplate } from './templates';
import {
  createNotification,
  getNotificationPreferences,
} from './index';

export interface BusinessNotificationEvent {
  type: NotificationEventType;
  category: NotificationCategory;
  severity?: NotificationSeverity;
  entityType: NotificationEntityType;
  entityId: string;
  version?: number;
  orderId?: string;
  orderNumber?: string;
  shipmentId?: string;
  shipmentNumber?: string;
  sampleId?: string;
  sampleType?: string;
  inspectionId?: string;
  inspectionType?: string;
  documentId?: string;
  documentName?: string;
  buyerOrganizationId?: string | null;
  actorUid: string;
  actorRole: string;
  title: string;
  message: string;
  actionUrl?: string;
  notes?: string;
  delayReason?: string;
  recipients: Array<{
    userId: string;
    email: string;
    name: string;
    role: UserRole;
    buyerOrganizationId?: string | null;
  }>;
}

export interface DispatchEventResult {
  eventId: string;
  idempotencyKey: string;
  notificationsCreated: number;
  emailsQueued: number;
  skippedDueToPreferences: number;
  duplicateSuppressed: boolean;
}

// In-memory processed event registry for deterministic idempotency deduplication
const processedEventKeys = new Set<string>();

/**
 * Resets processed event keys (used in unit test isolation).
 */
export function resetEventIdempotencyStore(): void {
  processedEventKeys.clear();
}

/**
 * Dispatches a business event across notification channels with strict idempotency and preference evaluation.
 */
export async function dispatchNotificationEvent(
  event: BusinessNotificationEvent
): Promise<DispatchEventResult> {
  const version = event.version || 1;
  const baseKey = `${event.type}_${event.entityType}_${event.entityId}_v${version}`;
  const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  let notificationsCreated = 0;
  let emailsQueued = 0;
  let skippedDueToPreferences = 0;
  let duplicateSuppressed = false;

  for (const recipient of event.recipients) {
    // Tenant isolation verification for buyer recipients
    if (recipient.role === 'Buyer' && event.buyerOrganizationId) {
      if (recipient.buyerOrganizationId && recipient.buyerOrganizationId !== event.buyerOrganizationId) {
        // Cross-tenant breach blocked
        continue;
      }
    }

    const recipientIdempotencyKey = `${baseKey}_${recipient.userId}`;

    // Check idempotency
    if (processedEventKeys.has(recipientIdempotencyKey)) {
      duplicateSuppressed = true;
      continue;
    }

    // Mark as processed
    processedEventKeys.add(recipientIdempotencyKey);

    // Evaluate recipient preferences
    const prefs = await getNotificationPreferences(recipient.userId, recipient.role);
    const severity = event.severity || 'info';
    const isCritical = severity === 'critical';

    // Check category subscription preference
    let categoryAllowed = true;
    if (!isCritical) {
      if (event.category === 'ORDER' && !prefs.orderUpdates) categoryAllowed = false;
      if (event.category === 'PRODUCTION' && !prefs.productionUpdates) categoryAllowed = false;
      if (event.category === 'SAMPLE' && !prefs.sampleUpdates) categoryAllowed = false;
      if (event.category === 'DOCUMENT' && !prefs.documentUpdates) categoryAllowed = false;
      if (event.category === 'QUALITY' && !prefs.qualityUpdates) categoryAllowed = false;
      if (event.category === 'SHIPMENT' && !prefs.shipmentUpdates) categoryAllowed = false;
      if (event.category === 'SYSTEM' && !prefs.systemAlerts) categoryAllowed = false;
    }

    if (!categoryAllowed) {
      skippedDueToPreferences += 1;
      continue;
    }

    // 1. In-App Notification Dispatch
    if (prefs.inAppEnabled || isCritical) {
      const notifData: Omit<AppNotification, 'id' | 'createdAt'> = {
        recipientUserId: recipient.userId,
        recipientRole: recipient.role,
        buyerOrganizationId: recipient.buyerOrganizationId || event.buyerOrganizationId || null,
        type: event.type,
        category: event.category,
        title: event.title,
        message: event.message,
        severity,
        channel: 'ALL',
        entityType: event.entityType,
        entityId: event.entityId,
        orderId: event.orderId,
        shipmentId: event.shipmentId,
        sampleId: event.sampleId,
        inspectionId: event.inspectionId,
        documentId: event.documentId,
        relatedOrderId: event.orderId,
        isRead: false,
        read: false,
        actionUrl: event.actionUrl,
        idempotencyKey: recipientIdempotencyKey,
      };

      await createNotification(notifData);
      notificationsCreated += 1;
    }

    // 2. Email Dispatch
    if ((prefs.emailEnabled || isCritical) && recipient.email) {
      const isBuyer = recipient.role === 'Buyer';
      const templateKey = mapEventTypeToTemplate(event.type);

      const rendered = renderEmailTemplate(templateKey, {
        recipientName: recipient.name || 'Valued Partner',
        isBuyer,
        orderNumber: event.orderNumber,
        sampleType: event.sampleType,
        inspectionType: event.inspectionType,
        shipmentNumber: event.shipmentNumber,
        documentName: event.documentName,
        delayReason: event.delayReason,
        actionUrl: event.actionUrl,
      });

      await sendEmail({
        to: recipient.email,
        recipientUserId: recipient.userId,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        idempotencyKey: recipientIdempotencyKey,
        category: event.category,
        isBuyerFacing: isBuyer,
      });

      emailsQueued += 1;
    }
  }

  // Audit event
  await logSecurityEvent({
    actorUid: event.actorUid,
    actorRole: event.actorRole,
    action: 'NOTIFICATION_CREATED',
    entityId: eventId,
    after: {
      type: event.type,
      category: event.category,
      entityId: event.entityId,
      notificationsCreated,
      emailsQueued,
      skippedDueToPreferences,
    },
  });

  return {
    eventId,
    idempotencyKey: baseKey,
    notificationsCreated,
    emailsQueued,
    skippedDueToPreferences,
    duplicateSuppressed,
  };
}

/**
 * Maps high-level notification event type to corresponding email template key.
 */
function mapEventTypeToTemplate(type: NotificationEventType): string {
  switch (type) {
    case 'ORDER_CREATED':
    case 'ORDER_UPDATED':
    case 'ORDER_STATUS_CHANGED':
      return 'order-update';
    case 'SAMPLE_SUBMITTED_FOR_REVIEW':
      return 'sample-approval-request';
    case 'SAMPLE_APPROVED':
    case 'SAMPLE_CHANGES_REQUESTED':
    case 'SAMPLE_REJECTED':
    case 'SAMPLE_REVISION_CREATED':
      return 'sample-decision';
    case 'PRODUCTION_DELAY_DETECTED':
    case 'PRODUCTION_ISSUE_REPORTED':
      return 'production-delay';
    case 'INSPECTION_FAILED':
      return 'quality-failure';
    case 'CAP_OVERDUE':
      return 'cap-overdue';
    case 'DOCUMENT_REQUIRES_REVIEW':
      return 'document-review';
    case 'SHIPMENT_BOOKED':
      return 'shipment-booked';
    case 'SHIPMENT_DELAYED':
      return 'shipment-delayed';
    case 'SHIPMENT_DISPATCHED':
      return 'shipment-dispatched';
    case 'SHIPMENT_DELIVERED':
    case 'DELIVERY_CONFIRMED':
      return 'shipment-delivered';
    default:
      return 'default';
  }
}
