'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Package,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getOrderById, updateOrder, getOrderMilestones, getOrderProgressPercentage } from '@/lib/orders';
import { Order, OrderStatus, PriorityLevel, OrderMilestone } from '@/types/order';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/buyer/OrderStatusBadge';
import { OrderProgressBar } from '@/components/buyer/OrderProgressBar';
import { OrderStatusTimeline } from '@/components/buyer/OrderStatusTimeline';
import { ProductionFloorWorkspace } from '@/components/admin/production/ProductionFloorWorkspace';
import { AdminSampleWorkspace } from '@/components/admin/samples/AdminSampleWorkspace';
import { AdminDocumentWorkspace } from '@/components/admin/documents/AdminDocumentWorkspace';
import { AdminQualityWorkspace } from '@/components/admin/quality/AdminQualityWorkspace';
import { AdminShipmentWorkspace } from '@/components/admin/shipment/AdminShipmentWorkspace';

const TABS = [
  { id: 'overview', label: 'Overview & Workspace' },
  { id: 'production', label: 'Daily Production Lines' },
  { id: 'samples', label: 'Sample Approvals' },
  { id: 'documents', label: 'Document Vault' },
  { id: 'quality', label: 'Quality & AQL Audits' },
  { id: 'shipment', label: 'Logistics & Dispatch' },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = typeof params?.orderId === 'string' ? params.orderId : Array.isArray(params?.orderId) ? params.orderId[0] : '';

  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [milestones, setMilestones] = useState<OrderMilestone[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      if (!orderId) return;
      setIsLoading(true);
      try {
        const data = await getOrderById(orderId);
        if (isMounted) {
          setOrder(data);
          if (data) {
            setMilestones(getOrderMilestones(data));
          }
        }
      } catch (error) {
        console.error('Error fetching admin order:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order || !user) return;
    setIsUpdating(true);
    try {
      const updated = await updateOrder(
        order.id,
        { currentStatus: newStatus },
        { uid: user.uid, role: user.role }
      );
      if (updated) {
        setOrder(updated);
        setMilestones(getOrderMilestones(updated));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityUpdate = async (newPriority: PriorityLevel) => {
    if (!order || !user) return;
    setIsUpdating(true);
    try {
      const updated = await updateOrder(
        order.id,
        { priority: newPriority },
        { uid: user.uid, role: user.role }
      );
      if (updated) {
        setOrder(updated);
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-6 w-48" />
        <Card className="p-8 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Card className="p-12 text-center space-y-4 border-slate-800">
          <EmptyState
            title="Purchase Order Not Found"
            description="The requested order reference could not be located in the database."
          />
          <Link href="/admin/orders">
            <Button variant="primary" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Orders Directory</span>
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const progress = getOrderProgressPercentage(order.currentStatus);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-white">
            Dashboard
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/admin/orders" className="text-slate-400 hover:text-white">
            Orders
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-amber-400 font-bold">{order.orderNumber}</span>
        </div>

        <Link href="/admin/orders">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Button>
        </Link>
      </div>

      {/* Main Order Header Workspace */}
      <Card className="p-6 sm:p-8 bg-slate-900/90 border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium font-bold text-amber-400 px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-400/20">
                {order.orderNumber}
              </span>
              <span className="text-xs font-medium text-slate-400 font-semibold">
                Style: {order.styleNumber}
              </span>
              <OrderStatusBadge status={order.currentStatus} size="md" />
              <span className={`text-[10px] uppercase font-medium px-2 py-0.5 rounded font-bold ${
                order.priority === 'urgent'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {order.priority}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
              {order.productName}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                Buyer Tenant:{' '}
                <Link href={`/admin/buyers/${order.buyerOrganizationId}`} className="text-amber-400 hover:underline font-medium font-bold">
                  {order.buyerOrganizationId}
                </Link>
              </span>
              <span className="text-slate-700">|</span>
              <span>Factory: <strong className="text-slate-200 font-medium">{order.factoryId}</strong></span>
              <span className="text-slate-700">|</span>
              <span>Volume: <strong className="text-white font-medium">{order.quantity.toLocaleString()} pcs</strong></span>
              <span className="text-slate-700">|</span>
              <span>Merchandiser: <strong className="text-slate-200 font-medium">{order.assignedMerchandiserId}</strong></span>
            </p>
          </div>

          {/* Quick Operational Status Mutator */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shrink-0">
            <div className="text-xs space-y-1">
              <label className="text-slate-400 block font-medium text-[11px]">Advance Stage:</label>
              <select
                value={order.currentStatus}
                disabled={isUpdating}
                onChange={(e) => handleStatusUpdate(e.target.value as OrderStatus)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 rounded border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="Inquiry">Inquiry</option>
                <option value="Development">Development</option>
                <option value="Sampling">Sampling</option>
                <option value="Order Confirmation">Order Confirmation</option>
                <option value="Material">Material</option>
                <option value="Cutting">Cutting</option>
                <option value="Production">Production</option>
                <option value="Finishing">Finishing</option>
                <option value="QC">QC</option>
                <option value="Packing">Packing</option>
                <option value="Shipment">Shipment</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="text-xs space-y-1 pt-2 border-t border-slate-800">
              <label className="text-slate-400 block font-medium text-[11px]">Priority:</label>
              <select
                value={order.priority}
                disabled={isUpdating}
                onChange={(e) => handlePriorityUpdate(e.target.value as PriorityLevel)}
                className="w-full px-2.5 py-1 text-xs bg-slate-900 rounded border border-slate-700 text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Global Progress Status Bar */}
        <div className="pt-4 border-t border-slate-800">
          <OrderProgressBar
            status={order.currentStatus}
            customPercentage={progress}
            size="lg"
          />
        </div>
      </Card>

      {/* Module Navigation Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-amber-400 text-amber-400 font-bold bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Areas */}
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3): Milestones & Floor Status */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6 sm:p-8 bg-slate-900/80 border-slate-800">
              <OrderStatusTimeline
                milestones={milestones}
                orderNumber={order.orderNumber}
              />
            </Card>

            {/* Department Status */}
            <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-medium uppercase text-amber-400 font-bold">Floor Telemetry</span>
                  <h3 className="font-sans font-bold text-lg text-white">
                    Factory Line Operational Status
                  </h3>
                </div>
                <Badge variant="emerald" size="sm">
                  Allocated: {order.factoryId}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-medium text-slate-400 uppercase font-semibold">1. Cutting Dept</span>
                  <div className="text-base font-bold text-white font-medium">
                    {['Material', 'Cutting', 'Production', 'Finishing', 'QC', 'Packing', 'Shipment', 'Completed'].includes(order.currentStatus)
                      ? `${order.quantity.toLocaleString()} pcs`
                      : 'Scheduled'}
                  </div>
                  <span className="text-[11px] text-emerald-400">Marker approved</span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-medium text-slate-400 uppercase font-semibold">2. Sewing Lines</span>
                  <div className="text-base font-bold text-white font-medium">
                    {['Production', 'Finishing', 'QC', 'Packing', 'Shipment', 'Completed'].includes(order.currentStatus)
                      ? 'In Assembly'
                      : 'Pending Line Feed'}
                  </div>
                  <span className="text-[11px] text-amber-400">Inline QA stationed</span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-medium text-slate-400 uppercase font-semibold">3. Finishing &amp; QC</span>
                  <div className="text-base font-bold text-white font-medium">
                    {['Finishing', 'QC', 'Packing', 'Shipment', 'Completed'].includes(order.currentStatus)
                      ? 'Final Audit Queue'
                      : 'Scheduled'}
                  </div>
                  <span className="text-[11px] text-slate-400">AQL 1.5 Protocol</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (1/3): Key Specifications & Allocation */}
          <div className="space-y-6">
            <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
              <h3 className="font-sans font-bold text-base text-white pb-2 border-b border-slate-800">
                Order Technical Master
              </h3>

              <div className="space-y-3 text-xs font-medium">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 font-sans">Category:</span>
                  <span className="text-white font-sans">{order.category}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 font-sans">Total Volume:</span>
                  <span className="text-white font-bold">{order.quantity.toLocaleString()} pcs</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 font-sans">Currency:</span>
                  <span className="text-slate-300">{order.currency}</span>
                </div>
                {order.unitPrice && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">FOB Unit Price:</span>
                    <span className="text-emerald-400 font-bold">${order.unitPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 font-sans">Order Placed Date:</span>
                  <span className="text-slate-300">{order.orderDate}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 font-sans">Ex-Factory Delivery:</span>
                  <span className="text-amber-400 font-bold">{order.exFactoryDate}</span>
                </div>
                {order.shipmentDate && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400 font-sans">Target Port Dispatch:</span>
                    <span className="text-slate-300">{order.shipmentDate}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-sans">Assigned Merchandiser:</span>
                  <span className="text-white font-bold">{order.assignedMerchandiserId}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-sans font-bold text-base text-white">
                  Compliance &amp; Quality
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspected under ISO 2859-1 standards (AQL 1.5 Major / 2.5 Minor). All factory floor updates and inline reports are stored in audit logs.
              </p>
            </Card>
          </div>
        </div>
      ) : activeTab === 'production' ? (
        <ProductionFloorWorkspace order={order} />
      ) : activeTab === 'samples' ? (
        <AdminSampleWorkspace order={order} />
      ) : activeTab === 'documents' ? (
        <AdminDocumentWorkspace initialOrderId={order.id} orderNumber={order.orderNumber} />
      ) : activeTab === 'quality' ? (
        <AdminQualityWorkspace initialOrderId={order.id} orderNumber={order.orderNumber} />
      ) : activeTab === 'shipment' ? (
        <AdminShipmentWorkspace initialOrderId={order.id} orderNumber={order.orderNumber} />
      ) : (
        /* Future Milestone Placeholders */
        <Card className="p-12 text-center space-y-3 bg-slate-900/60 border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-sans font-bold text-lg text-white">
            {TABS.find((t) => t.id === activeTab)?.label} Module
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            This module workspace is scheduled for the upcoming specialized milestone. Foundation data structures and tenant security boundaries are fully active.
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('overview')}
              className="text-xs text-amber-400 border-slate-700"
            >
              Return to Overview Workspace
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
