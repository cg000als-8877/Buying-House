import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Clock, Package, CheckCircle2, AlertCircle } from 'lucide-react';

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
  order: BuyerOrder;
  onSelect?: (order: BuyerOrder) => void;
}

export function OrderCard({ order, onSelect }: OrderCardProps) {
  const statusVariants: Record<BuyerOrder['status'], 'amber' | 'emerald' | 'blue' | 'purple'> = {
    'In Production': 'amber',
    'Sample Approved': 'blue',
    'Inspection Passed': 'emerald',
    'Shipped': 'purple',
  };

  return (
    <Card hoverEffect className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
      {/* Left Thumbnail & Info */}
      <div className="flex items-center gap-4">
        <img
          src={order.thumbnail}
          alt={order.styleName}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-800 shrink-0"
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 font-semibold">{order.orderNumber}</span>
            <Badge variant={statusVariants[order.status]} size="sm" dot>
              {order.status}
            </Badge>
          </div>
          <h4 className="font-serif font-bold text-base sm:text-lg text-white">
            {order.styleName}
          </h4>
          <p className="text-xs text-slate-400">
            {order.quantity.toLocaleString()} pcs • {order.category} • Factory: <span className="text-slate-300">{order.factoryName}</span>
          </p>
        </div>
      </div>

      {/* Center Progress Metric */}
      <div className="w-full md:w-56 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Stage: <strong className="text-amber-400">{order.currentStage}</strong></span>
          <span className="text-white font-bold">{order.progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${order.progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Ship: {order.estShipDate}
          </span>
          <span>{order.totalValue}</span>
        </div>
      </div>

      {/* Right Action */}
      <div className="shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect && onSelect(order)}
          className="w-full md:w-auto"
        >
          <span>Track Live Milestones</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}
