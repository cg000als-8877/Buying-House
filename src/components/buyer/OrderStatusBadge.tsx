import React from 'react';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { OrderStatus } from '@/types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

const STATUS_VARIANT_MAP: Record<OrderStatus, BadgeVariant> = {
  Inquiry: 'blue',
  Development: 'blue',
  Sampling: 'indigo',
  'Order Confirmation': 'amber',
  Material: 'amber',
  Cutting: 'amber',
  Production: 'purple',
  Finishing: 'purple',
  QC: 'emerald',
  Packing: 'teal',
  Shipment: 'teal',
  Completed: 'emerald',
  Cancelled: 'rose',
};

export function OrderStatusBadge({
  status,
  size = 'sm',
  showDot = true,
  className,
}: OrderStatusBadgeProps) {
  const variant = STATUS_VARIANT_MAP[status] || 'slate';

  return (
    <Badge
      variant={variant}
      size={size}
      dot={showDot}
      className={className}
    >
      {status}
    </Badge>
  );
}
