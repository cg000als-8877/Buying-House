import { z } from 'zod';
import { ShipmentStatus } from '@/types/shipment';

export const TRANSPORT_MODES = ['SEA_FCL', 'SEA_LCL', 'AIR', 'ROAD', 'COURIER'] as const;

export const INCOTERMS = ['FOB', 'CIF', 'CFR', 'EXW', 'DDP', 'DAP', 'FCA'] as const;

export const SHIPMENT_STATUSES = [
  'PLANNING',
  'BOOKING_REQUESTED',
  'BOOKED',
  'PACKING',
  'READY_TO_SHIP',
  'DISPATCHED',
  'IN_TRANSIT',
  'CUSTOMS_HOLD',
  'CUSTOMS_CLEARED',
  'ARRIVED_AT_PORT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
] as const;

export const PACKING_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'] as const;

export const DOCUMENTATION_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'] as const;

export const CUSTOMS_STATUSES = [
  'NOT_SUBMITTED',
  'UNDER_REVIEW',
  'CLEARED',
  'HOLD',
  'INSPECTION',
] as const;

export const SHIPPING_DOCUMENT_TYPES = [
  'COMMERCIAL_INVOICE',
  'PACKING_LIST',
  'BILL_OF_LADING',
  'AIR_WAYBILL',
  'CERTIFICATE_OF_ORIGIN',
  'INSPECTION_CERTIFICATE',
  'GSP_FORM_A',
  'BENEFICIARY_CERTIFICATE',
  'INSURANCE_CERTIFICATE',
  'CUSTOMS_DECLARATION',
  'OTHER',
] as const;

export const VALID_SHIPMENT_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  PLANNING: ['BOOKING_REQUESTED', 'CANCELLED'],
  BOOKING_REQUESTED: ['BOOKED', 'PLANNING', 'CANCELLED'],
  BOOKED: ['PACKING', 'PLANNING', 'CANCELLED'],
  PACKING: ['READY_TO_SHIP', 'BOOKED', 'CANCELLED'],
  READY_TO_SHIP: ['DISPATCHED', 'PACKING', 'CANCELLED'],
  DISPATCHED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['CUSTOMS_HOLD', 'CUSTOMS_CLEARED', 'ARRIVED_AT_PORT', 'OUT_FOR_DELIVERY', 'DELIVERED'],
  CUSTOMS_HOLD: ['CUSTOMS_CLEARED', 'IN_TRANSIT', 'CANCELLED'],
  CUSTOMS_CLEARED: ['ARRIVED_AT_PORT', 'OUT_FOR_DELIVERY', 'DELIVERED'],
  ARRIVED_AT_PORT: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CUSTOMS_HOLD'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function isValidShipmentStatusTransition(
  currentStatus: ShipmentStatus,
  newStatus: ShipmentStatus
): boolean {
  if (currentStatus === newStatus) return true;
  const allowed = VALID_SHIPMENT_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

export const packingItemSchema = z
  .object({
    id: z.string().optional(),
    shipmentId: z.string().optional(),
    orderId: z.string().min(1, 'Order ID is required'),
    cartonNumberStart: z
      .number()
      .int('Start carton must be an integer')
      .min(1, 'Carton start number must be at least 1'),
    cartonNumberEnd: z
      .number()
      .int('End carton must be an integer')
      .min(1, 'Carton end number must be at least 1'),
    totalCartons: z
      .number()
      .int('Total cartons must be an integer')
      .min(1, 'Total cartons must be at least 1'),
    styleNumber: z.string().min(1, 'Style number is required'),
    color: z.string().min(1, 'Color is required'),
    sizeBreakdown: z.record(z.string(), z.number().int().min(0)),
    piecesPerCarton: z
      .number()
      .int('Pieces per carton must be an integer')
      .min(1, 'Pieces per carton must be at least 1'),
    totalPieces: z
      .number()
      .int('Total pieces must be an integer')
      .min(1, 'Total pieces must be at least 1'),
    lengthCM: z.number().min(0.1, 'Length must be > 0 cm'),
    widthCM: z.number().min(0.1, 'Width must be > 0 cm'),
    heightCM: z.number().min(0.1, 'Height must be > 0 cm'),
    grossWeightKG: z.number().min(0.01, 'Gross weight must be > 0 kg'),
    netWeightKG: z.number().min(0.01, 'Net weight must be > 0 kg'),
    barcode: z.string().optional().or(z.literal('')),
    notes: z.string().max(500).optional().or(z.literal('')),
  })
  .refine((data) => data.cartonNumberEnd >= data.cartonNumberStart, {
    message: 'Carton end number must be greater than or equal to start number',
    path: ['cartonNumberEnd'],
  })
  .refine((data) => data.grossWeightKG >= data.netWeightKG, {
    message: 'Gross weight must be greater than or equal to Net weight',
    path: ['grossWeightKG'],
  });

export type PackingItemInput = z.input<typeof packingItemSchema>;

export const createShipmentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  orderNumber: z.string().min(1, 'Order PO Number is required'),
  buyerOrganizationId: z.string().min(1, 'Buyer organization context is required'),
  buyerOrganizationName: z.string().min(1, 'Buyer organization name is required'),
  destinationCountry: z.string().min(2, 'Destination country is required'),
  destinationPort: z.string().min(2, 'Destination port / airport is required'),
  portOfLoading: z.string().min(2, 'Port of loading is required'),
  transportMode: z.enum(TRANSPORT_MODES, {
    errorMap: () => ({ message: 'Please select a valid transport mode' }),
  }),
  incoterm: z.enum(INCOTERMS, {
    errorMap: () => ({ message: 'Please select a valid Incoterm' }),
  }),
  carrier: z.string().min(2, 'Carrier line / airline is required'),
  forwarder: z.string().min(2, 'Freight forwarder is required'),
  vesselFlightNumber: z.string().optional().or(z.literal('')),
  voyageNumber: z.string().optional().or(z.literal('')),
  containerNumber: z.string().optional().or(z.literal('')),
  sealNumber: z.string().optional().or(z.literal('')),
  billOfLadingNumber: z.string().optional().or(z.literal('')),
  airWaybillNumber: z.string().optional().or(z.literal('')),
  bookingReference: z.string().optional().or(z.literal('')),
  trackingReference: z.string().optional().or(z.literal('')),
  plannedShipDate: z
    .string()
    .min(1, 'Planned ship date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Planned ship date must be YYYY-MM-DD'),
  estimatedDeliveryDate: z
    .string()
    .min(1, 'Estimated delivery date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Estimated delivery date must be YYYY-MM-DD'),
  internalNotes: z.string().max(2000).optional().or(z.literal('')),
});

export type CreateShipmentInput = z.input<typeof createShipmentSchema>;

export const updateShipmentSchema = z.object({
  destinationCountry: z.string().min(2).optional(),
  destinationPort: z.string().min(2).optional(),
  portOfLoading: z.string().min(2).optional(),
  transportMode: z.enum(TRANSPORT_MODES).optional(),
  incoterm: z.enum(INCOTERMS).optional(),
  carrier: z.string().min(2).optional(),
  forwarder: z.string().min(2).optional(),
  vesselFlightNumber: z.string().optional().or(z.literal('')),
  voyageNumber: z.string().optional().or(z.literal('')),
  containerNumber: z.string().optional().or(z.literal('')),
  sealNumber: z.string().optional().or(z.literal('')),
  billOfLadingNumber: z.string().optional().or(z.literal('')),
  airWaybillNumber: z.string().optional().or(z.literal('')),
  bookingReference: z.string().optional().or(z.literal('')),
  trackingReference: z.string().optional().or(z.literal('')),
  plannedShipDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Planned ship date must be YYYY-MM-DD')
    .optional(),
  actualShipDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Actual ship date must be YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
  estimatedDeliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Estimated delivery date must be YYYY-MM-DD')
    .optional(),
  actualDeliveryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Actual delivery date must be YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
  packingStatus: z.enum(PACKING_STATUSES).optional(),
  documentationStatus: z.enum(DOCUMENTATION_STATUSES).optional(),
  customsStatus: z.enum(CUSTOMS_STATUSES).optional(),
  internalNotes: z.string().max(2000).optional().or(z.literal('')),
});

export type UpdateShipmentInput = z.input<typeof updateShipmentSchema>;

export const updateShipmentStatusSchema = z.object({
  status: z.enum(SHIPMENT_STATUSES, {
    errorMap: () => ({ message: 'Please select a valid shipment status' }),
  }),
  note: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  overrideQualityGate: z.boolean().optional(),
  overrideReason: z.string().max(500).optional(),
});

export type UpdateShipmentStatusInput = z.input<typeof updateShipmentStatusSchema>;

export const shipmentEventSchema = z.object({
  title: z.string().min(2, 'Event title is required'),
  location: z.string().min(2, 'Location is required'),
  status: z.enum(SHIPMENT_STATUSES),
  description: z.string().min(2, 'Event description is required'),
  timestamp: z
    .string()
    .optional()
    .default(() => new Date().toISOString()),
  isMilestone: z.boolean().optional().default(false),
});

export type ShipmentEventInput = z.input<typeof shipmentEventSchema>;

export const deliveryConfirmationSchema = z.object({
  receivedQuantity: z
    .number()
    .int('Received quantity must be an integer')
    .min(0, 'Received quantity cannot be negative'),
  conditionNotes: z.string().max(1000).optional().or(z.literal('')),
  discrepancyReported: z.boolean().default(false),
  discrepancyDetails: z.string().max(1000).optional().or(z.literal('')),
  buyerSignatureName: z
    .string()
    .min(2, 'Authorized signatory name is required for delivery confirmation'),
});

export type DeliveryConfirmationInput = z.input<typeof deliveryConfirmationSchema>;

export const shipmentDocumentChecklistSchema = z.object({
  documentType: z.enum(SHIPPING_DOCUMENT_TYPES),
  documentName: z.string().min(2, 'Document name is required'),
  required: z.boolean().default(true),
  status: z.enum(['PENDING', 'DRAFTED', 'UPLOADED', 'VERIFIED', 'REJECTED']).default('PENDING'),
  documentVaultId: z.string().optional().or(z.literal('')),
  fileUrl: z.string().url().optional().or(z.literal('')),
  fileName: z.string().optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export type ShipmentDocumentChecklistInput = z.input<typeof shipmentDocumentChecklistSchema>;
