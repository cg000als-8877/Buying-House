export type InquiryStatus = 'new' | 'contacted' | 'costing_in_progress' | 'quote_sent' | 'converted' | 'closed';

export interface Inquiry {
  id: string;
  name: string;
  company: string;
  country: string;
  email: string;
  phone?: string;
  productCategory: string;
  estimatedQuantity: string;
  targetDeliveryDate?: string;
  message: string;
  attachmentPath?: string;
  status: InquiryStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}
