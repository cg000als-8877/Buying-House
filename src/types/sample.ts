export type SampleType =
  | 'Proto Sample'
  | 'Fit Sample'
  | 'Size Set'
  | 'Salesman Sample'
  | 'Pre-Production (PP)'
  | 'Top of Production (TOP)'
  | 'Shipment Sample'
  | 'Lab Dip / Strike-Off';

export type SampleStatus =
  | 'draft'
  | 'in_development'
  | 'submitted'
  | 'approved'
  | 'changes_requested'
  | 'rejected';

export interface SampleAttachment {
  id: string;
  sampleId: string;
  revisionNumber: number;
  fileName: string;
  fileSize: string;
  fileType: string;
  storagePath: string;
  url?: string;
  caption?: string;
  visibility: 'buyer' | 'internal';
  uploadedBy: string;
  createdAt: string;
}

export interface SampleRevisionHistory {
  id: string;
  revisionNumber: number;
  status: SampleStatus;
  submittedAt?: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionRole?: string;
  decision?: 'approved' | 'changes_requested' | 'rejected' | 'submitted';
  notes?: string;
  revisionNotes?: string;
  feedback?: string;
  buyerFeedback?: string;
  courierName?: string;
  trackingNumber?: string;
  attachments?: SampleAttachment[];
  createdAt: string;
}

export interface SampleComment {
  id: string;
  sampleId: string;
  authorUid: string;
  authorRole: string;
  authorName?: string;
  comment: string;
  actionTaken?: 'approved' | 'changes_requested' | 'rejected' | 'comment_only';
  isInternalOnly: boolean;
  createdAt: string;
}

export interface Sample {
  id: string;
  orderId: string;
  buyerOrganizationId: string;
  sampleType: SampleType;
  status: SampleStatus;
  revisionNumber: number;
  targetDate?: string;
  submittedAt?: string;
  reviewedAt?: string;
  decidedAt?: string;
  decidedBy?: string;
  approvedAt?: string;
  rejectedAt?: string;
  courierName?: string;
  trackingNumber?: string;
  courierDispatchedAt?: string;
  internalRemarks?: string;
  buyerRemarks?: string;
  remarks?: string; // Compatibility alias
  buyerFeedback?: string;
  storagePath?: string; // Compatibility alias
  attachments?: SampleAttachment[];
  history?: SampleRevisionHistory[];
  comments?: SampleComment[];
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}
