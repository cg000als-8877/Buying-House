import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db, isConfigured } from '@/lib/firebase/client';
import {
  AppNotification,
  NotificationCategory,
  NotificationSeverity,
  NotificationSummaryMetrics,
} from '@/types/notification';
import {
  NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '@/types/notificationPreferences';
import { UserRole } from '@/types/auth';
import { logSecurityEvent } from '@/lib/audit';

export const TEST_NOTIFICATION_FIXTURES: AppNotification[] = [
  {
    id: 'notif-001',
    recipientUserId: 'buyer-001',
    recipientRole: 'Buyer',
    buyerOrganizationId: 'buyer-org-001',
    type: 'PRODUCTION_UPDATE_PUBLISHED',
    category: 'PRODUCTION',
    title: 'Cutting Stage Completed (PO-2026-0881)',
    message: 'Cutting stage completed for PO-2026-0881 (12,500 pcs). Sewing lines initialized.',
    severity: 'info',
    channel: 'ALL',
    entityType: 'production',
    entityId: 'prod-001',
    orderId: 'TEST-ORDER-001',
    relatedOrderId: 'TEST-ORDER-001',
    isRead: false,
    read: false,
    actionUrl: '/buyer/orders/TEST-ORDER-001',
    createdAt: '2026-09-07T14:30:00Z',
  },
  {
    id: 'notif-002',
    recipientUserId: 'buyer-001',
    recipientRole: 'Buyer',
    buyerOrganizationId: 'buyer-org-001',
    type: 'INSPECTION_PUBLISHED',
    category: 'QUALITY',
    title: 'AQL 1.5 Inline Quality Audit Passed',
    message: 'QC inspection report for Vintage Wash Jeans (PO-2026-0742) passed with zero critical defects.',
    severity: 'success',
    channel: 'ALL',
    entityType: 'quality_inspection',
    entityId: 'insp-001',
    orderId: 'TEST-ORDER-003',
    relatedOrderId: 'TEST-ORDER-003',
    isRead: false,
    read: false,
    actionUrl: '/buyer/quality',
    createdAt: '2026-09-06T09:15:00Z',
  },
  {
    id: 'notif-003',
    recipientUserId: 'buyer-001',
    recipientRole: 'Buyer',
    buyerOrganizationId: 'buyer-org-001',
    type: 'SAMPLE_SUBMITTED_FOR_REVIEW',
    category: 'SAMPLE',
    title: 'PP Sample Submitted for Approval',
    message: 'Pre-production sample for Garment-Dyed Chino Trouser (PO-2026-0914) has been dispatched for buyer approval.',
    severity: 'warning',
    channel: 'ALL',
    entityType: 'sample',
    entityId: 'sample-001',
    orderId: 'TEST-ORDER-002',
    relatedOrderId: 'TEST-ORDER-002',
    isRead: true,
    read: true,
    readAt: '2026-09-05T12:00:00Z',
    actionUrl: '/buyer/orders/TEST-ORDER-002',
    createdAt: '2026-09-04T11:00:00Z',
  },
  {
    id: 'notif-004',
    recipientUserId: 'buyer-001',
    recipientRole: 'Buyer',
    buyerOrganizationId: 'buyer-org-001',
    type: 'DOCUMENT_UPLOADED',
    category: 'DOCUMENT',
    title: 'Commercial Shipping Invoice Available',
    message: 'Shipping document package uploaded for PO-2026-0742.',
    severity: 'info',
    channel: 'ALL',
    entityType: 'document',
    entityId: 'doc-001',
    orderId: 'TEST-ORDER-003',
    relatedOrderId: 'TEST-ORDER-003',
    isRead: true,
    read: true,
    readAt: '2026-09-03T16:00:00Z',
    actionUrl: '/buyer/documents',
    createdAt: '2026-09-02T16:20:00Z',
  },
  {
    id: 'notif-005',
    recipientUserId: 'buyer-001',
    recipientRole: 'Buyer',
    buyerOrganizationId: 'buyer-org-001',
    type: 'SHIPMENT_DISPATCHED',
    category: 'SHIPMENT',
    title: 'Consignment SHP-2026-0081 In Transit',
    message: 'Cargo loaded on vessel CMA CGM CHENNAI departing Chittagong Port. Live tracking available.',
    severity: 'info',
    channel: 'ALL',
    entityType: 'shipment',
    entityId: 'ship-001',
    orderId: 'TEST-ORDER-001',
    shipmentId: 'ship-001',
    relatedOrderId: 'TEST-ORDER-001',
    isRead: false,
    read: false,
    actionUrl: '/buyer/shipments',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'notif-006',
    recipientUserId: 'staff-admin-001',
    recipientRole: 'Admin',
    type: 'PRODUCTION_DELAY_DETECTED',
    category: 'PRODUCTION',
    title: 'Schedule Variance Flagged on Line 4',
    message: 'Target throughput variance exceeds 12% on PO-2026-0881. Supervisor intervention logged.',
    severity: 'warning',
    channel: 'ALL',
    entityType: 'production',
    entityId: 'prod-001',
    orderId: 'TEST-ORDER-001',
    relatedOrderId: 'TEST-ORDER-001',
    isRead: false,
    read: false,
    actionUrl: '/admin/orders/TEST-ORDER-001',
    createdAt: '2026-09-07T15:00:00Z',
  },
  {
    id: 'notif-007',
    recipientUserId: 'staff-admin-001',
    recipientRole: 'Admin',
    type: 'INSPECTION_FAILED',
    category: 'QUALITY',
    title: 'AQL Inspection Non-Conformance Flagged',
    message: 'Final Random Inspection for PO-2026-0891 failed AQL Major limit. CAP initiated.',
    severity: 'critical',
    channel: 'ALL',
    entityType: 'quality_inspection',
    entityId: 'insp-002',
    orderId: 'TEST-ORDER-002',
    relatedOrderId: 'TEST-ORDER-002',
    isRead: false,
    read: false,
    actionUrl: '/admin/quality',
    createdAt: '2026-09-07T11:30:00Z',
  },
];

let inMemoryNotifications: AppNotification[] = [...TEST_NOTIFICATION_FIXTURES];
const inMemoryPreferences: Map<string, NotificationPreferences> = new Map();

/**
 * Resets in-memory notification store (for unit test isolation).
 */
export function resetInMemoryNotifications(): void {
  inMemoryNotifications = [...TEST_NOTIFICATION_FIXTURES];
  inMemoryPreferences.clear();
}

export interface NotificationFilters {
  category?: NotificationCategory | 'ALL';
  severity?: NotificationSeverity | 'ALL';
  unreadOnly?: boolean;
  search?: string;
  limit?: number;
}

/**
 * Fetches notifications for a user, enforcing strict ownership and tenant isolation.
 */
export async function getNotificationsForUser(
  userId: string,
  filters?: NotificationFilters
): Promise<AppNotification[]> {
  if (!userId) {
    return [];
  }

  let results: AppNotification[] = [];

  if (isConfigured && db) {
    try {
      const notifsRef = collection(db, 'notifications');
      const q = query(
        notifsRef,
        where('recipientUserId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((snap: QueryDocumentSnapshot<DocumentData>) => {
        const data = snap.data();
        results.push({
          id: snap.id,
          ...data,
          isRead: data.isRead ?? data.read ?? false,
          read: data.read ?? data.isRead ?? false,
        } as AppNotification);
      });
    } catch (error) {
      console.warn('[Firestore] Error fetching notifications, falling back to local memory:', error);
      results = inMemoryNotifications.filter((n) => n.recipientUserId === userId);
    }
  } else {
    // In-memory filter enforcing strict recipient user ownership
    results = inMemoryNotifications.filter((n) => n.recipientUserId === userId);
  }

  // Apply filters
  if (filters?.category && filters.category !== 'ALL') {
    results = results.filter((n) => n.category === filters.category);
  }

  if (filters?.severity && filters.severity !== 'ALL') {
    results = results.filter((n) => n.severity === filters.severity);
  }

  if (filters?.unreadOnly) {
    results = results.filter((n) => !n.isRead && !n.read);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.orderId && n.orderId.toLowerCase().includes(q))
    );
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (filters?.limit && filters.limit > 0) {
    return results.slice(0, filters.limit);
  }

  return results;
}

/**
 * Creates a new in-app notification.
 */
export async function createNotification(
  data: Omit<AppNotification, 'id' | 'createdAt'>
): Promise<AppNotification> {
  const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newNotif: AppNotification = {
    ...data,
    id,
    isRead: data.isRead ?? false,
    read: data.read ?? false,
    createdAt: now,
  };

  inMemoryNotifications.unshift(newNotif);
  return newNotif;
}

/**
 * Creates batch notifications for multiple user IDs.
 */
export async function createNotificationsForUsers(
  recipientUserIds: string[],
  data: Omit<AppNotification, 'id' | 'createdAt' | 'recipientUserId'>
): Promise<AppNotification[]> {
  const created: AppNotification[] = [];
  for (const uid of recipientUserIds) {
    const notif = await createNotification({
      ...data,
      recipientUserId: uid,
    });
    created.push(notif);
  }
  return created;
}

/**
 * Calculates count of unread notifications for a user.
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!userId) return 0;
  const notifs = await getNotificationsForUser(userId, { unreadOnly: true });
  return notifs.length;
}

/**
 * Marks a notification as read.
 */
export async function markNotificationAsRead(notificationId: string, actorUid?: string): Promise<void> {
  if (!notificationId) return;

  const now = new Date().toISOString();

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, { isRead: true, read: true, readAt: now });
    } catch (error) {
      console.warn(`[Firestore] Error updating notification ${notificationId}:`, error);
    }
  }

  inMemoryNotifications = inMemoryNotifications.map((n) =>
    n.id === notificationId ? { ...n, isRead: true, read: true, readAt: now } : n
  );

  if (actorUid) {
    await logSecurityEvent({
      actorUid,
      actorRole: 'User',
      action: 'NOTIFICATION_READ',
      entityId: notificationId,
      after: { readAt: now },
    });
  }
}

export const markNotificationRead = markNotificationAsRead;

/**
 * Marks all notifications for a user as read.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (!userId) return;

  const now = new Date().toISOString();

  inMemoryNotifications = inMemoryNotifications.map((n) =>
    n.recipientUserId === userId ? { ...n, isRead: true, read: true, readAt: now } : n
  );

  await logSecurityEvent({
    actorUid: userId,
    actorRole: 'User',
    action: 'NOTIFICATION_READ',
    entityId: `all-${userId}`,
    after: { markedAllReadAt: now },
  });
}

export const markAllNotificationsRead = markAllNotificationsAsRead;

/**
 * Deletes a notification by ID.
 */
export async function deleteNotification(id: string, _actorUid?: string): Promise<boolean> {
  if (!id) return false;
  const initialLen = inMemoryNotifications.length;
  inMemoryNotifications = inMemoryNotifications.filter((n) => n.id !== id);
  return inMemoryNotifications.length < initialLen;
}

/**
 * Retrieves notification preferences for a user, creating defaults if not yet set.
 */
export async function getNotificationPreferences(
  userId: string,
  role?: UserRole
): Promise<NotificationPreferences> {
  if (inMemoryPreferences.has(userId)) {
    return inMemoryPreferences.get(userId)!;
  }

  const effectiveRole = role || 'Buyer';
  const defaultBase = DEFAULT_NOTIFICATION_PREFERENCES[effectiveRole] || DEFAULT_NOTIFICATION_PREFERENCES['Buyer'];

  const prefs: NotificationPreferences = {
    userId,
    ...defaultBase,
    updatedAt: new Date().toISOString(),
  };

  inMemoryPreferences.set(userId, prefs);
  return prefs;
}

/**
 * Updates notification preferences for a user.
 */
export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const current = await getNotificationPreferences(userId);
  const updated: NotificationPreferences = {
    ...current,
    ...updates,
    userId,
    updatedAt: new Date().toISOString(),
  };

  inMemoryPreferences.set(userId, updated);

  await logSecurityEvent({
    actorUid: userId,
    actorRole: 'User',
    action: 'NOTIFICATION_PREFERENCES_UPDATED',
    entityId: `pref-${userId}`,
    after: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

/**
 * Retrieves recent notifications formatted for the header bell popover.
 */
export async function getRecentNotificationsForHeader(
  userId: string,
  limitCount: number = 5
): Promise<AppNotification[]> {
  return getNotificationsForUser(userId, { limit: limitCount });
}

/**
 * Aggregates notification summary metrics for dashboard / telemetry.
 */
export async function getNotificationMetrics(userId: string): Promise<NotificationSummaryMetrics> {
  const all = await getNotificationsForUser(userId);
  const unread = all.filter((n) => !n.isRead && !n.read);
  const critical = unread.filter((n) => n.severity === 'critical');

  const unreadByCategory: Record<NotificationCategory, number> = {
    ORDER: unread.filter((n) => n.category === 'ORDER').length,
    PRODUCTION: unread.filter((n) => n.category === 'PRODUCTION').length,
    SAMPLE: unread.filter((n) => n.category === 'SAMPLE').length,
    DOCUMENT: unread.filter((n) => n.category === 'DOCUMENT').length,
    QUALITY: unread.filter((n) => n.category === 'QUALITY').length,
    SHIPMENT: unread.filter((n) => n.category === 'SHIPMENT').length,
    SYSTEM: unread.filter((n) => n.category === 'SYSTEM').length,
  };

  return {
    totalCount: all.length,
    unreadCount: unread.length,
    criticalCount: critical.length,
    unreadByCategory,
  };
}
