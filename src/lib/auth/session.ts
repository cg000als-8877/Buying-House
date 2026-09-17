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
 * Normalizes buyer organization IDs and slugs across development and production formats.
 * e.g., 'org-nordic' <-> 'buyer-org-001'
 */
export function normalizeBuyerOrgId(id: string | null | undefined): string {
  if (!id) return 'buyer-org-001';
  const clean = id.trim().toLowerCase();
  const map: Record<string, string> = {
    'org-nordic': 'buyer-org-001',
    'nordic': 'buyer-org-001',
    'buyer-org-001': 'buyer-org-001',
    'org-atlantic': 'buyer-org-002',
    'atlantic': 'buyer-org-002',
    'buyer-org-002': 'buyer-org-002',
    'org-continental': 'buyer-org-003',
    'continental': 'buyer-org-003',
    'buyer-org-003': 'buyer-org-003',
    'org-atelier': 'buyer-org-004',
    'atelier': 'buyer-org-004',
    'buyer-org-004': 'buyer-org-004',
    'org-pacific': 'buyer-org-005',
    'pacific': 'buyer-org-005',
    'buyer-org-005': 'buyer-org-005',
    'org-koto': 'buyer-org-006',
    'koto': 'buyer-org-006',
    'buyer-org-006': 'buyer-org-006',
  };
  return map[clean] || id;
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
    if (!user.buyerOrganizationId) return false;
    return normalizeBuyerOrgId(user.buyerOrganizationId) === normalizeBuyerOrgId(targetBuyerOrgId);
  }

  return false;
}

