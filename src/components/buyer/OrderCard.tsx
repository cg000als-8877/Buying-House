import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Calendar, Layers } from 'lucide-react';
import { Order } from '@/types/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderProgressBar } from './OrderProgressBar';
import { getOrderProgressPercentage } from '@/lib/orders';

export interface BuyerOrder {
  id: string;
  orderNumber: string;
  styleName: string;
  category: string;
  quantity: number;
  fobPrice: string;
  totalValue: string;
  currentStage: string;
  progressPercent: number;
  estShipDate: string;
  factoryName: string;
  thumbnail: string;
  status: 'In Production' | 'Sample Approved' | 'Inspection Passed' | 'Shipped';
}

export interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const progress = getOrderProgressPercentage(order.currentStatus);

  return (
    <Card hoverEffect className="p-5 sm:p-6 transition-all border-border/80 bg-card/80 hover:border-primary/40">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Section: Order Identity & Product Info */}
        <div className="space-y-2.5 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
              {order.orderNumber}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Style: {order.styleNumber}
            </span>
            <OrderStatusBadge status={order.currentStatus} size="sm" />
            {order.priority && order.priority !== 'medium' && (
              <span className={`text-[10px] uppercase font-medium px-1.5 py-0.5 rounded font-bold ${
                order.priority === 'urgent'
                  ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                  : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
              }`}>
                {order.priority}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-sans font-bold text-foreground tracking-tight hover:text-primary transition-colors">
              <Link href={`/buyer/orders/${order.id}`}>
                {order.productName}
              </Link>
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-muted-foreground/70" />
                Category: <strong className="text-foreground font-medium">{order.category}</strong>
              </span>
              <span className="text-border">|</span>
              <span>Quantity: <strong className="text-foreground font-medium">{order.quantity.toLocaleString()} pcs</strong></span>
              {order.factoryId && (
                <>
                  <span className="text-border">|</span>
                  <span>Factory Ref: <strong className="text-foreground font-medium">{order.factoryId}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Middle Section: Milestone Progress & Schedule */}
        <div className="w-full lg:w-64 space-y-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/50">
          <OrderProgressBar status={order.currentStatus} customPercentage={progress} size="md" />

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-muted-foreground/80" />
              Ex-Factory: <strong className="text-foreground font-medium">{order.exFactoryDate}</strong>
            </span>
            {order.shipmentDate && (
              <span className="font-medium text-muted-foreground">
                Ship: {order.shipmentDate}
              </span>
            )}
          </div>
        </div>

        {/* Right Section: Action Button */}
        <div className="shrink-0 flex items-center justify-end">
          <Link href={`/buyer/orders/${order.id}`} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto group">
              <span>View Order Details</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
