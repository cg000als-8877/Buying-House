export type TransportMode = 'SEA_FCL' | 'SEA_LCL' | 'AIR' | 'ROAD' | 'COURIER';

export type Incoterm = 'FOB' | 'CIF' | 'CFR' | 'EXW' | 'DDP' | 'DAP' | 'FCA';

export type ShipmentStatus =
  | 'PLANNING'
  | 'BOOKING_REQUESTED'
  | 'BOOKED'
  | 'PACKING'
  | 'READY_TO_SHIP'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'CUSTOMS_HOLD'
  | 'CUSTOMS_CLEARED'
  | 'ARRIVED_AT_PORT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PackingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';

export type DocumentationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';

export type CustomsStatus = 'NOT_SUBMITTED' | 'UNDER_REVIEW' | 'CLEARED' | 'HOLD' | 'INSPECTION';

export type DelayStatus = 'ON_TIME' | 'AT_RISK' | 'DELAYED';

export type ShippingDocumentType =
  | 'COMMERCIAL_INVOICE'
  | 'PACKING_LIST'
  | 'BILL_OF_LADING'
  | 'AIR_WAYBILL'
  | 'CERTIFICATE_OF_ORIGIN'
  | 'INSPECTION_CERTIFICATE'
  | 'GSP_FORM_A'
  | 'BENEFICIARY_CERTIFICATE'
  | 'INSURANCE_CERTIFICATE'
  | 'CUSTOMS_DECLARATION'
  | 'OTHER';

export interface PackingItem {
  id: string;
  shipmentId: string;
  orderId: string;
  cartonNumberStart: number;
  cartonNumberEnd: number;
  totalCartons: number;
  styleNumber: string;
  color: string;
  sizeBreakdown: Record<string, number>;
  piecesPerCarton: number;
  totalPieces: number;
  lengthCM: number;
  widthCM: number;
  heightCM: number;
  singleCartonCBM: number;
  totalCBM: number;
  grossWeightKG: number;
  netWeightKG: number;
  barcode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentDocumentChecklistItem {
  id: string;
  shipmentId: string;
  documentType: ShippingDocumentType;
  documentName: string;
  required: boolean;
  status: 'PENDING' | 'DRAFTED' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';
  documentVaultId?: string;
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: string;
  uploadedByUid?: string;
  verifiedAt?: string;
  verifiedByUid?: string;
  notes?: string;
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  title: string;
  location: string;
  timestamp: string;
  status: ShipmentStatus;
  description: string;
  createdByUid: string;
  createdByName: string;
  isMilestone?: boolean;
  carrierRawData?: string;
}

export interface QualityGateStatus {
  passed: boolean;
  inspectionCount: number;
  passedInspections: number;
  failedInspections: number;
  pendingInspections: number;
  openCapsCount: number;
  criticalDefectsCount: number;
  overrideApplied?: boolean;
  overrideByUid?: string;
  overrideByName?: string;
  overrideReason?: string;
  overrideAt?: string;
}

export interface ProductionGateStatus {
  passed: boolean;
  requiredQuantity: number;
  packedQuantity: number;
  completionPercentage: number;
  overrideApplied?: boolean;
  overrideReason?: string;
}

export interface DocumentGateStatus {
  isComplete: boolean;
  pendingRequiredCount: number;
  totalRequiredCount: number;
}

export interface ShipmentReadiness {
  isReady: boolean;
  qualityGate: QualityGateStatus;
  productionGate: ProductionGateStatus;
  documentGate: DocumentGateStatus;
  reasons: string[];
}

export interface DeliveryConfirmation {
  confirmed: boolean;
  confirmedAt?: string;
  confirmedByUid?: string;
  confirmedByName?: string;
  receivedQuantity?: number;
  conditionNotes?: string;
  discrepancyReported?: boolean;
  discrepancyDetails?: string;
  buyerSignatureName?: string;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  buyerOrganizationId: string;
  buyerOrganizationName: string;
  destinationCountry: string;
  destinationPort: string;
  portOfLoading: string;
  transportMode: TransportMode;
  incoterm: Incoterm;
  carrier: string;
  forwarder: string;
  vesselFlightNumber?: string;
  voyageNumber?: string;
  containerNumber?: string;
  sealNumber?: string;
  billOfLadingNumber?: string;
  airWaybillNumber?: string;
  bookingReference?: string;
  trackingReference?: string;
  status: ShipmentStatus;
  packingStatus: PackingStatus;
  documentationStatus: DocumentationStatus;
  customsStatus: CustomsStatus;
  plannedShipDate: string;
  actualShipDate?: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  totalCartons: number;
  totalPieces: number;
  totalGrossWeightKG: number;
  totalNetWeightKG: number;
  totalCBM: number;
  delayStatus: DelayStatus;
  internalNotes?: string;
  deliveryConfirmation?: DeliveryConfirmation;
  qualityGateOverride?: {
    overrideByUid: string;
    overrideByName: string;
    reason: string;
    overrideAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentSummaryMetrics {
  totalShipments: number;
  inTransitShipments: number;
  readyToShipShipments: number;
  delayedShipments: number;
  deliveredShipments: number;
  totalCBM: number;
  totalPieces: number;
  onTimeDeliveryRate: number;
}

