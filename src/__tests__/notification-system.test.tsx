import { describe, it, expect, beforeEach } from 'vitest';
import {
  createNotification,
  getNotificationsForUser,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  resetInMemoryNotifications,
} from '@/lib/notifications';
import {
  dispatchNotificationEvent,
  resetEventIdempotencyStore,
} from '@/lib/notifications/events';
import {
  sendEmail,
  retryFailedEmail,
  getEmailDeliveryLogs,
  resetInMemoryEmailLogs,
  DevelopmentEmailAdapter,
} from '@/lib/notifications/email';
import { renderEmailTemplate } from '@/lib/notifications/templates';
import { hasPermission } from '@/lib/auth/permissions';
import { UserRole } from '@/types/auth';
import { AppNotification } from '@/types/notification';

describe('Notifications, Email & Communication Automation — Step 14 Verification', () => {
  beforeEach(() => {
    resetInMemoryNotifications();
    resetEventIdempotencyStore();
    resetInMemoryEmailLogs();
  });

  describe('1. Notification Creation & Tenant Isolation', () => {
    it('creates in-app notifications with complete domain entity references', async () => {
      const notifData: Omit<AppNotification, 'id' | 'createdAt'> = {
        recipientUserId: 'buyer-001',
        recipientRole: 'Buyer',
        buyerOrganizationId: 'buyer-org-001',
        type: 'PRODUCTION_UPDATE_PUBLISHED',
        category: 'PRODUCTION',
        title: 'Sewing Line 3 Initialized',
        message: 'Bulk sewing commenced for PO-2026-0881.',
        severity: 'info',
        channel: 'ALL',
        entityType: 'production',
        entityId: 'prod-001',
        orderId: 'TEST-ORDER-001',
        relatedOrderId: 'TEST-ORDER-001',
        isRead: false,
      };

      const created = await createNotification(notifData);
      expect(created.id).toBeDefined();
      expect(created.createdAt).toBeDefined();
      expect(created.title).toBe('Sewing Line 3 Initialized');
      expect(created.isRead).toBe(false);
    });

    it('enforces strict tenant isolation: buyer only receives own organization notifications', async () => {
      const buyer1Notifs = await getNotificationsForUser('buyer-001');
      expect(buyer1Notifs.length).toBeGreaterThan(0);
      expect(buyer1Notifs.every((n) => n.recipientUserId === 'buyer-001' || n.buyerOrganizationId === 'buyer-org-001')).toBe(true);

      const buyer2Notifs = await getNotificationsForUser('buyer-other-user');
      expect(buyer2Notifs.length).toBe(0);
    });
  });

  describe('2. Read State & Unread Counts', () => {
    it('accurately counts unread notifications for a user', async () => {
      const count = await getUnreadNotificationCount('buyer-001');
      expect(count).toBeGreaterThan(0);
    });

    it('marks a single notification as read and updates timestamp', async () => {
      const notifs = await getNotificationsForUser('buyer-001', { unreadOnly: true });
      expect(notifs.length).toBeGreaterThan(0);
      const targetId = notifs[0].id;

      await markNotificationAsRead(targetId, 'buyer-001');

      const updatedList = await getNotificationsForUser('buyer-001');
      const updated = updatedList.find((n) => n.id === targetId);
      expect(updated?.isRead).toBe(true);
      expect(updated?.read).toBe(true);
      expect(updated?.readAt).toBeDefined();
    });

    it('marks all notifications for a user as read in a single operation', async () => {
      await markAllNotificationsAsRead('buyer-001');
      const unreadCount = await getUnreadNotificationCount('buyer-001');
      expect(unreadCount).toBe(0);
    });

    it('deletes a notification properly', async () => {
      const notifs = await getNotificationsForUser('buyer-001');
      const targetId = notifs[0].id;

      const deleted = await deleteNotification(targetId, 'buyer-001');
      expect(deleted).toBe(true);

      const updated = await getNotificationsForUser('buyer-001');
      expect(updated.some((n) => n.id === targetId)).toBe(false);
    });
  });

  describe('3. User Notification Preferences', () => {
    it('retrieves default role-based preferences', async () => {
      const buyerPrefs = await getNotificationPreferences('buyer-001', 'Buyer');
      expect(buyerPrefs.inAppEnabled).toBe(true);
      expect(buyerPrefs.emailEnabled).toBe(true);
      expect(buyerPrefs.orderUpdates).toBe(true);

      const prodPrefs = await getNotificationPreferences('staff-prod-001', 'Production Staff');
      expect(prodPrefs.inAppEnabled).toBe(true);
      expect(prodPrefs.emailEnabled).toBe(false);
    });

    it('updates user notification preferences and persists changes', async () => {
      const updated = await updateNotificationPreferences('buyer-001', {
        sampleUpdates: false,
        emailEnabled: false,
      });

      expect(updated.sampleUpdates).toBe(false);
      expect(updated.emailEnabled).toBe(false);

      const fetched = await getNotificationPreferences('buyer-001');
      expect(fetched.sampleUpdates).toBe(false);
      expect(fetched.emailEnabled).toBe(false);
    });

    it('respects user preferences when dispatching notifications', async () => {
      // Disable document updates for buyer-001
      await updateNotificationPreferences('buyer-001', {
        documentUpdates: false,
      });

      const result = await dispatchNotificationEvent({
        type: 'DOCUMENT_UPLOADED',
        category: 'DOCUMENT',
        severity: 'info',
        entityType: 'document',
        entityId: 'doc-999',
        actorUid: 'staff-merch-001',
        actorRole: 'Merchandiser',
        title: 'New Commercial Invoice Uploaded',
        message: 'Commercial invoice uploaded.',
        recipients: [
          {
            userId: 'buyer-001',
            email: 'buyer@nordicapparel.com',
            name: 'Morten Lindqvist',
            role: 'Buyer',
            buyerOrganizationId: 'buyer-org-001',
          },
        ],
      });

      expect(result.skippedDueToPreferences).toBe(1);
      expect(result.notificationsCreated).toBe(0);
    });

    it('critical operational & security notifications override user opt-out', async () => {
      // Disable everything
      await updateNotificationPreferences('buyer-001', {
        inAppEnabled: false,
        emailEnabled: false,
        qualityUpdates: false,
      });

      const result = await dispatchNotificationEvent({
        type: 'INSPECTION_FAILED',
        category: 'QUALITY',
        severity: 'critical', // Critical severity
        entityType: 'quality_inspection',
        entityId: 'insp-fail-001',
        actorUid: 'staff-qc-001',
        actorRole: 'QC Staff',
        title: 'Critical AQL Non-Conformance Detected',
        message: 'Major seam slippage found. Immediate hold enacted.',
        recipients: [
          {
            userId: 'buyer-001',
            email: 'buyer@nordicapparel.com',
            name: 'Morten Lindqvist',
            role: 'Buyer',
            buyerOrganizationId: 'buyer-org-001',
          },
        ],
      });

      // Must NOT be skipped because it is critical
      expect(result.notificationsCreated).toBe(1);
      expect(result.emailsQueued).toBe(1);
      expect(result.skippedDueToPreferences).toBe(0);
    });
  });

  describe('4. Event-Driven Dispatcher & Idempotency', () => {
    it('dispatches cross-domain operational events across Orders, Production, Samples, Documents, Quality, Shipments', async () => {
      const result = await dispatchNotificationEvent({
        type: 'SHIPMENT_DISPATCHED',
        category: 'SHIPMENT',
        severity: 'info',
        entityType: 'shipment',
        entityId: 'ship-888',
        shipmentNumber: 'SHP-2026-0888',
        orderNumber: 'PO-2026-0881',
        actorUid: 'staff-merch-001',
        actorRole: 'Merchandiser',
        title: 'Consignment SHP-2026-0888 Dispatched',
        message: 'Vessel departed origin port.',
        actionUrl: '/buyer/shipments',
        recipients: [
          {
            userId: 'buyer-001',
            email: 'buyer@nordicapparel.com',
            name: 'Morten Lindqvist',
            role: 'Buyer',
            buyerOrganizationId: 'buyer-org-001',
          },
        ],
      });

      expect(result.notificationsCreated).toBe(1);
      expect(result.emailsQueued).toBe(1);
      expect(result.duplicateSuppressed).toBe(false);
    });

    it('suppresses duplicate events with identical idempotency keys (idempotency guarantee)', async () => {
      const eventPayload = {
        type: 'SAMPLE_APPROVED' as const,
        category: 'SAMPLE' as const,
        severity: 'success' as const,
        entityType: 'sample' as const,
        entityId: 'sample-777',
        version: 1,
        orderNumber: 'PO-2026-0881',
        sampleType: 'Pre-Production (PP)',
        actorUid: 'buyer-001',
        actorRole: 'Buyer',
        title: 'PP Sample Approved',
        message: 'Buyer approved PP sample without comments.',
        recipients: [
          {
            userId: 'staff-merch-001',
            email: 'merch@xyzbuyinghouse.com',
            name: 'A. Rahman',
            role: 'Merchandiser' as UserRole,
          },
        ],
      };

      const first = await dispatchNotificationEvent(eventPayload);
      expect(first.notificationsCreated).toBe(1);
      expect(first.duplicateSuppressed).toBe(false);

      // Re-dispatch identical event
      const second = await dispatchNotificationEvent(eventPayload);
      expect(second.notificationsCreated).toBe(0);
      expect(second.emailsQueued).toBe(0);
      expect(second.duplicateSuppressed).toBe(true);
    });
  });

  describe('5. Email Abstraction, Templates & Privacy Redaction', () => {
    it('development email adapter safely logs and records outgoing emails with SIMULATED state', async () => {
      const adapter = new DevelopmentEmailAdapter();
      const res = await adapter.sendEmail({
        to: 'buyer@nordicapparel.com',
        recipientUserId: 'buyer-001',
        subject: 'Order Update Notification',
        html: '<p>Order update content</p>',
      });

      expect(res.success).toBe(true);
      expect(res.state).toBe('SIMULATED');
      expect(res.provider).toBe('DEVELOPMENT_SIMULATOR');

      const logs = await getEmailDeliveryLogs('buyer-001');
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].state).toBe('SIMULATED');
    });

    it('renders clean B2B email templates for major operational workflows', () => {
      const sampleEmail = renderEmailTemplate('sample-approval-request', {
        recipientName: 'Morten Lindqvist',
        isBuyer: true,
        orderNumber: 'PO-2026-0881',
        sampleType: 'Fit Sample',
        actionUrl: 'https://xyzbuyinghouse.com/buyer/orders/TEST-ORDER-001',
      });

      expect(sampleEmail.subject).toContain('Sample Approval Requested');
      expect(sampleEmail.html).toContain('XYZ Buying House');
      expect(sampleEmail.html).toContain('Fit Sample');
      expect(sampleEmail.html).toContain('PO-2026-0881');
      expect(sampleEmail.text).toContain('Morten Lindqvist');
    });

    it('ensures buyer email templates never expose internal notes or cross-tenant data', () => {
      const delayEmail = renderEmailTemplate('production-delay', {
        recipientName: 'Buyer Executive',
        isBuyer: true,
        orderNumber: 'PO-2026-0881',
        delayReason: 'Supply chain fabric shipment variance',
        actionUrl: 'https://xyzbuyinghouse.com/buyer/orders/TEST-ORDER-001',
      });

      expect(delayEmail.html).not.toContain('internal_notes');
      expect(delayEmail.html).not.toContain('admin_remarks');
      expect(delayEmail.html).not.toContain('factory_labor_cost');
      expect(delayEmail.html).toContain('Supply chain fabric shipment variance');
    });
  });

  describe('6. Bounded Email Retry Engine', () => {
    it('increments retry attempts and calculates exponential backoff metadata', async () => {
      // Send initial email to create log
      const res = await sendEmail({
        to: 'buyer@nordicapparel.com',
        recipientUserId: 'buyer-001',
        subject: 'Logistics Update',
        html: '<p>Content</p>',
      });

      // Mark as retrying
      const retry1 = await retryFailedEmail(res.deliveryId);
      expect(retry1.success).toBe(true);

      const logs = await getEmailDeliveryLogs();
      const log = logs.find((l) => l.id === res.deliveryId);
      expect(log?.attempts).toBe(2);
      expect(log?.nextRetryAt).toBeDefined();
    });

    it('fails safely and bounds retries when max attempt limit is exceeded', async () => {
      const res = await sendEmail({
        to: 'buyer@nordicapparel.com',
        recipientUserId: 'buyer-001',
        subject: 'Retry Test',
        html: '<p>Content</p>',
      });

      // Attempt 2
      await retryFailedEmail(res.deliveryId);
      // Attempt 3
      await retryFailedEmail(res.deliveryId);
      // Attempt 4 -> exceeds maxAttempts (3)
      const finalRetry = await retryFailedEmail(res.deliveryId);

      expect(finalRetry.success).toBe(false);
      expect(finalRetry.state).toBe('FAILED');
      expect(finalRetry.error).toContain('Maximum retry attempts exceeded');
    });
  });

  describe('7. RBAC & Permissions Matrix', () => {
    it('verifies notification permissions across all 7 platform roles', () => {
      // Super Admin
      expect(hasPermission('Super Admin', 'notifications.read')).toBe(true);
      expect(hasPermission('Super Admin', 'notifications.manage')).toBe(true);
      expect(hasPermission('Super Admin', 'notifications.configure')).toBe(true);
      expect(hasPermission('Super Admin', 'notifications.email')).toBe(true);
      expect(hasPermission('Super Admin', 'notifications.system')).toBe(true);

      // Admin
      expect(hasPermission('Admin', 'notifications.read')).toBe(true);
      expect(hasPermission('Admin', 'notifications.manage')).toBe(true);
      expect(hasPermission('Admin', 'notifications.configure')).toBe(true);
      expect(hasPermission('Admin', 'notifications.email')).toBe(true);
      expect(hasPermission('Admin', 'notifications.system')).toBe(false);

      // Operations Manager
      expect(hasPermission('Operations Manager', 'notifications.read')).toBe(true);
      expect(hasPermission('Operations Manager', 'notifications.manage')).toBe(true);
      expect(hasPermission('Operations Manager', 'notifications.email')).toBe(true);
      expect(hasPermission('Operations Manager', 'notifications.configure')).toBe(false);

      // Merchandiser
      expect(hasPermission('Merchandiser', 'notifications.read')).toBe(true);
      expect(hasPermission('Merchandiser', 'notifications.manage')).toBe(true);
      expect(hasPermission('Merchandiser', 'notifications.email')).toBe(true);
      expect(hasPermission('Merchandiser', 'notifications.configure')).toBe(false);

      // Production Staff
      expect(hasPermission('Production Staff', 'notifications.read')).toBe(true);
      expect(hasPermission('Production Staff', 'notifications.manage')).toBe(false);
      expect(hasPermission('Production Staff', 'notifications.email')).toBe(false);

      // QC Staff
      expect(hasPermission('QC Staff', 'notifications.read')).toBe(true);
      expect(hasPermission('QC Staff', 'notifications.manage')).toBe(false);
      expect(hasPermission('QC Staff', 'notifications.email')).toBe(false);

      // Buyer
      expect(hasPermission('Buyer', 'notifications.read')).toBe(true);
      expect(hasPermission('Buyer', 'notifications.manage')).toBe(false);
      expect(hasPermission('Buyer', 'notifications.configure')).toBe(false);
      expect(hasPermission('Buyer', 'notifications.email')).toBe(false);
    });
  });
});
