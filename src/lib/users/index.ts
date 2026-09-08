import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  orderBy,
} from 'firebase/firestore';
import { db, isConfigured } from '@/lib/firebase/client';
import { User, UserRole, UserStatus } from '@/types/auth';
import { logSecurityEvent } from '@/lib/audit';

export const TEST_STAFF_USERS: User[] = [
  {
    uid: 'staff-admin-001',
    email: 'admin@xyzbuyinghouse.com',
    displayName: 'Rahim Chowdhury (Managing Director)',
    role: 'Super Admin',
    status: 'active',
    buyerOrganizationId: null,
    createdAt: '2025-10-01T08:00:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
    lastLoginAt: '2026-09-08T08:30:00Z',
  },
  {
    uid: 'staff-ops-001',
    email: 'ops.lead@xyzbuyinghouse.com',
    displayName: 'Farhana Yasmin (Head of Operations)',
    role: 'Operations Manager',
    status: 'active',
    buyerOrganizationId: null,
    createdAt: '2025-11-15T09:00:00Z',
    updatedAt: '2026-08-20T10:30:00Z',
    lastLoginAt: '2026-09-07T14:15:00Z',
  },
  {
    uid: 'merch-001',
    email: 'tarek.merch@xyzbuyinghouse.com',
    displayName: 'Tarek Mahmud (Senior Merchandiser)',
    role: 'Merchandiser',
    status: 'active',
    buyerOrganizationId: null,
    createdAt: '2025-12-01T08:30:00Z',
    updatedAt: '2026-09-05T11:00:00Z',
    lastLoginAt: '2026-09-08T07:45:00Z',
  },
  {
    uid: 'merch-002',
    email: 'nusrat.merch@xyzbuyinghouse.com',
    displayName: 'Nusrat Jahan (Knitwear Merchandiser)',
    role: 'Merchandiser',
    status: 'active',
    buyerOrganizationId: null,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-08-15T16:00:00Z',
    lastLoginAt: '2026-09-06T11:20:00Z',
  },
  {
    uid: 'qc-lead-001',
    email: 'qc.lead@xyzbuyinghouse.com',
    displayName: 'Al-Amin Hossain (Chief QA Auditor)',
    role: 'QC Staff',
    status: 'active',
    buyerOrganizationId: null,
    createdAt: '2025-11-20T08:00:00Z',
    updatedAt: '2026-09-04T12:00:00Z',
    lastLoginAt: '2026-09-07T16:00:00Z',
  },
  {
    uid: 'buyer-user-001',
    email: 'buyer@nordictrend.example',
    displayName: 'Astrid Lindholm',
    role: 'Buyer',
    status: 'active',
    buyerOrganizationId: 'buyer-org-001',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-08-10T14:30:00Z',
    lastLoginAt: '2026-09-07T09:00:00Z',
  },
];

let inMemoryUsers = [...TEST_STAFF_USERS];

export async function getAllUsers(): Promise<User[]> {
  if (isConfigured && db) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const results: User[] = [];
      snapshot.forEach((snap) => {
        results.push({ uid: snap.id, ...(snap.data() as Omit<User, 'uid'>) });
      });
      return results;
    } catch (error) {
      console.warn('[Firestore] Error fetching all users, attempting fallback:', error);
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const results: User[] = [];
        snapshot.forEach((snap) => {
          results.push({ uid: snap.id, ...(snap.data() as Omit<User, 'uid'>) });
        });
        return results;
      } catch (fallbackError) {
        console.error('[Firestore] Users fallback query failed:', fallbackError);
      }
    }
  }

  return inMemoryUsers;
}

export async function getUserById(uid: string): Promise<User | null> {
  if (!uid) return null;

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'users', uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { uid: snapshot.id, ...(snapshot.data() as Omit<User, 'uid'>) };
      }
      return null;
    } catch (error) {
      console.warn(`[Firestore] Error fetching user ${uid}:`, error);
    }
  }

  const found = inMemoryUsers.find((u) => u.uid === uid);
  return found || null;
}

export async function updateUserStatus(
  uid: string,
  newStatus: UserStatus,
  actor: { uid: string; role: string }
): Promise<User | null> {
  const existing = await getUserById(uid);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: User = {
    ...existing,
    status: newStatus,
    updatedAt: now,
  };

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: now,
      });
    } catch (error) {
      console.error(`[Firestore] Error updating user status ${uid}:`, error);
    }
  }

  inMemoryUsers = inMemoryUsers.map((u) => (u.uid === uid ? updated : u));

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'AUTH_ACCOUNT_STATUS_CHANGE',
    entityId: uid,
    before: { status: existing.status },
    after: { status: newStatus },
  });

  return updated;
}

export async function updateUserRole(
  uid: string,
  newRole: UserRole,
  actor: { uid: string; role: string }
): Promise<User | null> {
  // CRITICAL SECURITY RULE: Users cannot modify their own role
  if (actor.uid === uid) {
    throw new Error('Self-role modification is strictly prohibited by security policy.');
  }

  const existing = await getUserById(uid);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: User = {
    ...existing,
    role: newRole,
    updatedAt: now,
  };

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        role: newRole,
        updatedAt: now,
      });
    } catch (error) {
      console.error(`[Firestore] Error updating user role ${uid}:`, error);
    }
  }

  inMemoryUsers = inMemoryUsers.map((u) => (u.uid === uid ? updated : u));

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'AUTH_ROLE_CHANGE',
    entityId: uid,
    before: { role: existing.role },
    after: { role: newRole },
  });

  return updated;
}

export async function updateUserBuyerOrg(
  uid: string,
  buyerOrgId: string | null,
  actor: { uid: string; role: string }
): Promise<User | null> {
  const existing = await getUserById(uid);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: User = {
    ...existing,
    buyerOrganizationId: buyerOrgId,
    updatedAt: now,
  };

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        buyerOrganizationId: buyerOrgId,
        updatedAt: now,
      });
    } catch (error) {
      console.error(`[Firestore] Error updating user buyerOrganizationId ${uid}:`, error);
    }
  }

  inMemoryUsers = inMemoryUsers.map((u) => (u.uid === uid ? updated : u));

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'AUTH_ACCOUNT_STATUS_CHANGE',
    entityId: uid,
    before: { buyerOrganizationId: existing.buyerOrganizationId },
    after: { buyerOrganizationId: buyerOrgId },
  });

  return updated;
}

export async function inviteUser(
  data: {
    email: string;
    displayName: string;
    role: UserRole;
    buyerOrganizationId?: string | null;
  },
  actor: { uid: string; role: string }
): Promise<User> {
  const newUid = `user-inv-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const newUser: User = {
    uid: newUid,
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    status: 'invited',
    buyerOrganizationId: data.buyerOrganizationId || null,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  };

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'users', newUid);
      await setDoc(docRef, {
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
        status: newUser.status,
        buyerOrganizationId: newUser.buyerOrganizationId,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null,
      });
    } catch (error) {
      console.error('[Firestore] Error creating invited user:', error);
    }
  }

  inMemoryUsers.unshift(newUser);

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'AUTH_ACCOUNT_STATUS_CHANGE',
    entityId: newUid,
    after: { email: newUser.email, role: newUser.role, status: 'invited' },
  });

  return newUser;
}
