import React from 'react';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { OrderStatus } from '@/types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const STATUS_VARIANT_MAP: Record<OrderStatus, BadgeVariant> = {
  Inquiry: 'info',
  Development: 'info',
  Sampling: 'secondary',
  'Order Confirmation': 'warning',
  Material: 'warning',
  Cutting: 'warning',
  Production: 'brand',
  Finishing: 'brand',
  QC: 'success',
  Packing: 'secondary',
  Shipment: 'info',
  Completed: 'success',
  Cancelled: 'danger',
};

export function OrderStatusBadge({
  status,
  size = 'sm',
  className,
}: OrderStatusBadgeProps) {
  const variant = STATUS_VARIANT_MAP[status] || 'neutral';

  return (
    <Badge
      variant={variant}
      size={size}
      className={className}
    >
      {status}
    </Badge>
  );
}
