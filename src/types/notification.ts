export type NotificationType =
  | 'production_update'
  | 'sample_approval_request'
  | 'sample_status_change'
  | 'document_uploaded'
  | 'inspection_completed'
  | 'shipment_update'
  | 'system_alert';

export interface AppNotification {
  id: string;
  recipientUserId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedOrderId?: string;
  read: boolean;
  createdAt: string;
}
