export type OrderStatus =
  | 'Inquiry'
  | 'Development'
  | 'Sampling'
  | 'Order Confirmation'
  | 'Material'
  | 'Cutting'
  | 'Production'
  | 'Finishing'
  | 'QC'
  | 'Packing'
  | 'Shipment'
  | 'Completed'
  | 'Cancelled';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface OrderItem {
  id: string;
  orderId: string;
  color: string;
  sizeBreakdown: Record<string, number>;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerOrganizationId: string;
  styleNumber: string;
  productName: string;
  category: string;
  factoryId: string;
  quantity: number;
  currency: string;
  unitPrice?: number; // Access controlled
  orderDate: string;
  exFactoryDate: string;
  shipmentDate?: string;
  currentStatus: OrderStatus;
  priority: PriorityLevel;
  assignedMerchandiserId: string;
  createdAt: string;
  updatedAt: string;
}
