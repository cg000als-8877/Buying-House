import { describe, it, expect, vi } from 'vitest';
import { hasPermission } from '@/lib/auth/permissions';
import {
  getBuyerOrganizations,
  getBuyerOrganizationById,
  createBuyerOrganization,
  updateBuyerOrganization,
} from '@/lib/buyers';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  getAdminDashboardStats,
} from '@/lib/orders';
import {
  getFactories,
  getFactoryById,
  createFactory,
} from '@/lib/factories';
import {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  inviteUser,
} from '@/lib/users';
import { fetchAuditLogs, logSecurityEvent } from '@/lib/audit';

// Mock router and navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin/dashboard',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ orderId: 'TEST-ORDER-001', buyerId: 'buyer-org-001', factoryId: 'fac-unit-knitwear' }),
}));

describe('Admin & Staff Operations Portal — Step 8 Verification', () => {
  describe('1. RBAC Clearance & Permission Matrix', () => {
    it('grants Super Admin all operational permissions including audit logs', () => {
      expect(hasPermission('Super Admin', 'auditLogs.read')).toBe(true);
      expect(hasPermission('Super Admin', 'users.write')).toBe(true);
      expect(hasPermission('Super Admin', 'orders.write')).toBe(true);
      expect(hasPermission('Super Admin', 'buyers.write')).toBe(true);
    });

    it('grants Merchandiser order and production management but restricts audit logs and user management', () => {
      expect(hasPermission('Merchandiser', 'orders.write')).toBe(true);
      expect(hasPermission('Merchandiser', 'production.write')).toBe(true);
      expect(hasPermission('Merchandiser', 'auditLogs.read')).toBe(false);
      expect(hasPermission('Merchandiser', 'users.write')).toBe(false);
    });

    it('restricts Buyer accounts from administrative writes and other buyer records', () => {
      expect(hasPermission('Buyer', 'orders.write')).toBe(false);
      expect(hasPermission('Buyer', 'buyers.write')).toBe(false);
      expect(hasPermission('Buyer', 'users.write')).toBe(false);
      expect(hasPermission('Buyer', 'auditLogs.read')).toBe(false);
    });
  });

  describe('2. Buyer Organization Management Service', () => {
    it('retrieves all buyer organizations', async () => {
      const orgs = await getBuyerOrganizations();
      expect(orgs.length).toBeGreaterThanOrEqual(1);
      expect(orgs.some((o) => o.id === 'buyer-org-001')).toBe(true);
    });

    it('retrieves single buyer organization by ID', async () => {
      const org = await getBuyerOrganizationById('buyer-org-001');
      expect(org).not.toBeNull();
      expect(org?.name).toBe('Nordic Trend House A/S');
      expect(org?.country).toBe('Denmark');
    });

    it('creates a new buyer organization tenant', async () => {
      const newOrg = await createBuyerOrganization(
        {
          name: 'Scandi Style AB',
          country: 'Sweden',
          contactEmail: 'sourcing@scandistyle.example',
          status: 'active',
          notes: 'Knitwear retail buyer',
        },
        { uid: 'staff-admin-001', role: 'Super Admin' }
      );

      expect(newOrg.id).toBeDefined();
      expect(newOrg.name).toBe('Scandi Style AB');
      expect(newOrg.country).toBe('Sweden');
    });

    it('updates buyer organization status', async () => {
      const updated = await updateBuyerOrganization(
        'buyer-org-003',
        { status: 'active' },
        { uid: 'staff-admin-001', role: 'Super Admin' }
      );

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('active');
    });
  });

  describe('3. Order Management & Operational KPI Calculations', () => {
    it('retrieves all orders across organizations for staff management', async () => {
      const orders = await getAllOrders();
      expect(orders.length).toBeGreaterThanOrEqual(2);
    });

    it('retrieves single order by ID for operational workspace', async () => {
      const order = await getOrderById('TEST-ORDER-001');
      expect(order).not.toBeNull();
      expect(order?.orderNumber).toBe('PO-2026-0881');
    });

    it('creates a new purchase order with validation fields', async () => {
      const created = await createOrder(
        {
          orderNumber: 'PO-2026-9901',
          buyerOrganizationId: 'buyer-org-001',
          styleNumber: 'STY-KNIT-880',
          productName: 'Organic Slub Jersey Henley Shirt',
          category: 'Circular Knitwear',
          factoryId: 'fac-unit-knitwear',
          quantity: 7500,
          currency: 'USD',
          orderDate: '2026-09-01',
          exFactoryDate: '2026-11-20',
          currentStatus: 'Order Confirmation',
          priority: 'medium',
          assignedMerchandiserId: 'merch-001',
        },
        { uid: 'staff-admin-001', role: 'Super Admin' }
      );

      expect(created.id).toBeDefined();
      expect(created.orderNumber).toBe('PO-2026-9901');
      expect(created.currentStatus).toBe('Order Confirmation');
    });

    it('updates order status and priority', async () => {
      const updated = await updateOrder(
        'TEST-ORDER-001',
        { currentStatus: 'Finishing', priority: 'urgent' },
        { uid: 'merch-001', role: 'Merchandiser' }
      );

      expect(updated).not.toBeNull();
      expect(updated?.currentStatus).toBe('Finishing');
      expect(updated?.priority).toBe('urgent');
    });

    it('computes accurate admin operational dashboard KPIs', async () => {
      const stats = await getAdminDashboardStats();
      expect(stats.activeOrdersCount).toBeGreaterThanOrEqual(1);
      expect(stats.inProductionCount).toBeGreaterThanOrEqual(0);
      expect(typeof stats.delayedOrdersCount).toBe('number');
      expect(typeof stats.pendingSampleApprovalsCount).toBe('number');
      expect(typeof stats.upcomingExFactoryCount).toBe('number');
      expect(typeof stats.upcomingShipmentsCount).toBe('number');
    });
  });

  describe('4. Partner Factory Registry', () => {
    it('retrieves factory list with compliance and capacity metrics', async () => {
      const factories = await getFactories();
      expect(factories.length).toBeGreaterThanOrEqual(1);
      expect(factories.some((f) => f.id === 'fac-unit-knitwear')).toBe(true);
    });

    it('retrieves factory profile by ID', async () => {
      const factory = await getFactoryById('fac-unit-knitwear');
      expect(factory).not.toBeNull();
      expect(factory?.name).toBe('Apex Composite Knitwear Ltd.');
      expect(factory?.status).toBe('audited');
      expect(factory?.specializations).toContain('Circular Knitwear');
    });

    it('creates and registers a new manufacturing unit', async () => {
      const created = await createFactory(
        {
          name: 'Dhaka Eco Weaving Mills',
          location: 'Tongi, Gazipur, Bangladesh',
          specializations: ['Twill Fabric', 'Poplin'],
          capacity: '500,000 meters / month',
          certificationIds: ['OEKO-TEX-100'],
          contactInformation: { contactPerson: 'Hassan Ali' },
          status: 'active',
        },
        { uid: 'staff-admin-001', role: 'Super Admin' }
      );

      expect(created.id).toBeDefined();
      expect(created.name).toBe('Dhaka Eco Weaving Mills');
    });
  });

  describe('5. User Management & Security Policy Enforcement', () => {
    it('retrieves user directory', async () => {
      const users = await getAllUsers();
      expect(users.length).toBeGreaterThanOrEqual(2);
      expect(users.some((u) => u.role === 'Super Admin')).toBe(true);
    });

    it('STRICT SECURITY GUARD: Prevents an actor from modifying their own role', async () => {
      await expect(
        updateUserRole('staff-admin-001', 'Buyer', {
          uid: 'staff-admin-001',
          role: 'Super Admin',
        })
      ).rejects.toThrow(/Self-role modification is strictly prohibited/i);
    });

    it('allows Super Admin to update another user role and status', async () => {
      const updated = await updateUserRole('merch-002', 'Operations Manager', {
        uid: 'staff-admin-001',
        role: 'Super Admin',
      });
      expect(updated?.role).toBe('Operations Manager');

      const statusUpdated = await updateUserStatus('merch-002', 'active', {
        uid: 'staff-admin-001',
        role: 'Super Admin',
      });
      expect(statusUpdated?.status).toBe('active');
    });

    it('provisions a new user with invited status', async () => {
      const invited = await inviteUser(
        {
          displayName: 'Rashidul Islam',
          email: 'rashid.merch@xyzbuyinghouse.com',
          role: 'Merchandiser',
        },
        { uid: 'staff-admin-001', role: 'Super Admin' }
      );

      expect(invited.uid).toBeDefined();
      expect(invited.status).toBe('invited');
      expect(invited.email).toBe('rashid.merch@xyzbuyinghouse.com');
    });
  });

  describe('6. Immutable Audit Trail Service', () => {
    it('fetches audit event logs', async () => {
      const logs = await fetchAuditLogs(10);
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs[0].action).toBeDefined();
      expect(logs[0].timestamp).toBeDefined();
    });

    it('records security audit event safely', async () => {
      await logSecurityEvent({
        actorUid: 'staff-admin-001',
        actorRole: 'Super Admin',
        action: 'AUTH_ACCOUNT_STATUS_CHANGE',
        entityId: 'test-entity-123',
        after: { status: 'active' },
      });

      const logs = await fetchAuditLogs(10);
      expect(logs.some((l) => l.entityId === 'test-entity-123')).toBe(true);
    });
  });
});
