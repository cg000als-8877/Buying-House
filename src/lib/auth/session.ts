import { User, UserRole } from '@/types/auth';

export function isAccountActive(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.status === 'active';
}

export function isStaffRole(role: UserRole | undefined): boolean {
  if (!role) return false;
  return ['Super Admin', 'Admin', 'Operations Manager', 'Merchandiser', 'Production Staff', 'QC Staff'].includes(
    role
  );
}

export function isBuyerRole(role: UserRole | undefined): boolean {
  return role === 'Buyer';
}

/**
 * Enforces Tenant / Buyer Data Isolation.
 * Staff can access all authorized buyer orgs.
 * Buyers can strictly access ONLY their assigned organization.
 */
export function canAccessBuyerOrganization(
  user: User | null | undefined,
  targetBuyerOrgId: string
): boolean {
  if (!user || !isAccountActive(user)) return false;

  if (isStaffRole(user.role)) {
    return true;
  }

  if (isBuyerRole(user.role)) {
    return Boolean(user.buyerOrganizationId && user.buyerOrganizationId === targetBuyerOrgId);
  }

  return false;
}
