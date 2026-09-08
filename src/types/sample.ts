export type SampleType =
  | 'Proto Sample'
  | 'Fit Sample'
  | 'Size Set'
  | 'Salesman Sample'
  | 'Pre-Production (PP)'
  | 'Top of Production (TOP)'
  | 'Shipment Sample';

export type SampleStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'revision_requested';

export interface Sample {
  id: string;
  orderId: string;
  sampleType: SampleType;
  status: SampleStatus;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  revisionNumber: number;
  remarks?: string;
  storagePath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SampleComment {
  id: string;
  sampleId: string;
  authorUid: string;
  authorRole: string;
  comment: string;
  actionTaken?: 'approved' | 'revision_requested' | 'comment_only';
  createdAt: string;
}
