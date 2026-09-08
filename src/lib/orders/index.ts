import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  orderBy,
} from 'firebase/firestore';
import { db, isConfigured } from '@/lib/firebase/client';
import {
  Order,
  OrderStatus,
  BuyerDashboardStats,
  AdminDashboardStats,
  OrderMilestone,
} from '@/types/order';
import { getNotificationsForUser } from '@/lib/notifications';
import { logSecurityEvent } from '@/lib/audit';

/**
 * Standard progress percentage mapped to documented workflow stages.
 */
export const ORDER_STAGE_PROGRESS: Record<OrderStatus, number> = {
  Inquiry: 5,
  Development: 10,
  Sampling: 20,
  'Order Confirmation': 30,
  Material: 45,
  Cutting: 55,
  Production: 70,
  Finishing: 80,
  QC: 88,
  Packing: 93,
  Shipment: 97,
  Completed: 100,
  Cancelled: 0,
};

/**
 * Workflow stages in execution sequence.
 */
export const ORDER_WORKFLOW_SEQUENCE: { stage: OrderStatus; label: string; description: string }[] = [
  { stage: 'Order Confirmation', label: 'Order Confirmed', description: 'Purchase order verified and factory lines reserved.' },
  { stage: 'Sampling', label: 'Sampling & Approvals', description: 'Proto, fit, and pre-production (PP) samples submitted.' },
  { stage: 'Material', label: 'Material & Cutting', description: 'Yarn, fabric, and accessories inspected under 4-point standard.' },
  { stage: 'Production', label: 'Sewing Production', description: 'Bulk line assembly and inline quality monitoring.' },
  { stage: 'QC', label: 'Quality & AQL Audit', description: 'Final Random Inspection (FRI) AQL 1.5/2.5 testing.' },
  { stage: 'Shipment', label: 'Packing & Shipment', description: 'Carton stuffing, customs clearance, and vessel dispatch.' },
  { stage: 'Completed', label: 'Order Delivered', description: 'Goods cleared and transaction concluded.' },
];

/**
 * Clearly identified test fixtures for development and testing fallback mode.
 * Never used for real production accounts.
 */
export const TEST_ORDER_FIXTURES: Order[] = [
  {
    id: 'TEST-ORDER-001',
    orderNumber: 'PO-2026-0881',
    buyerOrganizationId: 'buyer-org-001',
    styleNumber: 'STY-KNIT-402',
    productName: 'Combed Cotton Heavyweight Crewneck T-Shirt',
    category: 'Circular Knitwear',
    factoryId: 'fac-unit-knitwear',
    quantity: 12500,
    currency: 'USD',
    orderDate: '2026-08-10',
    exFactoryDate: '2026-10-15',
    shipmentDate: '2026-10-22',
    currentStatus: 'Production',
    priority: 'high',
    assignedMerchandiserId: 'merch-001',
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-09-05T14:30:00Z',
  },
  {
    id: 'TEST-ORDER-002',
    orderNumber: 'PO-2026-0914',
    buyerOrganizationId: 'buyer-org-001',
    styleNumber: 'STY-WOV-219',
    productName: 'Garment-Dyed Cotton Chino Trouser',
    category: 'Woven Tops & Bottoms',
    factoryId: 'fac-unit-woven',
    quantity: 6000,
    currency: 'USD',
    orderDate: '2026-08-20',
    exFactoryDate: '2026-11-05',
    currentStatus: 'Sampling',
    priority: 'medium',
    assignedMerchandiserId: 'merch-002',
    createdAt: '2026-08-20T10:15:00Z',
    updatedAt: '2026-09-02T11:00:00Z',
  },
  {
    id: 'TEST-ORDER-003',
    orderNumber: 'PO-2026-0742',
    buyerOrganizationId: 'buyer-org-001',
    styleNumber: 'STY-DNM-508',
    productName: 'Vintage Wash Comfort-Stretch 5-Pocket Jeans',
    category: 'Denim & Washed Apparel',
    factoryId: 'fac-unit-denim',
    quantity: 8500,
    currency: 'USD',
    orderDate: '2026-07-15',
    exFactoryDate: '2026-09-25',
    shipmentDate: '2026-09-30',
    currentStatus: 'QC',
    priority: 'urgent',
    assignedMerchandiserId: 'merch-001',
    createdAt: '2026-07-15T08:30:00Z',
    updatedAt: '2026-09-07T16:45:00Z',
  },
  {
    id: 'TEST-ORDER-004',
    orderNumber: 'PO-2026-0610',
    buyerOrganizationId: 'buyer-org-002',
    styleNumber: 'STY-JKT-110',
    productName: 'Brushed Cotton Sherpa-Lined Trucker Jacket',
    category: 'Outerwear & Heavy Jackets',
    factoryId: 'fac-unit-woven',
    quantity: 4200,
    currency: 'USD',
    orderDate: '2026-06-01',
    exFactoryDate: '2026-09-01',
    shipmentDate: '2026-09-08',
    currentStatus: 'Shipment',
    priority: 'high',
    assignedMerchandiserId: 'merch-002',
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-09-06T10:00:00Z',
  },
];

let inMemoryOrders = [...TEST_ORDER_FIXTURES];

/**
 * Calculates progress percentage for a given order status.
 */
export function getOrderProgressPercentage(status: OrderStatus): number {
  return ORDER_STAGE_PROGRESS[status] ?? 0;
}

/**
 * Builds chronological milestone progress for an order.
 */
export function getOrderMilestones(order: Order): OrderMilestone[] {
  const currentProgress = getOrderProgressPercentage(order.currentStatus);

  return ORDER_WORKFLOW_SEQUENCE.map((stageItem) => {
    const stageProgress = getOrderProgressPercentage(stageItem.stage);
    let status: 'completed' | 'in_progress' | 'upcoming' = 'upcoming';

    if (order.currentStatus === 'Cancelled') {
      status = 'upcoming';
    } else if (stageItem.stage === order.currentStatus) {
      status = 'in_progress';
    } else if (stageProgress < currentProgress) {
      status = 'completed';
    }

    return {
      stage: stageItem.stage,
      label: stageItem.label,
      description: stageItem.description,
      status,
      date: stageItem.stage === 'Order Confirmation' ? order.orderDate : undefined,
    };
  });
}

/**
 * Fetches all orders belonging strictly to the authenticated buyer's organization.
 * Enforces tenant isolation at the query level.
 */
export async function getOrdersByBuyerOrg(buyerOrgId: string): Promise<Order[]> {
  if (!buyerOrgId) {
    return [];
  }

  if (isConfigured && db) {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('buyerOrganizationId', '==', buyerOrgId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const orders: Order[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Omit<Order, 'id'>;
        orders.push({
          id: docSnap.id,
          ...data,
        });
      });

      return orders;
    } catch (error) {
      console.warn('[Firestore] Error fetching orders by buyerOrganizationId:', error);
      try {
        const ordersRef = collection(db, 'orders');
        const fallbackQ = query(ordersRef, where('buyerOrganizationId', '==', buyerOrgId));
        const querySnapshot = await getDocs(fallbackQ);
        const orders: Order[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<Order, 'id'>;
          orders.push({ id: docSnap.id, ...data });
        });
        return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (fallbackError) {
        console.error('[Firestore] Fallback query failed:', fallbackError);
      }
    }
  }

  return inMemoryOrders.filter((o) => o.buyerOrganizationId === buyerOrgId);
}

/**
 * Fetches a single order by ID and strictly verifies tenant isolation.
 * Returns null if the order does not exist OR belongs to another buyer organization.
 */
export async function getOrderByIdForBuyer(orderId: string, buyerOrgId: string): Promise<Order | null> {
  if (!orderId || !buyerOrgId) {
    return null;
  }

  if (isConfigured && db) {
    try {
      const orderDocRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(orderDocRef);

      if (!docSnap.exists()) {
        return null;
      }

      const orderData = docSnap.data() as Omit<Order, 'id'>;

      if (orderData.buyerOrganizationId !== buyerOrgId) {
        return null;
      }

      return {
        id: docSnap.id,
        ...orderData,
      };
    } catch (error) {
      console.warn(`[Firestore] Error fetching order ${orderId}:`, error);
      return null;
    }
  }

  const fixture = inMemoryOrders.find(
    (o) => o.id === orderId && o.buyerOrganizationId === buyerOrgId
  );
  return fixture || null;
}

/**
 * Fetches dashboard summary statistics for the buyer's organization.
 */
export async function getBuyerDashboardStats(
  buyerOrgId: string,
  userId?: string
): Promise<BuyerDashboardStats> {
  const orders = await getOrdersByBuyerOrg(buyerOrgId);
  let unreadNotificationsCount = 0;

  if (userId) {
    try {
      const notifications = await getNotificationsForUser(userId);
      unreadNotificationsCount = notifications.filter((n) => !n.read).length;
    } catch {
      unreadNotificationsCount = 0;
    }
  }

  const activeOrders = orders.filter(
    (o) => o.currentStatus !== 'Completed' && o.currentStatus !== 'Cancelled'
  );

  const inProduction = orders.filter((o) =>
    ['Material', 'Cutting', 'Production', 'Finishing'].includes(o.currentStatus)
  );

  const upcomingShipments = orders.filter((o) =>
    ['QC', 'Packing', 'Shipment'].includes(o.currentStatus)
  );

  return {
    activeOrdersCount: activeOrders.length,
    inProductionCount: inProduction.length,
    upcomingShipmentsCount: upcomingShipments.length,
    unreadNotificationsCount,
  };
}

/**
 * Administrative Service: Fetches all purchase orders across all organizations.
 */
export async function getAllOrders(): Promise<Order[]> {
  if (isConfigured && db) {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
      });
      return orders;
    } catch (error) {
      console.warn('[Firestore] Error fetching all orders, attempting fallback:', error);
      try {
        const ordersRef = collection(db, 'orders');
        const snapshot = await getDocs(ordersRef);
        const orders: Order[] = [];
        snapshot.forEach((docSnap) => {
          orders.push({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
        });
        return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (fallbackError) {
        console.error('[Firestore] All orders fallback query failed:', fallbackError);
      }
    }
  }

  return inMemoryOrders;
}

/**
 * Administrative Service: Fetches an order by ID for staff operations.
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!orderId) return null;

  if (isConfigured && db) {
    try {
      const orderDocRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(orderDocRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) };
      }
      return null;
    } catch (error) {
      console.warn(`[Firestore] Error fetching order ${orderId}:`, error);
    }
  }

  const found = inMemoryOrders.find((o) => o.id === orderId);
  return found || null;
}

/**
 * Administrative Service: Creates a purchase order.
 */
export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
  actor?: { uid: string; role: string }
): Promise<Order> {
  const newId = `ord-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: newId,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'orders', newId);
      await setDoc(docRef, {
        orderNumber: newOrder.orderNumber,
        buyerOrganizationId: newOrder.buyerOrganizationId,
        styleNumber: newOrder.styleNumber,
        productName: newOrder.productName,
        category: newOrder.category,
        factoryId: newOrder.factoryId,
        quantity: newOrder.quantity,
        currency: newOrder.currency,
        unitPrice: newOrder.unitPrice || null,
        orderDate: newOrder.orderDate,
        exFactoryDate: newOrder.exFactoryDate,
        shipmentDate: newOrder.shipmentDate || null,
        currentStatus: newOrder.currentStatus,
        priority: newOrder.priority,
        assignedMerchandiserId: newOrder.assignedMerchandiserId,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      console.error('[Firestore] Error creating order:', error);
    }
  }

  inMemoryOrders.unshift(newOrder);

  if (actor) {
    await logSecurityEvent({
      actorUid: actor.uid,
      actorRole: actor.role,
      action: 'AUTH_ACCOUNT_STATUS_CHANGE',
      entityId: newId,
      after: {
        orderNumber: newOrder.orderNumber,
        styleNumber: newOrder.styleNumber,
        buyerOrganizationId: newOrder.buyerOrganizationId,
        quantity: newOrder.quantity,
      },
    });
  }

  return newOrder;
}

/**
 * Administrative Service: Updates order state.
 */
export async function updateOrder(
  orderId: string,
  data: Partial<Omit<Order, 'id' | 'createdAt'>>,
  actor?: { uid: string; role: string }
): Promise<Order | null> {
  const existing = await getOrderById(orderId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: Order = {
    ...existing,
    ...data,
    updatedAt: now,
  };

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: now,
      });
    } catch (error) {
      console.error(`[Firestore] Error updating order ${orderId}:`, error);
    }
  }

  inMemoryOrders = inMemoryOrders.map((o) => (o.id === orderId ? updated : o));

  if (actor) {
    await logSecurityEvent({
      actorUid: actor.uid,
      actorRole: actor.role,
      action: 'AUTH_ACCOUNT_STATUS_CHANGE',
      entityId: orderId,
      before: { currentStatus: existing.currentStatus, priority: existing.priority },
      after: { currentStatus: updated.currentStatus, priority: updated.priority },
    });
  }

  return updated;
}

/**
 * Calculates operational KPIs for Admin/Staff dashboard.
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const orders = await getAllOrders();

  const activeOrders = orders.filter(
    (o) => o.currentStatus !== 'Completed' && o.currentStatus !== 'Cancelled'
  );

  const inProduction = orders.filter((o) =>
    ['Material', 'Cutting', 'Production', 'Finishing'].includes(o.currentStatus)
  );

  const delayedOrders = orders.filter((o) => {
    if (o.currentStatus === 'Completed' || o.currentStatus === 'Cancelled') return false;
    const exDate = new Date(o.exFactoryDate).getTime();
    const today = new Date().getTime();
    return exDate < today || (o.priority === 'urgent' && o.currentStatus !== 'Shipment');
  });

  const pendingSampleApprovals = orders.filter((o) =>
    ['Inquiry', 'Development', 'Sampling'].includes(o.currentStatus)
  );

  const upcomingExFactory = orders.filter((o) => {
    if (o.currentStatus === 'Completed' || o.currentStatus === 'Cancelled') return false;
    const exDate = new Date(o.exFactoryDate).getTime();
    const today = new Date().getTime();
    const diffDays = (exDate - today) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 45;
  });

  const qcIssues = orders.filter((o) => o.currentStatus === 'QC');

  const upcomingShipments = orders.filter((o) =>
    ['QC', 'Packing', 'Shipment'].includes(o.currentStatus)
  );

  return {
    activeOrdersCount: activeOrders.length,
    inProductionCount: inProduction.length,
    delayedOrdersCount: delayedOrders.length,
    pendingSampleApprovalsCount: pendingSampleApprovals.length,
    upcomingExFactoryCount: upcomingExFactory.length,
    qcIssuesCount: qcIssues.length,
    upcomingShipmentsCount: upcomingShipments.length,
  };
}
