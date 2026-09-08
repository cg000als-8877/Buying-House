import { describe, it, expect } from 'vitest';
import { hasPermission } from '@/lib/auth/permissions';
import { canAccessBuyerOrganization } from '@/lib/auth/session';
import { User } from '@/types/auth';

describe('RBAC & Tenant Isolation Logic', () => {
  it('correctly checks Super Admin permissions', () => {
    expect(hasPermission('Super Admin', 'users.write')).toBe(true);
    expect(hasPermission('Super Admin', 'settings.write')).toBe(true);
    expect(hasPermission('Super Admin', 'auditLogs.read')).toBe(true);
  });

  it('restricts Buyer from administrative write operations', () => {
    expect(hasPermission('Buyer', 'orders.read')).toBe(true);
    expect(hasPermission('Buyer', 'samples.approve')).toBe(true);
    expect(hasPermission('Buyer', 'orders.write')).toBe(false);
    expect(hasPermission('Buyer', 'users.write')).toBe(false);
    expect(hasPermission('Buyer', 'settings.write')).toBe(false);
  });

  it('strictly enforces Buyer Data Isolation', () => {
    const buyerUser: User = {
      uid: 'u-1',
      email: 'buyer@brand-a.com',
      displayName: 'Buyer A',
      role: 'Buyer',
      buyerOrganizationId: 'org-brand-a',
      status: 'active',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    // Permitted to access own organization data
    expect(canAccessBuyerOrganization(buyerUser, 'org-brand-a')).toBe(true);

    // DENIED access to another buyer's organization data
    expect(canAccessBuyerOrganization(buyerUser, 'org-brand-b')).toBe(false);
  });

  it('denies access if account is disabled or suspended', () => {
    const disabledBuyer: User = {
      uid: 'u-2',
      email: 'disabled@brand-a.com',
      displayName: 'Disabled Buyer',
      role: 'Buyer',
      buyerOrganizationId: 'org-brand-a',
      status: 'disabled',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    expect(canAccessBuyerOrganization(disabledBuyer, 'org-brand-a')).toBe(false);
  });
});
