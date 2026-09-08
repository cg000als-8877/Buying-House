import {
  Shipment,
  PackingItem,
  ShipmentEvent,
  ShipmentDocumentChecklistItem,
  ShipmentStatus,
  ShipmentReadiness,
  ShipmentSummaryMetrics,
  TransportMode,
} from '@/types/shipment';
import { db, isConfigured } from '@/lib/firebase/client';
import { collection, getDocs, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { logSecurityEvent } from '@/lib/audit';
import { hasPermission } from '@/lib/auth/permissions';
import { UserRole } from '@/types/auth';
import {
  CreateShipmentInput,
  UpdateShipmentInput,
  UpdateShipmentStatusInput,
  PackingItemInput,
  DeliveryConfirmationInput,
  ShipmentEventInput,
  ShipmentDocumentChecklistInput,
  createShipmentSchema,
  updateShipmentSchema,
  updateShipmentStatusSchema,
  packingItemSchema,
  deliveryConfirmationSchema,
  shipmentEventSchema,
  isValidShipmentStatusTransition,
} from '@/lib/validation/shipment.schema';
import {
  calculateCartonCBM,
  calculateItemTotalCBM,
  calculatePackingSummary,
  detectShipmentDelayStatus,
} from './calculations';
import { getInspectionsForOrder } from '@/lib/quality';
import { getOrderById } from '@/lib/orders';

export const TEST_SHIPMENTS: Shipment[] = [
  {
    id: 'ship-001',
    shipmentNumber: 'SHP-2026-0081',
    orderId: 'TEST-ORDER-001',
    orderNumber: 'PO-2026-0881',
    buyerOrganizationId: 'buyer-org-001',
    buyerOrganizationName: 'Nordic Retail Group ApS',
    destinationCountry: 'Germany',
    destinationPort: 'Hamburg Port (DEHAM)',
    portOfLoading: 'Chittagong Port (BDCGP)',
    transportMode: 'SEA_FCL',
    incoterm: 'FOB',
    carrier: 'Hapag-Lloyd',
    forwarder: 'Kuehne+Nagel Logistics Bangladesh Ltd.',
    vesselFlightNumber: 'MV Express Berlin',
    voyageNumber: 'EB-2026-09',
    containerNumber: 'HLXU-892147-3',
    sealNumber: 'SL-99412',
    billOfLadingNumber: 'HLCUBSC26090123',
    bookingReference: 'BK-KN-2026-8841',
    trackingReference: 'HL-TRK-7782109',
    status: 'IN_TRANSIT',
    packingStatus: 'COMPLETED',
    documentationStatus: 'COMPLETED',
    customsStatus: 'CLEARED',
    plannedShipDate: '2026-09-04',
    actualShipDate: '2026-09-04',
    estimatedDeliveryDate: '2026-09-28',
    totalCartons: 250,
    totalPieces: 12500,
    totalGrossWeightKG: 3125.0,
    totalNetWeightKG: 2950.0,
    totalCBM: 18.0,
    delayStatus: 'ON_TIME',
    internalNotes: 'FCL 20ft container stuffed at Summit Alliance Port East CFS. Cleared Chittagong Customs under Export Bill #EXP-8812.',
    createdAt: '2026-08-25T10:00:00Z',
    updatedAt: '2026-09-04T15:00:00Z',
  },
  {
    id: 'ship-002',
    shipmentNumber: 'SHP-2026-0082',
    orderId: 'TEST-ORDER-003',
    orderNumber: 'PO-2026-0742',
    buyerOrganizationId: 'buyer-org-001',
    buyerOrganizationName: 'Nordic Retail Group ApS',
    destinationCountry: 'Denmark',
    destinationPort: 'Copenhagen Port (DKCPH)',
    portOfLoading: 'Chittagong Port (BDCGP)',
    transportMode: 'SEA_FCL',
    incoterm: 'FOB',
    carrier: 'Maersk Line',
    forwarder: 'DSV Air & Sea Ltd.',
    bookingReference: 'BK-DSV-9912',
    trackingReference: 'MSK-9901428',
    status: 'READY_TO_SHIP',
    packingStatus: 'COMPLETED',
    documentationStatus: 'VERIFIED',
    customsStatus: 'NOT_SUBMITTED',
    plannedShipDate: '2026-09-12',
    estimatedDeliveryDate: '2026-10-06',
    totalCartons: 170,
    totalPieces: 8500,
    totalGrossWeightKG: 4675.0,
    totalNetWeightKG: 4420.0,
    totalCBM: 22.1,
    delayStatus: 'ON_TIME',
    internalNotes: 'Goods staged at Warehouse Bay 4. Awaiting vessel berthing confirmation.',
    createdAt: '2026-08-28T11:30:00Z',
    updatedAt: '2026-09-07T09:00:00Z',
  },
  {
    id: 'ship-003',
    shipmentNumber: 'SHP-2026-0083',
    orderId: 'TEST-ORDER-004',
    orderNumber: 'PO-2026-0610',
    buyerOrganizationId: 'buyer-org-002',
    buyerOrganizationName: 'Urban Outfitters Europe BV',
    destinationCountry: 'Netherlands',
    destinationPort: 'Rotterdam (NLRTM)',
    portOfLoading: 'Chittagong Port (BDCGP)',
    transportMode: 'SEA_FCL',
    incoterm: 'FOB',
    carrier: 'CMA CGM',
    forwarder: 'DHL Global Forwarding Bangladesh',
    vesselFlightNumber: 'CMA CGM Antoine de Saint Exupery',
    voyageNumber: 'FL-4401',
    containerNumber: 'CMAU-551029-8',
    sealNumber: 'SL-88190',
    billOfLadingNumber: 'CMAU-DH-991204',
    bookingReference: 'BK-DHL-5501',
    trackingReference: 'DHL-OCN-661209',
    status: 'DELIVERED',
    packingStatus: 'COMPLETED',
    documentationStatus: 'COMPLETED',
    customsStatus: 'CLEARED',
    plannedShipDate: '2026-08-15',
    actualShipDate: '2026-08-15',
    estimatedDeliveryDate: '2026-09-05',
    actualDeliveryDate: '2026-09-05',
    totalCartons: 140,
    totalPieces: 4200,
    totalGrossWeightKG: 3780.0,
    totalNetWeightKG: 3500.0,
    totalCBM: 25.2,
    delayStatus: 'ON_TIME',
    deliveryConfirmation: {
      confirmed: true,
      confirmedAt: '2026-09-05T14:30:00Z',
      confirmedByUid: 'buyer-002',
      confirmedByName: 'Lars van der Meer',
      receivedQuantity: 4200,
      discrepancyReported: false,
      conditionNotes: 'All 140 cartons received in pristine condition at Rotterdam Distribution Center.',
      buyerSignatureName: 'Lars van der Meer (Logistics Director)',
    },
    internalNotes: 'Consignment successfully handed over to consignee with zero transit damage.',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-09-05T15:00:00Z',
  },
];

export const TEST_PACKING_ITEMS: PackingItem[] = [
  {
    id: 'pack-001',
    shipmentId: 'ship-001',
    orderId: 'TEST-ORDER-001',
    cartonNumberStart: 1,
    cartonNumberEnd: 100,
    totalCartons: 100,
    styleNumber: 'STY-KNIT-402',
    color: 'Navy Blue',
    sizeBreakdown: { S: 10, M: 20, L: 15, XL: 5 },
    piecesPerCarton: 50,
    totalPieces: 5000,
    lengthCM: 60,
    widthCM: 40,
    heightCM: 30,
    singleCartonCBM: 0.072,
    totalCBM: 7.2,
    grossWeightKG: 1250.0,
    netWeightKG: 1180.0,
    barcode: '890123456701',
    notes: 'Solid Color Solid Size Assortment A',
    createdAt: '2026-08-26T10:00:00Z',
    updatedAt: '2026-08-26T10:00:00Z',
  },
  {
    id: 'pack-002',
    shipmentId: 'ship-001',
    orderId: 'TEST-ORDER-001',
    cartonNumberStart: 101,
    cartonNumberEnd: 250,
    totalCartons: 150,
    styleNumber: 'STY-KNIT-402',
    color: 'Heather Grey',
    sizeBreakdown: { S: 10, M: 20, L: 15, XL: 5 },
    piecesPerCarton: 50,
    totalPieces: 7500,
    lengthCM: 60,
    widthCM: 40,
    heightCM: 30,
    singleCartonCBM: 0.072,
    totalCBM: 10.8,
    grossWeightKG: 1875.0,
    netWeightKG: 1770.0,
    barcode: '890123456702',
    notes: 'Solid Color Solid Size Assortment B',
    createdAt: '2026-08-26T10:30:00Z',
    updatedAt: '2026-08-26T10:30:00Z',
  },
  {
    id: 'pack-003',
    shipmentId: 'ship-002',
    orderId: 'TEST-ORDER-003',
    cartonNumberStart: 1,
    cartonNumberEnd: 170,
    totalCartons: 170,
    styleNumber: 'STY-DNM-508',
    color: 'Vintage Indigo',
    sizeBreakdown: { '30': 10, '32': 15, '34': 15, '36': 10 },
    piecesPerCarton: 50,
    totalPieces: 8500,
    lengthCM: 65,
    widthCM: 45,
    heightCM: 40,
    singleCartonCBM: 0.117,
    totalCBM: 22.1,
    grossWeightKG: 4675.0,
    netWeightKG: 4420.0,
    barcode: '890123456801',
    notes: 'Heavyweight denim packed with silica gel desiccants in master cartons.',
    createdAt: '2026-08-29T11:00:00Z',
    updatedAt: '2026-08-29T11:00:00Z',
  },
  {
    id: 'pack-004',
    shipmentId: 'ship-003',
    orderId: 'TEST-ORDER-004',
    cartonNumberStart: 1,
    cartonNumberEnd: 140,
    totalCartons: 140,
    styleNumber: 'STY-JKT-110',
    color: 'Tobacco Brown',
    sizeBreakdown: { S: 5, M: 12, L: 10, XL: 3 },
    piecesPerCarton: 30,
    totalPieces: 4200,
    lengthCM: 70,
    widthCM: 50,
    heightCM: 45,
    singleCartonCBM: 0.1575,
    totalCBM: 25.2,
    grossWeightKG: 3780.0,
    netWeightKG: 3500.0,
    barcode: '890123456901',
    notes: 'Jacket garments packed on molded hangers in flat-pack export cartons.',
    createdAt: '2026-08-02T10:00:00Z',
    updatedAt: '2026-08-02T10:00:00Z',
  },
];

export const TEST_SHIPMENT_EVENTS: ShipmentEvent[] = [
  {
    id: 'evt-001',
    shipmentId: 'ship-001',
    title: 'Booking Confirmed with Hapag-Lloyd',
    location: 'Chittagong, Bangladesh',
    timestamp: '2026-08-25T11:00:00Z',
    status: 'BOOKED',
    description: 'Vessel space allocated on MV Express Berlin Voy EB-2026-09 for 1x20ft FCL container.',
    createdByUid: 'staff-merch-001',
    createdByName: 'Tanvir Ahmed',
    isMilestone: true,
  },
  {
    id: 'evt-002',
    shipmentId: 'ship-001',
    title: 'Container Stuffed & Custom Sealed',
    location: 'Summit Alliance Port East CFS, Chittagong',
    timestamp: '2026-09-03T16:00:00Z',
    status: 'READY_TO_SHIP',
    description: '250 cartons verified against packing list. Container HLXU-892147-3 sealed with #SL-99412.',
    createdByUid: 'staff-admin-001',
    createdByName: 'Admin Operations',
    isMilestone: true,
  },
  {
    id: 'evt-003',
    shipmentId: 'ship-001',
    title: 'Vessel Departed Chittagong Port',
    location: 'Port of Chittagong (BDCGP)',
    timestamp: '2026-09-04T14:30:00Z',
    status: 'IN_TRANSIT',
    description: 'MV Express Berlin set sail for transshipment hub at Port of Singapore.',
    createdByUid: 'staff-merch-001',
    createdByName: 'Tanvir Ahmed',
    isMilestone: true,
  },
  {
    id: 'evt-004',
    shipmentId: 'ship-001',
    title: 'Transshipment at Port of Singapore',
    location: 'PSA Singapore Terminal',
    timestamp: '2026-09-08T06:00:00Z',
    status: 'IN_TRANSIT',
    description: 'Container discharged from feeder vessel and loaded onto mother vessel bound for Hamburg.',
    createdByUid: 'staff-merch-001',
    createdByName: 'Tanvir Ahmed',
    isMilestone: false,
  },
  {
    id: 'evt-005',
    shipmentId: 'ship-003',
    title: 'Vessel Departed Chittagong',
    location: 'Port of Chittagong (BDCGP)',
    timestamp: '2026-08-15T12:00:00Z',
    status: 'IN_TRANSIT',
    description: 'Vessel departed as scheduled on August 15.',
    createdByUid: 'staff-merch-002',
    createdByName: 'Farhana Yasmin',
    isMilestone: true,
  },
  {
    id: 'evt-006',
    shipmentId: 'ship-003',
    title: 'Arrived at Port of Rotterdam',
    location: 'Port of Rotterdam (NLRTM)',
    timestamp: '2026-09-04T08:00:00Z',
    status: 'ARRIVED_AT_PORT',
    description: 'Container safely discharged from vessel and queued for EU import customs inspection.',
    createdByUid: 'staff-merch-002',
    createdByName: 'Farhana Yasmin',
    isMilestone: true,
  },
  {
    id: 'evt-007',
    shipmentId: 'ship-003',
    title: 'Customs Cleared & Delivered to Buyer Warehouse',
    location: 'Rotterdam Distribution Center, Netherlands',
    timestamp: '2026-09-05T14:30:00Z',
    status: 'DELIVERED',
    description: 'Final delivery completed and received by Lars van der Meer.',
    createdByUid: 'buyer-002',
    createdByName: 'Lars van der Meer',
    isMilestone: true,
  },
];

export const TEST_DOCUMENT_CHECKLISTS: ShipmentDocumentChecklistItem[] = [
  {
    id: 'doc-chk-001',
    shipmentId: 'ship-001',
    documentType: 'COMMERCIAL_INVOICE',
    documentName: 'Commercial Invoice (CI-2026-0881)',
    required: true,
    status: 'VERIFIED',
    fileName: 'Commercial_Invoice_PO8801.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2026-09-03T10:00:00Z',
    uploadedByUid: 'staff-merch-001',
    verifiedAt: '2026-09-03T11:00:00Z',
    verifiedByUid: 'staff-admin-001',
    notes: 'Certified by BGMEA & Chamber of Commerce.',
  },
  {
    id: 'doc-chk-002',
    shipmentId: 'ship-001',
    documentType: 'PACKING_LIST',
    documentName: 'Detailed Export Packing List',
    required: true,
    status: 'VERIFIED',
    fileName: 'Export_Packing_List_PO8801.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2026-09-03T10:00:00Z',
    uploadedByUid: 'staff-merch-001',
    verifiedAt: '2026-09-03T11:00:00Z',
    verifiedByUid: 'staff-admin-001',
    notes: 'Includes carton-by-carton breakdown and weight telemetry.',
  },
  {
    id: 'doc-chk-003',
    shipmentId: 'ship-001',
    documentType: 'BILL_OF_LADING',
    documentName: 'Original Bill of Lading (3/3 Sets)',
    required: true,
    status: 'VERIFIED',
    fileName: 'Bill_of_Lading_HLCUBSC26090123.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2026-09-04T16:00:00Z',
    uploadedByUid: 'staff-merch-001',
    verifiedAt: '2026-09-04T16:30:00Z',
    verifiedByUid: 'staff-admin-001',
  },
  {
    id: 'doc-chk-004',
    shipmentId: 'ship-001',
    documentType: 'CERTIFICATE_OF_ORIGIN',
    documentName: 'Certificate of Origin (Form A / REX)',
    required: true,
    status: 'VERIFIED',
    fileName: 'Certificate_of_Origin_REX_PO8801.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2026-09-03T14:00:00Z',
    uploadedByUid: 'staff-merch-001',
    verifiedAt: '2026-09-03T15:00:00Z',
    verifiedByUid: 'staff-admin-001',
  },
  {
    id: 'doc-chk-005',
    shipmentId: 'ship-001',
    documentType: 'INSPECTION_CERTIFICATE',
    documentName: 'Final Inspection Certificate (FRI AQL Pass)',
    required: true,
    status: 'VERIFIED',
    fileName: 'Quality_FRI_Certificate_PO8801.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2026-09-02T16:00:00Z',
    uploadedByUid: 'staff-qc-001',
    verifiedAt: '2026-09-02T17:00:00Z',
    verifiedByUid: 'staff-admin-001',
  },
  {
    id: 'doc-chk-006',
    shipmentId: 'ship-002',
    documentType: 'COMMERCIAL_INVOICE',
    documentName: 'Commercial Invoice (CI-2026-0742)',
    required: true,
    status: 'VERIFIED',
    fileName: 'Commercial_Invoice_PO742.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2026-09-06T11:00:00Z',
    uploadedByUid: 'staff-merch-001',
    verifiedAt: '2026-09-06T12:00:00Z',
    verifiedByUid: 'staff-admin-001',
  },
  {
    id: 'doc-chk-007',
    shipmentId: 'ship-002',
    documentType: 'PACKING_LIST',
    documentName: 'Export Packing List',
    required: true,
    status: 'VERIFIED',
    fileName: 'Export_Packing_List_PO742.pdf',
    fileUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    uploadedAt: '2026-09-06T11:00:00Z',
    uploadedByUid: 'staff-merch-001',
    verifiedAt: '2026-09-06T12:00:00Z',
    verifiedByUid: 'staff-admin-001',
  },
  {
    id: 'doc-chk-008',
    shipmentId: 'ship-002',
    documentType: 'BILL_OF_LADING',
    documentName: 'Draft Bill of Lading (DSV)',
    required: true,
    status: 'DRAFTED',
    notes: 'Draft shared with buyer freight department for review.',
  },
];

let inMemoryShipments = [...TEST_SHIPMENTS];
let inMemoryPackingItems = [...TEST_PACKING_ITEMS];
let inMemoryEvents = [...TEST_SHIPMENT_EVENTS];
let inMemoryChecklists = [...TEST_DOCUMENT_CHECKLISTS];

/**
 * Resets in-memory shipment store (primarily for unit test isolation).
 */
export function resetInMemoryShipmentStore(): void {
  inMemoryShipments = [...TEST_SHIPMENTS];
  inMemoryPackingItems = [...TEST_PACKING_ITEMS];
  inMemoryEvents = [...TEST_SHIPMENT_EVENTS];
  inMemoryChecklists = [...TEST_DOCUMENT_CHECKLISTS];
}

export interface ShipmentFilters {
  status?: ShipmentStatus | 'ALL';
  buyerOrganizationId?: string | 'ALL';
  transportMode?: TransportMode | 'ALL';
  search?: string;
}

/**
 * Retrieves all shipments for internal operations with filtering.
 */
export async function getShipmentsForAdmin(filters?: ShipmentFilters): Promise<Shipment[]> {
  let results = [...inMemoryShipments];

  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'shipments'));
      if (!snap.empty) {
        results = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
          } as Shipment;
        });
      }
    } catch (err) {
      console.warn('[Firestore] Error reading shipments, falling back to local memory:', err);
    }
  }

  // Update dynamic delay status
  results = results.map((s) => ({
    ...s,
    delayStatus: detectShipmentDelayStatus(
      s.status,
      s.plannedShipDate,
      s.actualShipDate,
      s.estimatedDeliveryDate,
      s.actualDeliveryDate
    ),
  }));

  if (filters) {
    if (filters.status && filters.status !== 'ALL') {
      results = results.filter((s) => s.status === filters.status);
    }
    if (filters.buyerOrganizationId && filters.buyerOrganizationId !== 'ALL') {
      results = results.filter((s) => s.buyerOrganizationId === filters.buyerOrganizationId);
    }
    if (filters.transportMode && filters.transportMode !== 'ALL') {
      results = results.filter((s) => s.transportMode === filters.transportMode);
    }
    if (filters.search?.trim()) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (s) =>
          s.shipmentNumber.toLowerCase().includes(q) ||
          s.orderNumber.toLowerCase().includes(q) ||
          s.carrier.toLowerCase().includes(q) ||
          s.forwarder.toLowerCase().includes(q) ||
          (s.containerNumber || '').toLowerCase().includes(q) ||
          (s.billOfLadingNumber || '').toLowerCase().includes(q) ||
          (s.trackingReference || '').toLowerCase().includes(q) ||
          s.destinationPort.toLowerCase().includes(q) ||
          s.destinationCountry.toLowerCase().includes(q)
      );
    }
  }

  return results.sort(
    (a, b) => new Date(b.plannedShipDate).getTime() - new Date(a.plannedShipDate).getTime()
  );
}

/**
 * Retrieves shipments strictly isolated to an authenticated Buyer Organization.
 * Enforces tenant boundary and redacts internal operational notes.
 */
export async function getShipmentsForBuyer(
  buyerOrganizationId: string,
  filters?: {
    status?: ShipmentStatus | 'ALL';
    search?: string;
  }
): Promise<Shipment[]> {
  if (!buyerOrganizationId) return [];

  const all = await getShipmentsForAdmin();
  let buyerShipments = all.filter((s) => s.buyerOrganizationId === buyerOrganizationId);

  if (filters) {
    if (filters.status && filters.status !== 'ALL') {
      buyerShipments = buyerShipments.filter((s) => s.status === filters.status);
    }
    if (filters.search?.trim()) {
      const q = filters.search.toLowerCase();
      buyerShipments = buyerShipments.filter(
        (s) =>
          s.shipmentNumber.toLowerCase().includes(q) ||
          s.orderNumber.toLowerCase().includes(q) ||
          s.carrier.toLowerCase().includes(q) ||
          s.forwarder.toLowerCase().includes(q) ||
          (s.billOfLadingNumber || '').toLowerCase().includes(q) ||
          (s.trackingReference || '').toLowerCase().includes(q) ||
          s.destinationPort.toLowerCase().includes(q)
      );
    }
  }

  // Redact internal operational notes for buyer confidentiality
  return buyerShipments.map((s) => ({
    ...s,
    internalNotes: undefined,
  }));
}

/**
 * Retrieves a single shipment by its ID with tenant checks.
 */
export async function getShipmentById(
  shipmentId: string,
  userOrgId?: string | null
): Promise<Shipment | null> {
  const all = await getShipmentsForAdmin();
  const shipment = all.find((s) => s.id === shipmentId);
  if (!shipment) return null;

  if (userOrgId && shipment.buyerOrganizationId !== userOrgId) {
    return null; // Tenant isolation
  }

  if (userOrgId) {
    return {
      ...shipment,
      internalNotes: undefined,
    };
  }

  return shipment;
}

/**
 * Retrieves the shipment corresponding to an Order ID.
 */
export async function getShipmentByOrderId(
  orderId: string,
  userOrgId?: string | null
): Promise<Shipment | null> {
  const all = await getShipmentsForAdmin();
  const shipment = all.find((s) => s.orderId === orderId);
  if (!shipment) return null;

  if (userOrgId && shipment.buyerOrganizationId !== userOrgId) {
    return null;
  }

  if (userOrgId) {
    return {
      ...shipment,
      internalNotes: undefined,
    };
  }

  return shipment;
}

/**
 * Legacy compatibility helper.
 */
export async function getShipmentByOrder(orderId: string): Promise<Shipment | null> {
  return getShipmentByOrderId(orderId);
}

/**
 * Retrieves packing items for a shipment.
 */
export async function getPackingItemsForShipment(
  shipmentId: string,
  userOrgId?: string | null
): Promise<PackingItem[]> {
  const shipment = await getShipmentById(shipmentId, userOrgId);
  if (!shipment) return [];

  let items = inMemoryPackingItems.filter((p) => p.shipmentId === shipmentId);

  if (isConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'shipments', shipmentId, 'packingItems'));
      if (!snap.empty) {
        items = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as PackingItem));
      }
    } catch (err) {
      console.warn('[Firestore] Error reading packing items:', err);
    }
  }

  return items.sort((a, b) => a.cartonNumberStart - b.cartonNumberStart);
}

/**
 * Adds a new packing item and updates shipment totals.
 */
export async function createPackingItem(
  input: PackingItemInput,
  actor: { uid: string; role: string; name?: string }
): Promise<PackingItem> {
  if (!hasPermission(actor.role as UserRole, 'shipments.write')) {
    throw new Error('Access Denied: You do not have permission to manage packing list.');
  }

  const validated = packingItemSchema.parse(input);
  const singleCBM = calculateCartonCBM(validated.lengthCM, validated.widthCM, validated.heightCM);
  const totalCBM = calculateItemTotalCBM(singleCBM, validated.totalCartons);

  const now = new Date().toISOString();
  const itemId = validated.id || `pack-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  const newItem: PackingItem = {
    id: itemId,
    shipmentId: validated.shipmentId || '',
    orderId: validated.orderId,
    cartonNumberStart: validated.cartonNumberStart,
    cartonNumberEnd: validated.cartonNumberEnd,
    totalCartons: validated.totalCartons,
    styleNumber: validated.styleNumber,
    color: validated.color,
    sizeBreakdown: validated.sizeBreakdown,
    piecesPerCarton: validated.piecesPerCarton,
    totalPieces: validated.totalPieces,
    lengthCM: validated.lengthCM,
    widthCM: validated.widthCM,
    heightCM: validated.heightCM,
    singleCartonCBM: singleCBM,
    totalCBM,
    grossWeightKG: validated.grossWeightKG,
    netWeightKG: validated.netWeightKG,
    barcode: validated.barcode || '',
    notes: validated.notes || '',
    createdAt: now,
    updatedAt: now,
  };

  inMemoryPackingItems.push(newItem);

  if (validated.shipmentId) {
    await syncShipmentPackingTotals(validated.shipmentId);
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'PACKING_ITEM_CREATED',
    entityId: itemId,
    after: {
      cartons: newItem.totalCartons,
      pieces: newItem.totalPieces,
      grossWeightKG: newItem.grossWeightKG,
      cbm: newItem.totalCBM,
    },
  });

  return newItem;
}

/**
 * Updates a packing item line and recalculates shipment aggregate telemetry.
 */
export async function updatePackingItem(
  id: string,
  input: Partial<PackingItemInput>,
  actor: { uid: string; role: string; name?: string }
): Promise<PackingItem> {
  if (!hasPermission(actor.role as UserRole, 'shipments.write')) {
    throw new Error('Access Denied: You do not have permission to manage packing list.');
  }

  const existingIdx = inMemoryPackingItems.findIndex((p) => p.id === id);
  if (existingIdx === -1) {
    throw new Error(`Packing item ${id} not found.`);
  }

  const existing = inMemoryPackingItems[existingIdx];
  const now = new Date().toISOString();

  const length = input.lengthCM ?? existing.lengthCM;
  const width = input.widthCM ?? existing.widthCM;
  const height = input.heightCM ?? existing.heightCM;
  const totalCartons = input.totalCartons ?? existing.totalCartons;

  const singleCBM = calculateCartonCBM(length, width, height);
  const totalCBM = calculateItemTotalCBM(singleCBM, totalCartons);

  const updated: PackingItem = {
    ...existing,
    ...input,
    singleCartonCBM: singleCBM,
    totalCBM,
    updatedAt: now,
  };

  inMemoryPackingItems[existingIdx] = updated;

  if (updated.shipmentId) {
    await syncShipmentPackingTotals(updated.shipmentId);
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'PACKING_ITEM_UPDATED',
    entityId: id,
    before: { cartons: existing.totalCartons, cbm: existing.totalCBM },
    after: { cartons: updated.totalCartons, cbm: updated.totalCBM },
  });

  return updated;
}

/**
 * Deletes a packing item and synchronizes shipment totals.
 */
export async function deletePackingItem(
  id: string,
  actor: { uid: string; role: string; name?: string }
): Promise<boolean> {
  if (!hasPermission(actor.role as UserRole, 'shipments.write')) {
    throw new Error('Access Denied: You do not have permission to delete packing list items.');
  }

  const existing = inMemoryPackingItems.find((p) => p.id === id);
  if (!existing) return false;

  inMemoryPackingItems = inMemoryPackingItems.filter((p) => p.id !== id);

  if (existing.shipmentId) {
    await syncShipmentPackingTotals(existing.shipmentId);
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'PACKING_ITEM_DELETED',
    entityId: id,
    before: { shipmentId: existing.shipmentId, cartons: existing.totalCartons },
  });

  return true;
}

/**
 * Recomputes and updates totals on a shipment object from its packing items.
 */
async function syncShipmentPackingTotals(shipmentId: string): Promise<void> {
  const items = inMemoryPackingItems.filter((p) => p.shipmentId === shipmentId);
  const summary = calculatePackingSummary(items);

  const shipmentIdx = inMemoryShipments.findIndex((s) => s.id === shipmentId);
  if (shipmentIdx !== -1) {
    inMemoryShipments[shipmentIdx] = {
      ...inMemoryShipments[shipmentIdx],
      totalCartons: summary.totalCartons,
      totalPieces: summary.totalPieces,
      totalGrossWeightKG: summary.totalGrossWeightKG,
      totalNetWeightKG: summary.totalNetWeightKG,
      totalCBM: summary.totalCBM,
      packingStatus: summary.totalCartons > 0 ? 'COMPLETED' : 'NOT_STARTED',
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Retrieves shipment tracking events.
 */
export async function getShipmentEvents(
  shipmentId: string,
  userOrgId?: string | null
): Promise<ShipmentEvent[]> {
  const shipment = await getShipmentById(shipmentId, userOrgId);
  if (!shipment) return [];

  const events = inMemoryEvents.filter((e) => e.shipmentId === shipmentId);
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Records a new shipment tracking event.
 */
export async function recordShipmentEvent(
  shipmentId: string,
  input: ShipmentEventInput,
  actor: { uid: string; role: string; name: string }
): Promise<ShipmentEvent> {
  if (
    !hasPermission(actor.role as UserRole, 'shipments.tracking') &&
    !hasPermission(actor.role as UserRole, 'shipments.write') &&
    !hasPermission(actor.role as UserRole, 'shipments.confirmDelivery')
  ) {
    throw new Error('Access Denied: You do not have permission to record tracking events.');
  }

  const shipment = await getShipmentById(shipmentId);
  if (!shipment) {
    throw new Error(`Shipment ${shipmentId} not found.`);
  }

  const validated = shipmentEventSchema.parse(input);
  const newEvent: ShipmentEvent = {
    id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    shipmentId,
    title: validated.title,
    location: validated.location,
    status: validated.status,
    description: validated.description,
    timestamp: validated.timestamp || new Date().toISOString(),
    createdByUid: actor.uid,
    createdByName: actor.name,
    isMilestone: validated.isMilestone ?? false,
  };

  inMemoryEvents.unshift(newEvent);

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'SHIPMENT_EVENT_CREATED',
    entityId: newEvent.id,
    after: {
      shipmentId,
      title: newEvent.title,
      status: newEvent.status,
      location: newEvent.location,
    },
  });

  return newEvent;
}

/**
 * Retrieves commercial shipping documents checklist for a shipment.
 */
export async function getShipmentDocumentChecklist(
  shipmentId: string,
  userOrgId?: string | null
): Promise<ShipmentDocumentChecklistItem[]> {
  const shipment = await getShipmentById(shipmentId, userOrgId);
  if (!shipment) return [];

  return inMemoryChecklists.filter((d) => d.shipmentId === shipmentId);
}

/**
 * Updates or verifies a shipping document checklist item.
 */
export async function updateShipmentDocumentChecklistItem(
  id: string,
  updates: Partial<ShipmentDocumentChecklistInput> & {
    status?: 'PENDING' | 'DRAFTED' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';
    fileUrl?: string;
    fileName?: string;
  },
  actor: { uid: string; role: string; name?: string }
): Promise<ShipmentDocumentChecklistItem> {
  if (!hasPermission(actor.role as UserRole, 'shipments.documents') && !hasPermission(actor.role as UserRole, 'shipments.write')) {
    throw new Error('Access Denied: You do not have permission to update shipping documents.');
  }

  const itemIdx = inMemoryChecklists.findIndex((d) => d.id === id);
  if (itemIdx === -1) {
    throw new Error(`Document checklist item ${id} not found.`);
  }

  const existing = inMemoryChecklists[itemIdx];
  const now = new Date().toISOString();

  const updated: ShipmentDocumentChecklistItem = {
    ...existing,
    ...updates,
    uploadedAt: updates.fileUrl ? now : existing.uploadedAt,
    uploadedByUid: updates.fileUrl ? actor.uid : existing.uploadedByUid,
    verifiedAt: updates.status === 'VERIFIED' ? now : existing.verifiedAt,
    verifiedByUid: updates.status === 'VERIFIED' ? actor.uid : existing.verifiedByUid,
  };

  inMemoryChecklists[itemIdx] = updated;

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'SHIPMENT_DOCUMENT_STATUS_CHANGED',
    entityId: id,
    before: { status: existing.status },
    after: { status: updated.status, fileName: updated.fileName },
  });

  return updated;
}

/**
 * Evaluates deterministic readiness gates (Quality Gate, Production Gate, Document Gate)
 * before a shipment can move to READY_TO_SHIP or DISPATCHED.
 */
export async function getShipmentReadiness(orderId: string): Promise<ShipmentReadiness> {
  const reasons: string[] = [];

  // 1. Quality Gate Check (Step 12)
  const inspections = await getInspectionsForOrder(orderId);
  const passedInspections = inspections.filter((i) => i.result === 'PASS');
  const failedInspections = inspections.filter((i) => i.result === 'FAIL');
  const pendingInspections = inspections.filter((i) => i.result === 'PENDING');

  const openCapsCount = inspections.reduce(
    (count, i) => count + (i.correctiveAction && i.correctiveAction.status !== 'verified' && i.correctiveAction.status !== 'VERIFIED' ? 1 : 0),
    0
  );

  const criticalDefectsCount = inspections.reduce(
    (count, i) => count + (i.criticalDefects || 0),
    0
  );

  let qualityPassed = true;
  if (inspections.length === 0) {
    qualityPassed = false;
    reasons.push('No quality inspections have been recorded for this order yet.');
  } else if (failedInspections.length > 0 && passedInspections.length === 0) {
    qualityPassed = false;
    reasons.push(`Order has ${failedInspections.length} failed quality inspection(s) without subsequent pass.`);
  }

  if (openCapsCount > 0) {
    qualityPassed = false;
    reasons.push(`Order has ${openCapsCount} open Corrective Action Plan(s) pending verification.`);
  }

  if (criticalDefectsCount > 0) {
    qualityPassed = false;
    reasons.push(`Inspection records show ${criticalDefectsCount} unresolved critical defect(s).`);
  }

  // 2. Production & Packing Gate Check (Step 9)
  const order = await getOrderById(orderId);
  const orderQuantity = order?.quantity || 1;

  const shipment = await getShipmentByOrderId(orderId);
  const packedQuantity = shipment?.totalPieces || 0;
  const completionPercentage = Math.min(100, Math.round((packedQuantity / orderQuantity) * 100));

  let productionPassed = true;
  if (packedQuantity === 0) {
    productionPassed = false;
    reasons.push('Packing list is empty. 0 pieces packed.');
  } else if (packedQuantity < orderQuantity) {
    // Note: in apparel, ±3-5% allowance exists, but strict 100% check triggers notification
    if (packedQuantity < orderQuantity * 0.95) {
      productionPassed = false;
      reasons.push(`Packed quantity (${packedQuantity.toLocaleString()}) is below 95% of PO quantity (${orderQuantity.toLocaleString()}).`);
    }
  }

  // 3. Document Gate Check (Step 11)
  let documentGate = {
    isComplete: true,
    pendingRequiredCount: 0,
    totalRequiredCount: 0,
  };

  if (shipment) {
    const docs = await getShipmentDocumentChecklist(shipment.id);
    const requiredDocs = docs.filter((d) => d.required);
    const pendingRequired = requiredDocs.filter((d) => d.status !== 'VERIFIED' && d.status !== 'UPLOADED');
    documentGate = {
      isComplete: pendingRequired.length === 0,
      pendingRequiredCount: pendingRequired.length,
      totalRequiredCount: requiredDocs.length,
    };

    if (pendingRequired.length > 0) {
      reasons.push(`${pendingRequired.length} required commercial shipping document(s) are pending upload/verification.`);
    }
  }

  const isReady = qualityPassed && productionPassed && documentGate.isComplete;

  return {
    isReady,
    qualityGate: {
      passed: qualityPassed,
      inspectionCount: inspections.length,
      passedInspections: passedInspections.length,
      failedInspections: failedInspections.length,
      pendingInspections: pendingInspections.length,
      openCapsCount,
      criticalDefectsCount,
      overrideApplied: shipment?.qualityGateOverride ? true : false,
      overrideByUid: shipment?.qualityGateOverride?.overrideByUid,
      overrideByName: shipment?.qualityGateOverride?.overrideByName,
      overrideReason: shipment?.qualityGateOverride?.reason,
      overrideAt: shipment?.qualityGateOverride?.overrideAt,
    },
    productionGate: {
      passed: productionPassed,
      requiredQuantity: orderQuantity,
      packedQuantity,
      completionPercentage,
    },
    documentGate,
    reasons,
  };
}

/**
 * Creates a new shipment booking plan.
 */
export async function createShipment(
  input: CreateShipmentInput,
  actor: { uid: string; role: string; name?: string }
): Promise<Shipment> {
  if (!hasPermission(actor.role as UserRole, 'shipments.write')) {
    throw new Error('Access Denied: You do not have permission to create shipments.');
  }

  const validated = createShipmentSchema.parse(input);
  const shipmentId = `ship-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const shipmentNumber = `SHP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const delayStatus = detectShipmentDelayStatus(
    'PLANNING',
    validated.plannedShipDate,
    undefined,
    validated.estimatedDeliveryDate
  );

  const newShipment: Shipment = {
    id: shipmentId,
    shipmentNumber,
    orderId: validated.orderId,
    orderNumber: validated.orderNumber,
    buyerOrganizationId: validated.buyerOrganizationId,
    buyerOrganizationName: validated.buyerOrganizationName,
    destinationCountry: validated.destinationCountry,
    destinationPort: validated.destinationPort,
    portOfLoading: validated.portOfLoading,
    transportMode: validated.transportMode,
    incoterm: validated.incoterm,
    carrier: validated.carrier,
    forwarder: validated.forwarder,
    vesselFlightNumber: validated.vesselFlightNumber || '',
    voyageNumber: validated.voyageNumber || '',
    containerNumber: validated.containerNumber || '',
    sealNumber: validated.sealNumber || '',
    billOfLadingNumber: validated.billOfLadingNumber || '',
    airWaybillNumber: validated.airWaybillNumber || '',
    bookingReference: validated.bookingReference || '',
    trackingReference: validated.trackingReference || '',
    status: 'PLANNING',
    packingStatus: 'NOT_STARTED',
    documentationStatus: 'PENDING',
    customsStatus: 'NOT_SUBMITTED',
    plannedShipDate: validated.plannedShipDate,
    estimatedDeliveryDate: validated.estimatedDeliveryDate,
    totalCartons: 0,
    totalPieces: 0,
    totalGrossWeightKG: 0,
    totalNetWeightKG: 0,
    totalCBM: 0,
    delayStatus,
    internalNotes: validated.internalNotes || '',
    createdAt: now,
    updatedAt: now,
  };

  inMemoryShipments.unshift(newShipment);

  // Initialize standard document checklist
  const standardDocs: ShipmentDocumentChecklistItem[] = [
    {
      id: `doc-chk-${Date.now().toString(36)}-1`,
      shipmentId,
      documentType: 'COMMERCIAL_INVOICE',
      documentName: 'Commercial Invoice',
      required: true,
      status: 'PENDING',
    },
    {
      id: `doc-chk-${Date.now().toString(36)}-2`,
      shipmentId,
      documentType: 'PACKING_LIST',
      documentName: 'Export Packing List',
      required: true,
      status: 'PENDING',
    },
    {
      id: `doc-chk-${Date.now().toString(36)}-3`,
      shipmentId,
      documentType: validated.transportMode === 'AIR' ? 'AIR_WAYBILL' : 'BILL_OF_LADING',
      documentName: validated.transportMode === 'AIR' ? 'Air Waybill (AWB)' : 'Bill of Lading (B/L)',
      required: true,
      status: 'PENDING',
    },
    {
      id: `doc-chk-${Date.now().toString(36)}-4`,
      shipmentId,
      documentType: 'CERTIFICATE_OF_ORIGIN',
      documentName: 'Certificate of Origin',
      required: true,
      status: 'PENDING',
    },
    {
      id: `doc-chk-${Date.now().toString(36)}-5`,
      shipmentId,
      documentType: 'INSPECTION_CERTIFICATE',
      documentName: 'Quality Inspection Certificate',
      required: true,
      status: 'PENDING',
    },
  ];

  inMemoryChecklists.push(...standardDocs);

  // Record initial event
  await recordShipmentEvent(
    shipmentId,
    {
      title: 'Shipment Plan Initialized',
      location: validated.portOfLoading,
      status: 'PLANNING',
      description: `Shipment plan created with ${validated.carrier} via ${validated.forwarder}.`,
      isMilestone: true,
    },
    { uid: actor.uid, role: actor.role, name: actor.name || 'Operations Staff' }
  );

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'SHIPMENT_CREATED',
    entityId: shipmentId,
    after: {
      shipmentNumber,
      orderNumber: validated.orderNumber,
      carrier: validated.carrier,
      transportMode: validated.transportMode,
      plannedShipDate: validated.plannedShipDate,
    },
  });

  return newShipment;
}

/**
 * Updates shipment logistics attributes.
 */
export async function updateShipment(
  id: string,
  input: UpdateShipmentInput,
  actor: { uid: string; role: string; name?: string }
): Promise<Shipment> {
  if (!hasPermission(actor.role as UserRole, 'shipments.write')) {
    throw new Error('Access Denied: You do not have permission to edit shipments.');
  }

  const existing = await getShipmentById(id);
  if (!existing) {
    throw new Error(`Shipment ${id} not found.`);
  }

  const validated = updateShipmentSchema.parse(input);
  const now = new Date().toISOString();

  const updated: Shipment = {
    ...existing,
    ...validated,
    updatedAt: now,
  };

  updated.delayStatus = detectShipmentDelayStatus(
    updated.status,
    updated.plannedShipDate,
    updated.actualShipDate,
    updated.estimatedDeliveryDate,
    updated.actualDeliveryDate
  );

  const idx = inMemoryShipments.findIndex((s) => s.id === id);
  if (idx !== -1) {
    inMemoryShipments[idx] = updated;
  }

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'SHIPMENT_UPDATED',
    entityId: id,
    before: { carrier: existing.carrier, tracking: existing.trackingReference },
    after: { carrier: updated.carrier, tracking: updated.trackingReference },
  });

  return updated;
}

/**
 * Progresses shipment lifecycle status with deterministic gate checks.
 */
export async function updateShipmentStatus(
  id: string,
  input: UpdateShipmentStatusInput,
  actor: { uid: string; role: string; name: string }
): Promise<Shipment> {
  if (!hasPermission(actor.role as UserRole, 'shipments.status') && !hasPermission(actor.role as UserRole, 'shipments.write')) {
    throw new Error('Access Denied: You do not have permission to change shipment status.');
  }

  const existing = await getShipmentById(id);
  if (!existing) {
    throw new Error(`Shipment ${id} not found.`);
  }

  const validated = updateShipmentStatusSchema.parse(input);

  // Validate state machine transition
  if (!isValidShipmentStatusTransition(existing.status, validated.status)) {
    throw new Error(
      `Illegal shipment status transition from '${existing.status}' to '${validated.status}'.`
    );
  }

  const now = new Date().toISOString();
  let qualityOverride = existing.qualityGateOverride;

  // Gate enforcement for dispatching and ready-to-ship
  if (validated.status === 'READY_TO_SHIP' || validated.status === 'DISPATCHED') {
    const readiness = await getShipmentReadiness(existing.orderId);

    if (!readiness.isReady) {
      if (validated.overrideQualityGate) {
        // Manager override authorization
        const isManager = ['Super Admin', 'Admin', 'Operations Manager'].includes(actor.role);
        if (!isManager) {
          throw new Error('Access Denied: Only Operations Managers or Admins can override readiness gates.');
        }
        if (!validated.overrideReason || validated.overrideReason.trim().length < 5) {
          throw new Error('A detailed reason (minimum 5 characters) is required to override shipment readiness gates.');
        }

        qualityOverride = {
          overrideByUid: actor.uid,
          overrideByName: actor.name,
          reason: validated.overrideReason,
          overrideAt: now,
        };

        await logSecurityEvent({
          actorUid: actor.uid,
          actorRole: actor.role,
          action: 'SHIPMENT_READY_TO_SHIP',
          entityId: id,
          after: {
            qualityOverride,
            unmetReasons: readiness.reasons,
          },
        });
      } else {
        throw new Error(`Shipment cannot transition to ${validated.status}: ${readiness.reasons.join(' ')}`);
      }
    }
  }

  const actualShipDate =
    validated.status === 'DISPATCHED' && !existing.actualShipDate
      ? now.split('T')[0]
      : existing.actualShipDate;

  const actualDeliveryDate =
    validated.status === 'DELIVERED' && !existing.actualDeliveryDate
      ? now.split('T')[0]
      : existing.actualDeliveryDate;

  const updated: Shipment = {
    ...existing,
    status: validated.status,
    actualShipDate,
    actualDeliveryDate,
    qualityGateOverride: qualityOverride,
    updatedAt: now,
  };

  updated.delayStatus = detectShipmentDelayStatus(
    updated.status,
    updated.plannedShipDate,
    updated.actualShipDate,
    updated.estimatedDeliveryDate,
    updated.actualDeliveryDate
  );

  const idx = inMemoryShipments.findIndex((s) => s.id === id);
  if (idx !== -1) {
    inMemoryShipments[idx] = updated;
  }

  // Record milestone event
  await recordShipmentEvent(
    id,
    {
      title: `Status updated to ${validated.status.replace(/_/g, ' ')}`,
      location: validated.location || existing.destinationPort || 'Operations Hub',
      status: validated.status,
      description: validated.note || `Shipment status progressed to ${validated.status.replace(/_/g, ' ')}.`,
      isMilestone: true,
    },
    actor
  );

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: actor.role,
    action: 'SHIPMENT_STATUS_CHANGED',
    entityId: id,
    before: { status: existing.status },
    after: { status: updated.status, override: qualityOverride },
  });

  return updated;
}

/**
 * Allows authenticated buyer to confirm delivery receipt of goods.
 * Strictly enforces tenant isolation and updates order/shipment status.
 */
export async function confirmDelivery(
  shipmentId: string,
  input: DeliveryConfirmationInput,
  buyerOrgId: string,
  actor: { uid: string; name: string }
): Promise<Shipment> {
  const shipment = await getShipmentById(shipmentId);
  if (!shipment) {
    throw new Error(`Shipment ${shipmentId} not found.`);
  }

  if (shipment.buyerOrganizationId !== buyerOrgId) {
    throw new Error('Access Denied: You cannot confirm delivery for a shipment belonging to another organization.');
  }

  const validated = deliveryConfirmationSchema.parse(input);
  const now = new Date().toISOString();

  const deliveryConfirmation = {
    confirmed: true,
    confirmedAt: now,
    confirmedByUid: actor.uid,
    confirmedByName: actor.name,
    receivedQuantity: validated.receivedQuantity,
    conditionNotes: validated.conditionNotes || '',
    discrepancyReported: validated.discrepancyReported || false,
    discrepancyDetails: validated.discrepancyDetails || '',
    buyerSignatureName: validated.buyerSignatureName,
  };

  const updated: Shipment = {
    ...shipment,
    status: 'DELIVERED',
    actualDeliveryDate: shipment.actualDeliveryDate || now.split('T')[0],
    deliveryConfirmation,
    updatedAt: now,
  };

  const idx = inMemoryShipments.findIndex((s) => s.id === shipmentId);
  if (idx !== -1) {
    inMemoryShipments[idx] = updated;
  }

  // Record milestone event
  await recordShipmentEvent(
    shipmentId,
    {
      title: 'Delivery Receipt Confirmed by Buyer',
      location: shipment.destinationPort,
      status: 'DELIVERED',
      description: `Delivery confirmed by ${validated.buyerSignatureName}. Received: ${validated.receivedQuantity.toLocaleString()} pcs. ${validated.conditionNotes ? `Notes: ${validated.conditionNotes}` : ''}`,
      isMilestone: true,
    },
    { uid: actor.uid, role: 'Buyer', name: actor.name }
  );

  await logSecurityEvent({
    actorUid: actor.uid,
    actorRole: 'Buyer',
    action: 'DELIVERY_CONFIRMED',
    entityId: shipmentId,
    after: {
      receivedQuantity: validated.receivedQuantity,
      discrepancyReported: validated.discrepancyReported,
      buyerSignature: validated.buyerSignatureName,
    },
  });

  return updated;
}

/**
 * Calculates logistics summary KPIs.
 */
export async function getShipmentMetrics(buyerOrgId?: string | null): Promise<ShipmentSummaryMetrics> {
  const shipments = buyerOrgId
    ? await getShipmentsForBuyer(buyerOrgId)
    : await getShipmentsForAdmin();

  const totalShipments = shipments.length;
  const inTransitShipments = shipments.filter(
    (s) => s.status === 'IN_TRANSIT' || s.status === 'ARRIVED_AT_PORT' || s.status === 'OUT_FOR_DELIVERY'
  ).length;
  const readyToShipShipments = shipments.filter((s) => s.status === 'READY_TO_SHIP').length;
  const delayedShipments = shipments.filter((s) => s.delayStatus === 'DELAYED').length;
  const deliveredShipments = shipments.filter((s) => s.status === 'DELIVERED').length;

  const totalCBM = Number(
    shipments.reduce((sum, s) => sum + (s.totalCBM || 0), 0).toFixed(2)
  );
  const totalPieces = shipments.reduce((sum, s) => sum + (s.totalPieces || 0), 0);

  const onTimeDelivered = shipments.filter(
    (s) => s.status === 'DELIVERED' && s.delayStatus !== 'DELAYED'
  ).length;

  const onTimeDeliveryRate =
    deliveredShipments > 0 ? Math.round((onTimeDelivered / deliveredShipments) * 100) : 100;

  return {
    totalShipments,
    inTransitShipments,
    readyToShipShipments,
    delayedShipments,
    deliveredShipments,
    totalCBM,
    totalPieces,
    onTimeDeliveryRate,
  };
}

