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
import { BuyerOrganization } from '@/types/buyer';
import { logSecurityEvent } from '@/lib/audit';

export const TEST_BUYER_ORGS: BuyerOrganization[] = [
  {
    id: 'buyer-org-001',
    name: 'Nordic Trend House A/S',
    country: 'Denmark',
    website: 'https://example-nordic.com',
    contactEmail: 'sourcing@nordictrend.example',
    contactPhone: '+45 33 12 34 56',
    status: 'active',
    notes: 'Key European retail partner specializing in sustainable circular knitwear and organic basic collections.',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-08-10T14:30:00Z',
  },
  {
    id: 'buyer-org-002',
    name: 'Atlantic Apparel Group',
    country: 'United States',
    website: 'https://example-atlantic.com',
    contactEmail: 'production@atlanticapparel.example',
    contactPhone: '+1 212 555 0199',
    status: 'active',
    notes: 'North American multi-brand distributor focusing on heavyweight denim and washed utility trousers.',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-07-20T11:15:00Z',
  },
  {
    id: 'buyer-org-003',
    name: 'Continental Sportswear S.A.',
    country: 'Germany',
    website: 'https://example-continental.com',
    contactEmail: 'procurement@continentalsport.example',
    contactPhone: '+49 30 9876 5432',
    status: 'active',
    notes: 'Performance activewear and technical outerwear brand with strict OEKO-TEX 100 Class 1 certifications.',
    createdAt: '2026-03-10T09:30:00Z',
    updatedAt: '2026-08-25T09:30:00Z',
  },
  {
    id: 'buyer-org-004',
    name: 'Atelier Mode Paris',
    country: 'France',
    website: 'https://example-ateliermode.fr',
    contactEmail: 'sourcing@ateliermode.example',
    contactPhone: '+33 1 42 68 55 00',
    status: 'active',
    notes: 'Luxury contemporary pret-a-porter label producing organic cotton poplin shirting and tailored trousers.',
    createdAt: '2026-04-05T11:00:00Z',
    updatedAt: '2026-08-30T16:00:00Z',
  },
  {
    id: 'buyer-org-005',
    name: 'Pacific Rim Outfitters Ltd',
    country: 'Australia',
    website: 'https://example-pacificrim.com.au',
    contactEmail: 'logistics@pacificrim.example',
    contactPhone: '+61 2 9380 4400',
    status: 'active',
    notes: 'All-weather adventure apparel and durable canvas workwear with rapid sea freight turnarounds.',
    createdAt: '2026-05-12T07:45:00Z',
    updatedAt: '2026-09-01T10:20:00Z',
  },
  {
    id: 'buyer-org-006',
    name: 'Koto Lifestyle Tokyo',
    country: 'Japan',
    website: 'https://example-kotolifestyle.jp',
    contactEmail: 'orders@kotolifestyle.example',
    contactPhone: '+81 3 5555 8890',
    status: 'pending',
    notes: 'Minimalist Japanese lifestyle aesthetic brand currently evaluating prototype stitch samples and shrinkage metrics.',
    createdAt: '2026-08-15T08:00:00Z',
    updatedAt: '2026-09-02T13:45:00Z',
  },
];

let inMemoryBuyerOrgs = [...TEST_BUYER_ORGS];

export async function getBuyerOrganizations(): Promise<BuyerOrganization[]> {
  if (isConfigured && db) {
    try {
      const orgsRef = collection(db, 'buyerOrganizations');
      const q = query(orgsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const results: BuyerOrganization[] = [];
      snapshot.forEach((snap) => {
        results.push({ id: snap.id, ...(snap.data() as Omit<BuyerOrganization, 'id'>) });
      });
      return results;
    } catch (error) {
      console.warn('[Firestore] Error fetching buyer organizations, attempting fallback:', error);
      try {
        const orgsRef = collection(db, 'buyerOrganizations');
        const snapshot = await getDocs(orgsRef);
        const results: BuyerOrganization[] = [];
        snapshot.forEach((snap) => {
          results.push({ id: snap.id, ...(snap.data() as Omit<BuyerOrganization, 'id'>) });
        });
        return results;
      } catch (fallbackError) {
        console.error('[Firestore] Buyer organizations fallback query failed:', fallbackError);
      }
    }
  }

  return inMemoryBuyerOrgs;
}

export async function getBuyerOrganizationById(id: string): Promise<BuyerOrganization | null> {
  if (!id) return null;

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'buyerOrganizations', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...(snapshot.data() as Omit<BuyerOrganization, 'id'>) };
      }
      return null;
    } catch (error) {
      console.warn(`[Firestore] Error fetching buyer organization ${id}:`, error);
    }
  }

  const found = inMemoryBuyerOrgs.find((org) => org.id === id);
  return found || null;
}

export async function createBuyerOrganization(
  data: Omit<BuyerOrganization, 'id' | 'createdAt' | 'updatedAt'>,
  actor?: { uid: string; role: string }
): Promise<BuyerOrganization> {
  const newId = `buyer-org-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const newOrg: BuyerOrganization = {
    id: newId,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'buyerOrganizations', newId);
      await setDoc(docRef, {
        name: newOrg.name,
        country: newOrg.country,
        website: newOrg.website || null,
        contactEmail: newOrg.contactEmail,
        contactPhone: newOrg.contactPhone || null,
        status: newOrg.status,
        notes: newOrg.notes || null,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      console.error('[Firestore] Error creating buyer organization:', error);
    }
  }

  inMemoryBuyerOrgs.unshift(newOrg);

  if (actor) {
    await logSecurityEvent({
      actorUid: actor.uid,
      actorRole: actor.role,
      action: 'AUTH_ACCOUNT_STATUS_CHANGE',
      entityId: newId,
      after: { name: newOrg.name, status: newOrg.status, country: newOrg.country },
    });
  }

  return newOrg;
}

export async function updateBuyerOrganization(
  id: string,
  data: Partial<Omit<BuyerOrganization, 'id' | 'createdAt'>>,
  actor?: { uid: string; role: string }
): Promise<BuyerOrganization | null> {
  const existing = await getBuyerOrganizationById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: BuyerOrganization = {
    ...existing,
    ...data,
    updatedAt: now,
  };

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'buyerOrganizations', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: now,
      });
    } catch (error) {
      console.error(`[Firestore] Error updating buyer organization ${id}:`, error);
    }
  }

  inMemoryBuyerOrgs = inMemoryBuyerOrgs.map((org) => (org.id === id ? updated : org));

  if (actor) {
    await logSecurityEvent({
      actorUid: actor.uid,
      actorRole: actor.role,
      action: 'AUTH_ACCOUNT_STATUS_CHANGE',
      entityId: id,
      before: { name: existing.name, status: existing.status },
      after: { name: updated.name, status: updated.status },
    });
  }

  return updated;
}
