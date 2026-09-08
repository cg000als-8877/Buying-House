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

export interface BuyerDashboardStats {
  activeOrdersCount: number;
  inProductionCount: number;
  upcomingShipmentsCount: number;
  unreadNotificationsCount: number;
}

export interface AdminDashboardStats {
  activeOrdersCount: number;
  inProductionCount: number;
  delayedOrdersCount: number;
  pendingSampleApprovalsCount: number;
  upcomingExFactoryCount: number;
  qcIssuesCount: number;
  upcomingShipmentsCount: number;
}

export interface OrderMilestone {
  stage: OrderStatus;
  label: string;
  description: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  date?: string;
}
