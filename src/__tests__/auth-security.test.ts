import { describe, it, expect } from 'vitest';
import {
  isAccountActive,
  isStaffRole,
  isBuyerRole,
  canAccessBuyerOrganization,
} from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { mapAuthError, requestPasswordReset } from '@/lib/firebase/auth';
import { User, UserRole } from '@/types/auth';

describe('Authentication & Security Foundation', () => {
  describe('Account Status Verification', () => {
    it('allows active accounts', () => {
      const activeUser: User = {
        uid: 'u1',
        email: 'active@client.com',
        displayName: 'Active User',
        role: 'Buyer',
        buyerOrganizationId: 'org-01',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(isAccountActive(activeUser)).toBe(true);
    });

    it('denies suspended and disabled accounts', () => {
      const suspendedUser: User = {
        uid: 'u2',
        email: 'suspended@client.com',
        displayName: 'Suspended User',
        role: 'Buyer',
        buyerOrganizationId: 'org-01',
        status: 'suspended',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const disabledUser: User = {
        ...suspendedUser,
        uid: 'u3',
        status: 'disabled',
      };

      expect(isAccountActive(suspendedUser)).toBe(false);
      expect(isAccountActive(disabledUser)).toBe(false);
      expect(isAccountActive(null)).toBe(false);
      expect(isAccountActive(undefined)).toBe(false);
    });
  });

  describe('Role Classification', () => {
    it('correctly identifies internal staff roles', () => {
      const staffRoles: UserRole[] = [
        'Super Admin',
        'Admin',
        'Operations Manager',
        'Merchandiser',
        'Production Staff',
        'QC Staff',
      ];

      staffRoles.forEach((role) => {
        expect(isStaffRole(role)).toBe(true);
        expect(isBuyerRole(role)).toBe(false);
      });
    });

    it('correctly identifies buyer role', () => {
      expect(isBuyerRole('Buyer')).toBe(true);
      expect(isStaffRole('Buyer')).toBe(false);
    });
  });

  describe('Buyer Organization Tenant Isolation', () => {
    const buyerA: User = {
      uid: 'buyer-a-uid',
      email: 'buyer@brand-a.com',
      displayName: 'Buyer Brand A',
      role: 'Buyer',
      buyerOrganizationId: 'org-brand-a',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const staffUser: User = {
      uid: 'staff-uid',
      email: 'merchandiser@xyz.com',
      displayName: 'Lead Merchandiser',
      role: 'Merchandiser',
      buyerOrganizationId: null,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('allows buyer to access ONLY their own organization records', () => {
      expect(canAccessBuyerOrganization(buyerA, 'org-brand-a')).toBe(true);
      expect(canAccessBuyerOrganization(buyerA, 'org-brand-b')).toBe(false);
      expect(canAccessBuyerOrganization(buyerA, 'org-unrelated')).toBe(false);
    });

    it('allows staff to access authorized organizations', () => {
      expect(canAccessBuyerOrganization(staffUser, 'org-brand-a')).toBe(true);
      expect(canAccessBuyerOrganization(staffUser, 'org-brand-b')).toBe(true);
    });

    it('denies inactive or disabled buyers even for their own organization', () => {
      const inactiveBuyer: User = {
        ...buyerA,
        status: 'disabled',
      };
      expect(canAccessBuyerOrganization(inactiveBuyer, 'org-brand-a')).toBe(false);
    });
  });

  describe('RBAC Permission Matrix', () => {
    it('grants Super Admin full permissions including audit logs and settings', () => {
      expect(hasPermission('Super Admin', 'auditLogs.read')).toBe(true);
      expect(hasPermission('Super Admin', 'settings.write')).toBe(true);
      expect(hasPermission('Super Admin', 'users.write')).toBe(true);
    });

    it('restricts Buyer from administrative and audit permissions', () => {
      expect(hasPermission('Buyer', 'auditLogs.read')).toBe(false);
      expect(hasPermission('Buyer', 'settings.write')).toBe(false);
      expect(hasPermission('Buyer', 'users.write')).toBe(false);
      expect(hasPermission('Buyer', 'orders.read')).toBe(true);
    });

    it('restricts Production Staff from viewing unrelated financial settings', () => {
      expect(hasPermission('Production Staff', 'settings.write')).toBe(false);
      expect(hasPermission('Production Staff', 'production.write')).toBe(true);
    });
  });

  describe('Password Reset Anti-Enumeration', () => {
    it('returns consistent user-facing message regardless of input to prevent email harvesting', async () => {
      const result = await requestPasswordReset('nonexistent-email@domain.com');
      expect(result.success).toBe(true);
      expect(result.message).toContain('If an account exists');
    });
  });

  describe('Error Sanitization & Mapping', () => {
    it('maps Firebase credential errors without leaking stack traces', () => {
      expect(mapAuthError({ code: 'auth/invalid-credential' })).toBe(
        'Invalid email address or password. Please verify your credentials.'
      );
      expect(mapAuthError({ code: 'auth/user-disabled' })).toBe(
        'This account has been deactivated. Please contact your XYZ Buying House representative.'
      );
      expect(mapAuthError({ code: 'auth/too-many-requests' })).toBe(
        'Too many unsuccessful attempts. Access is temporarily restricted for security. Please try again later.'
      );
      expect(mapAuthError(null)).toBe(
        'An unexpected authentication error occurred. Please try again.'
      );
    });
  });
});
