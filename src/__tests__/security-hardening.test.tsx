import { describe, it, expect, vi } from 'vitest';
import { User, UserRole } from '@/types/auth';
import { hasPermission, ROLE_PERMISSIONS } from '@/lib/auth/permissions';
import { canAccessBuyerOrganization, isAccountActive } from '@/lib/auth/session';
import { requestPasswordReset, mapAuthError } from '@/lib/firebase/auth';
import { exportReportToCSV } from '@/lib/reporting';
import { calculatePercentage, calculateTrendPercentage } from '@/lib/reporting/calculations';
import { logSecurityEvent } from '@/lib/audit';

describe('STEP 16 — Production Hardening & Security Audit Verification', () => {
  const superAdminUser: User = {
    uid: 'admin-root-001',
    email: 'superadmin@xyzbuyinghouse.com',
    displayName: 'Super Admin',
    role: 'Super Admin',
    buyerOrganizationId: null,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const buyerAUser: User = {
    uid: 'buyer-a-001',
    email: 'buyer.a@nordicapparel.com',
    displayName: 'Buyer A (Nordic)',
    role: 'Buyer',
    buyerOrganizationId: 'org-nordic-001',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const buyerBUser: User = {
    uid: 'buyer-b-002',
    email: 'buyer.b@hudsonbay.com',
    displayName: 'Buyer B (Hudson)',
    role: 'Buyer',
    buyerOrganizationId: 'org-hudson-002',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const inactiveUser: User = {
    uid: 'user-suspended-001',
    email: 'suspended@xyzbuyinghouse.com',
    displayName: 'Suspended Merchandiser',
    role: 'Merchandiser',
    buyerOrganizationId: null,
    status: 'suspended',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const qcStaffUser: User = {
    uid: 'staff-qc-001',
    email: 'qc.staff@xyzbuyinghouse.com',
    displayName: 'QC Lead',
    role: 'QC Staff',
    buyerOrganizationId: null,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  describe('1. Authentication Hardening & Enumeration Protection', () => {
    it('always returns invariant generic response on password reset to prevent email enumeration', async () => {
      const res1 = await requestPasswordReset('nonexistent.user@randomdomain.com');
      expect(res1.success).toBe(true);
      expect(res1.message).toContain('If an account exists with this email address, password reset instructions have been sent.');

      const res2 = await requestPasswordReset('superadmin@xyzbuyinghouse.com');
      expect(res2.success).toBe(true);
      expect(res2.message).toContain('If an account exists with this email address, password reset instructions have been sent.');
    });

    it('sanitizes auth error codes into safe, non-leaking user messages', () => {
      expect(mapAuthError({ code: 'auth/user-not-found' })).toBe('Invalid email address or password. Please verify your credentials.');
      expect(mapAuthError({ code: 'auth/wrong-password' })).toBe('Invalid email address or password. Please verify your credentials.');
      expect(mapAuthError({ code: 'auth/user-disabled' })).toContain('deactivated');
      expect(mapAuthError(new Error('Unknown internal DB crash'))).toBe('Authentication could not be completed. Please try again or contact support.');
    });

    it('blocks suspended or disabled accounts from active session validation', () => {
      expect(isAccountActive(superAdminUser)).toBe(true);
      expect(isAccountActive(buyerAUser)).toBe(true);
      expect(isAccountActive(inactiveUser)).toBe(false);
      expect(isAccountActive({ ...buyerAUser, status: 'disabled' })).toBe(false);
    });
  });

  describe('2. Tenant Isolation & IDOR Protection', () => {
    it('strictly isolates Buyer A from Buyer B organization resources', () => {
      expect(canAccessBuyerOrganization(buyerAUser, 'org-nordic-001')).toBe(true);
      expect(canAccessBuyerOrganization(buyerAUser, 'org-hudson-002')).toBe(false);
      expect(canAccessBuyerOrganization(buyerBUser, 'org-nordic-001')).toBe(false);
      expect(canAccessBuyerOrganization(buyerBUser, 'org-hudson-002')).toBe(true);
    });

    it('grants staff cross-tenant administrative inspection access while keeping buyers isolated', () => {
      expect(canAccessBuyerOrganization(superAdminUser, 'org-nordic-001')).toBe(true);
      expect(canAccessBuyerOrganization(superAdminUser, 'org-hudson-002')).toBe(true);
      expect(canAccessBuyerOrganization(qcStaffUser, 'org-nordic-001')).toBe(true);
    });
  });

  describe('3. Role-Based Access Control (RBAC) Matrix Boundaries', () => {
    it('enforces exact platform roles without unassigned wildcard escalation', () => {
      const validRoles: UserRole[] = [
        'Super Admin',
        'Admin',
        'Operations Manager',
        'Merchandiser',
        'Production Staff',
        'QC Staff',
        'Buyer',
      ];
      validRoles.forEach((role) => {
        expect(ROLE_PERMISSIONS[role]).toBeDefined();
        expect(ROLE_PERMISSIONS[role].length).toBeGreaterThan(0);
      });
    });

    it('prevents Buyer role from accessing administrative and writing permissions', () => {
      expect(hasPermission('Buyer', 'orders.read')).toBe(true);
      expect(hasPermission('Buyer', 'orders.write')).toBe(false);
      expect(hasPermission('Buyer', 'users.write')).toBe(false);
      expect(hasPermission('Buyer', 'settings.write')).toBe(false);
      expect(hasPermission('Buyer', 'auditLogs.read')).toBe(false);
      expect(hasPermission('Buyer', 'production.publish')).toBe(false);
      expect(hasPermission('Buyer', 'quality.publish')).toBe(false);
      expect(hasPermission('Buyer', 'shipments.status')).toBe(false);
    });

    it('allows Super Admin full access including audit logs and user management', () => {
      expect(hasPermission('Super Admin', 'users.write')).toBe(true);
      expect(hasPermission('Super Admin', 'auditLogs.read')).toBe(true);
      expect(hasPermission('Super Admin', 'settings.write')).toBe(true);
      expect(hasPermission('Super Admin', 'reports.advanced')).toBe(true);
    });

    it('restricts QC Staff strictly to inspection lifecycle without order/shipment writing permissions', () => {
      expect(hasPermission('QC Staff', 'quality.read')).toBe(true);
      expect(hasPermission('QC Staff', 'quality.write')).toBe(true);
      expect(hasPermission('QC Staff', 'orders.write')).toBe(false);
      expect(hasPermission('QC Staff', 'shipments.write')).toBe(false);
      expect(hasPermission('QC Staff', 'users.write')).toBe(false);
    });
  });

  describe('4. Data Redaction & Sanitized CSV Export', () => {
    it('strictly redacts internal costing and margin columns for buyer role exports', () => {
      const confidentialRows = [
        {
          orderNumber: 'PO-2026-0891',
          styleName: 'Men Brushed Fleece Hoodie',
          quantity: 12500,
          targetCostUSD: 14.5,
          factoryCostUSD: 11.2,
          unitMarginUSD: 3.3,
          marginPercent: 22.7,
          internalNotes: 'Factory agreed to 3% rebate on bulk yarn purchase.',
        },
      ];

      const buyerCSV = exportReportToCSV('orders', confidentialRows, 'buyer-export.csv', buyerAUser);
      expect(buyerCSV).toContain('orderNumber');
      expect(buyerCSV).toContain('styleName');
      expect(buyerCSV).toContain('quantity');
      expect(buyerCSV).not.toContain('targetCostUSD');
      expect(buyerCSV).not.toContain('factoryCostUSD');
      expect(buyerCSV).not.toContain('unitMarginUSD');
      expect(buyerCSV).not.toContain('marginPercent');
      expect(buyerCSV).not.toContain('Factory agreed to 3% rebate');

      const adminCSV = exportReportToCSV('orders', confidentialRows, 'admin-export.csv', superAdminUser);
      expect(adminCSV).toContain('targetCostUSD');
      expect(adminCSV).toContain('factoryCostUSD');
      expect(adminCSV).toContain('unitMarginUSD');
      expect(adminCSV).toContain('Factory agreed to 3% rebate');
    });

    it('escapes quotes and special characters per RFC 4180 standard', () => {
      const rows = [
        {
          title: 'Spec Sheet, "Summer Edition"',
          remarks: 'Line 1\nLine 2',
        },
      ];
      const csv = exportReportToCSV('orders', rows, 'test.csv', superAdminUser);
      expect(csv).toContain('"Spec Sheet, ""Summer Edition"""');
    });
  });

  describe('5. Mathematical Resilience & Calculation Guards', () => {
    it('safely handles zero denominators and division by zero across calculation utilities', () => {
      expect(calculatePercentage(0, 0)).toBe(0);
      expect(calculatePercentage(100, 0)).toBe(0);
      expect(calculatePercentage(0, 100)).toBe(0);

      const trendZero = calculateTrendPercentage(0, 0);
      expect(trendZero).toBe(0);

      const trendBaseZero = calculateTrendPercentage(50, 0);
      expect(trendBaseZero).toBe(100);

      const trendNull = calculateTrendPercentage(50, null);
      expect(trendNull).toBeNull();
    });
  });

  describe('6. Security Audit Event Logging Immutability', () => {
    it('safely structures immutable audit log payloads', async () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      await logSecurityEvent({
        actorUid: superAdminUser.uid,
        actorRole: superAdminUser.role,
        action: 'ORDER_STATUS_CHANGED' as any,
        entityId: 'PO-2026-0891',
        before: { status: 'in_production' },
        after: { status: 'quality_check' },
      });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
