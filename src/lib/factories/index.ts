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
import { Factory } from '@/types/factory';
import { logSecurityEvent } from '@/lib/audit';

export const TEST_FACTORIES: Factory[] = [
  {
    id: 'fac-unit-knitwear',
    name: 'Apex Composite Knitwear Ltd.',
    location: 'Gazipur, Dhaka Division, Bangladesh',
    specializations: ['Circular Knitwear', 'Single Jersey', 'Heavy Fleece', 'Organic Cotton'],
    capacity: '1,200,000 pcs / month',
    employeeCount: 3400,
    certificationIds: ['GOTS-ORGANIC', 'OEKO-TEX-100', 'WRAP-GOLD', 'SEDEX-SMETA'],
    contactInformation: {
      contactPerson: 'Md. Tariqul Islam (GM Operations)',
      email: 'operations@apexknit.example',
      phone: '+880 2 9876543',
    },
    status: 'audited',
    internalNotes: 'Tier-1 partner for premium cotton t-shirts and hoodies. Strict AQL 1.5 compliance record with 99.2% on-time dispatch rate.',
    createdAt: '2025-11-10T08:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'fac-unit-woven',
    name: 'Crown Woven Textiles & Apparels',
    location: 'Ashulia, Savar, Dhaka, Bangladesh',
    specializations: ['Woven Bottoms', 'Chinos & Trousers', 'Utility Overshirts', 'Linen Blends'],
    capacity: '650,000 pcs / month',
    employeeCount: 2100,
    certificationIds: ['ISO-9001', 'BSCI-AUDITED', 'OEKO-TEX-100'],
    contactInformation: {
      contactPerson: 'Kamal Hossain (Production Head)',
      email: 'production@crownwoven.example',
      phone: '+880 2 8765432',
    },
    status: 'active',
    internalNotes: 'Equipped with automatic spreading and computerized welt pocket setting machines. Best suited for structured trousers and garment-dyed outerwear.',
    createdAt: '2025-12-01T09:00:00Z',
    updatedAt: '2026-07-28T14:20:00Z',
  },
  {
    id: 'fac-unit-denim',
    name: 'Horizon Denim Mills & Washing Plant',
    location: 'Valuka, Mymensingh, Bangladesh',
    specializations: ['Denim Jeans', 'Indigo Washes', 'Laser Distressing', 'Ozone Sustainable Washing'],
    capacity: '800,000 pcs / month',
    employeeCount: 2800,
    certificationIds: ['WRAP-GOLD', 'ZDHC-LEVEL-3', 'HIGG-INDEX-FEM', 'OEKO-TEX-100'],
    contactInformation: {
      contactPerson: 'Sharif Ahmed (Washing & QA Director)',
      email: 'sharif@horizondenim.example',
      phone: '+880 2 7654321',
    },
    status: 'audited',
    internalNotes: 'Advanced sustainable laundry facility featuring Jeanologia laser cutting and E-Flow nano-bubble softeners with 70% water savings.',
    createdAt: '2026-01-20T11:00:00Z',
    updatedAt: '2026-08-30T16:45:00Z',
  },
];

let inMemoryFactories = [...TEST_FACTORIES];

export async function getFactories(): Promise<Factory[]> {
  if (isConfigured && db) {
    try {
      const facRef = collection(db, 'factories');
      const q = query(facRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const results: Factory[] = [];
      snapshot.forEach((snap) => {
        results.push({ id: snap.id, ...(snap.data() as Omit<Factory, 'id'>) });
      });
      return results;
    } catch (error) {
      console.warn('[Firestore] Error fetching factories, attempting fallback:', error);
      try {
        const facRef = collection(db, 'factories');
        const snapshot = await getDocs(facRef);
        const results: Factory[] = [];
        snapshot.forEach((snap) => {
          results.push({ id: snap.id, ...(snap.data() as Omit<Factory, 'id'>) });
        });
        return results;
      } catch (fallbackError) {
        console.error('[Firestore] Factories fallback query failed:', fallbackError);
      }
    }
  }

  return inMemoryFactories;
}

export async function getFactoryById(factoryId: string): Promise<Factory | null> {
  if (!factoryId) return null;

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'factories', factoryId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...(snapshot.data() as Omit<Factory, 'id'>) };
      }
      return null;
    } catch (error) {
      console.warn(`[Firestore] Error fetching factory ${factoryId}:`, error);
    }
  }

  const found = inMemoryFactories.find((f) => f.id === factoryId);
  return found || null;
}

export async function createFactory(
  data: Omit<Factory, 'id' | 'createdAt' | 'updatedAt'>,
  actor?: { uid: string; role: string }
): Promise<Factory> {
  const newId = `fac-unit-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const newFactory: Factory = {
    id: newId,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'factories', newId);
      await setDoc(docRef, {
        name: newFactory.name,
        location: newFactory.location,
        specializations: newFactory.specializations,
        capacity: newFactory.capacity,
        employeeCount: newFactory.employeeCount || null,
        certificationIds: newFactory.certificationIds,
        contactInformation: newFactory.contactInformation,
        status: newFactory.status,
        internalNotes: newFactory.internalNotes || null,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      console.error('[Firestore] Error creating factory:', error);
    }
  }

  inMemoryFactories.unshift(newFactory);

  if (actor) {
    await logSecurityEvent({
      actorUid: actor.uid,
      actorRole: actor.role,
      action: 'AUTH_ACCOUNT_STATUS_CHANGE',
      entityId: newId,
      after: { name: newFactory.name, status: newFactory.status },
    });
  }

  return newFactory;
}

export async function updateFactory(
  factoryId: string,
  data: Partial<Omit<Factory, 'id' | 'createdAt'>>,
  actor?: { uid: string; role: string }
): Promise<Factory | null> {
  const existing = await getFactoryById(factoryId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: Factory = {
    ...existing,
    ...data,
    updatedAt: now,
  };

  if (isConfigured && db) {
    try {
      const docRef = doc(db, 'factories', factoryId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: now,
      });
    } catch (error) {
      console.error(`[Firestore] Error updating factory ${factoryId}:`, error);
    }
  }

  inMemoryFactories = inMemoryFactories.map((f) => (f.id === factoryId ? updated : f));

  if (actor) {
    await logSecurityEvent({
      actorUid: actor.uid,
      actorRole: actor.role,
      action: 'AUTH_ACCOUNT_STATUS_CHANGE',
      entityId: factoryId,
      before: { name: existing.name, status: existing.status },
      after: { name: updated.name, status: updated.status },
    });
  }

  return updated;
}
