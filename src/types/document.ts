export type DocumentCategory =
  | 'Tech Pack'
  | 'Specification'
  | 'Artwork'
  | 'Sample'
  | 'Approval'
  | 'Purchase Order'
  | 'Order Confirmation'
  | 'Quality'
  | 'Inspection'
  | 'Compliance'
  | 'Test Report'
  | 'Production'
  | 'Shipment'
  | 'Commercial'
  | 'Certificate'
  | 'Other';

export type DocumentType = DocumentCategory;

export type DocumentVisibility = 'buyer' | 'internal' | 'restricted';

export type DocumentStatus = 'active' | 'draft' | 'archived';

export interface DocumentRevisionHistory {
  id: string;
  documentId: string;
  version: number;
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  mimeType: string;
  storagePath: string;
  url?: string;
  changeNote?: string;
  uploadedBy: string;
  uploaderName?: string;
  uploaderRole?: string;
  createdAt: string;
}

export interface BusinessDocument {
  id: string;
  title: string;
  fileName: string;
  storagePath: string;
  url?: string;
  category: DocumentCategory;
  type: DocumentCategory; // Alias for compatibility
  name?: string; // Alias for title
  visibility: DocumentVisibility;
  status: DocumentStatus;
  version: number;
  mimeType: string;
  fileSize: number;
  fileSizeFormatted: string;
  buyerOrganizationId: string;
  orderId?: string | null;
  orderNumber?: string | null;
  styleNumber?: string | null;
  description?: string;
  uploadedBy: string;
  uploaderName?: string;
  uploaderRole?: string;
  isLatest: boolean;
  revisionOf?: string | null;
  history?: DocumentRevisionHistory[];
  archivedAt?: string | null;
  archivedBy?: string | null;
  archivedReason?: string | null;
  downloadCount?: number;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderDocument = BusinessDocument;
export type AppDocument = BusinessDocument;
