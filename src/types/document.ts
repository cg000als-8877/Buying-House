export type DocumentType =
  | 'Tech Pack'
  | 'Purchase Order'
  | 'Order Confirmation'
  | 'Fabric Approval'
  | 'Lab Dip'
  | 'Color Approval'
  | 'Size Set'
  | 'PP Sample'
  | 'Inspection Report'
  | 'Packing List'
  | 'Commercial Invoice'
  | 'Shipment Documents'
  | 'Certificate'
  | 'Other';

export type DocumentVisibility = 'buyer' | 'internal' | 'restricted';

export interface OrderDocument {
  id: string;
  orderId: string;
  buyerOrganizationId: string;
  name: string;
  type: DocumentType;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  visibility: DocumentVisibility;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}
