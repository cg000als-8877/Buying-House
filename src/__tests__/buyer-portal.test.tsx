import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  getOrderByIdForBuyer,
  getOrdersByBuyerOrg,
  getBuyerDashboardStats,
  getOrderProgressPercentage,
  getOrderMilestones,
} from '@/lib/orders';
import {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/notifications';
import { OrderStatusBadge } from '@/components/buyer/OrderStatusBadge';
import { OrderProgressBar } from '@/components/buyer/OrderProgressBar';
import { OrderStatusTimeline } from '@/components/buyer/OrderStatusTimeline';
import { OrderCard } from '@/components/buyer/OrderCard';
import { Order } from '@/types/order';

// Mock useRouter and usePathname
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/buyer/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

describe('Buyer Portal Module — Step 7 Verification', () => {
  const mockOrder: Order = {
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
  };

  describe('1. Tenant Isolation & Data Access Security', () => {
    it('successfully retrieves order when buyerOrganizationId matches', async () => {
      const order = await getOrderByIdForBuyer('TEST-ORDER-001', 'buyer-org-001');
      expect(order).not.toBeNull();
      expect(order?.id).toBe('TEST-ORDER-001');
      expect(order?.orderNumber).toBe('PO-2026-0881');
      expect(order?.buyerOrganizationId).toBe('buyer-org-001');
    });

    it('strictly returns null (safe not found) when buyerOrganizationId does not match (preventing cross-tenant data leak)', async () => {
      const order = await getOrderByIdForBuyer('TEST-ORDER-001', 'unauthorized-buyer-org');
      expect(order).toBeNull();
    });

    it('returns null for non-existent order IDs', async () => {
      const order = await getOrderByIdForBuyer('NON-EXISTENT-PO', 'buyer-org-001');
      expect(order).toBeNull();
    });

    it('fetches only orders belonging to the specified buyer organization', async () => {
      const orders = await getOrdersByBuyerOrg('buyer-org-001');
      expect(orders.length).toBeGreaterThan(0);
      orders.forEach((o) => {
        expect(o.buyerOrganizationId).toBe('buyer-org-001');
      });
    });

    it('returns empty array when querying an organization with no orders', async () => {
      const orders = await getOrdersByBuyerOrg('empty-organization-tenant');
      expect(orders).toEqual([]);
    });
  });

  describe('2. Order Workflow & Milestone Progression Calculations', () => {
    it('correctly maps documented workflow stages to progress percentages', () => {
      expect(getOrderProgressPercentage('Inquiry')).toBe(5);
      expect(getOrderProgressPercentage('Sampling')).toBe(20);
      expect(getOrderProgressPercentage('Order Confirmation')).toBe(30);
      expect(getOrderProgressPercentage('Cutting')).toBe(55);
      expect(getOrderProgressPercentage('Production')).toBe(70);
      expect(getOrderProgressPercentage('QC')).toBe(88);
      expect(getOrderProgressPercentage('Shipment')).toBe(97);
      expect(getOrderProgressPercentage('Completed')).toBe(100);
      expect(getOrderProgressPercentage('Cancelled')).toBe(0);
    });

    it('builds chronological milestones with accurate completion and in-progress states', () => {
      const milestones = getOrderMilestones(mockOrder);
      expect(milestones.length).toBe(7);

      // Order Confirmation is stage 1 (progress 30 <= 70) -> completed
      expect(milestones[0].status).toBe('completed');
      expect(milestones[0].date).toBe('2026-08-10');

      // Production stage (progress 70 == 70) -> in_progress
      const prodMilestone = milestones.find((m) => m.stage === 'Production');
      expect(prodMilestone?.status).toBe('in_progress');

      // Shipment stage (progress 97 > 70) -> upcoming
      const shipMilestone = milestones.find((m) => m.stage === 'Shipment');
      expect(shipMilestone?.status).toBe('upcoming');
    });

    it('computes accurate buyer dashboard statistics', async () => {
      const stats = await getBuyerDashboardStats('buyer-org-001', 'buyer-001');
      expect(stats.activeOrdersCount).toBeGreaterThanOrEqual(1);
      expect(stats.inProductionCount).toBeGreaterThanOrEqual(1);
      expect(typeof stats.upcomingShipmentsCount).toBe('number');
      expect(typeof stats.unreadNotificationsCount).toBe('number');
    });
  });

  describe('3. Notifications & Activity Log', () => {
    it('retrieves isolated notifications for authenticated buyer user', async () => {
      const notifs = await getNotificationsForUser('buyer-001');
      expect(notifs.length).toBeGreaterThan(0);
      expect(notifs.some((n) => n.relatedOrderId === 'TEST-ORDER-001')).toBe(true);
    });

    it('marks a single notification as read', async () => {
      await markNotificationAsRead('notif-001');
      const notifs = await getNotificationsForUser('buyer-001');
      const target = notifs.find((n) => n.id === 'notif-001');
      expect(target?.read).toBe(true);
    });

    it('marks all notifications as read', async () => {
      await markAllNotificationsAsRead('buyer-001');
      const notifs = await getNotificationsForUser('buyer-001');
      notifs.forEach((n) => {
        expect(n.read).toBe(true);
      });
    });
  });

  describe('4. Buyer UI Components Rendering', () => {
    it('renders OrderStatusBadge with status text', () => {
      render(<OrderStatusBadge status="Production" />);
      expect(screen.getByText('Production')).toBeInTheDocument();
    });

    it('renders OrderProgressBar with percentage and accessible attributes', () => {
      render(<OrderProgressBar status="Production" customPercentage={70} />);
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('Production')).toBeInTheDocument();
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '70');
    });

    it('renders OrderStatusTimeline with all milestones', () => {
      const milestones = getOrderMilestones(mockOrder);
      render(<OrderStatusTimeline milestones={milestones} orderNumber={mockOrder.orderNumber} />);
      expect(screen.getByText(/Milestone Tracking/i)).toBeInTheDocument();
      expect(screen.getByText(/Order Confirmed/i)).toBeInTheDocument();
      expect(screen.getByText(/Sewing Production/i)).toBeInTheDocument();
      expect(screen.getByText(/Packing & Shipment/i)).toBeInTheDocument();
    });

    it('renders OrderCard with order specifications and links', () => {
      render(<OrderCard order={mockOrder} />);
      expect(screen.getByText(mockOrder.orderNumber)).toBeInTheDocument();
      expect(screen.getByText(mockOrder.productName)).toBeInTheDocument();
      expect(screen.getByText(/12,500 pcs/i)).toBeInTheDocument();
      expect(screen.getByText(/View Order Details/i)).toBeInTheDocument();
    });
  });
});
