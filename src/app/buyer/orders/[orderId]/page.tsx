'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getOrderByIdForBuyer, getOrderMilestones, getOrderProgressPercentage } from '@/lib/orders';
import { Order, OrderMilestone } from '@/types/order';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/buyer/OrderStatusBadge';
import { OrderProgressBar } from '@/components/buyer/OrderProgressBar';
import { OrderStatusTimeline } from '@/components/buyer/OrderStatusTimeline';
import { DocumentList, OrderDocument } from '@/components/buyer/DocumentList';
import { BuyerProductionView } from '@/components/buyer/BuyerProductionView';
import { BuyerSampleApprovalView } from '@/components/buyer/BuyerSampleApprovalView';
import { BuyerDocumentVaultView } from '@/components/buyer/BuyerDocumentVaultView';
import { BuyerQualityView } from '@/components/buyer/BuyerQualityView';
import { BuyerShipmentView } from '@/components/buyer/BuyerShipmentView';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = typeof params?.orderId === 'string' ? params.orderId : Array.isArray(params?.orderId) ? params.orderId[0] : '';

  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [milestones, setMilestones] = useState<OrderMilestone[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'samples' | 'documents' | 'quality' | 'shipment'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  const buyerOrgId = user?.buyerOrganizationId || 'buyer-org-001';

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      setIsLoading(true);
      try {
        const data = await getOrderByIdForBuyer(orderId, buyerOrgId);
        if (isMounted) {
          setOrder(data);
          if (data) {
            setMilestones(getOrderMilestones(data));
          }
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
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
  }, [orderId, buyerOrgId]);

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Card className="p-8 space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </Card>
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  // Safe Not Found State (Strict Tenant Isolation)
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Card className="p-12 text-center space-y-6 border-border/80">
          <EmptyState
            title="Order Not Found"
            description="The requested purchase order could not be found or is not accessible under your current organization tenant."
          />
          <div className="flex justify-center gap-4">
            <Link href="/buyer/orders">
              <Button variant="primary" size="md" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Orders Directory</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const progress = getOrderProgressPercentage(order.currentStatus);

  // Mock authorized documents for this order
  const orderDocuments: OrderDocument[] = [
    {
      id: `doc-${order.id}-1`,
      name: `${order.styleNumber}_Approved_TechPack_v2.1.pdf`,
      type: 'Tech Pack',
      fileSize: '4.2 MB',
      uploadDate: order.orderDate,
      verified: true,
    },
    {
      id: `doc-${order.id}-2`,
      name: `LabDip_ShadeApproval_${order.styleNumber}.pdf`,
      type: 'Lab-Dip Report',
      fileSize: '1.8 MB',
      uploadDate: order.orderDate,
      verified: true,
    },
    {
      id: `doc-${order.id}-3`,
      name: `Inline_QC_Audit_Report_${order.orderNumber}.pdf`,
      type: 'Inspection Certificate',
      fileSize: '3.1 MB',
      uploadDate: order.updatedAt?.split('T')[0] || order.orderDate,
      verified: true,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Navigation Breadcrumb & Back Link */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link href="/buyer/dashboard" className="text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <Link href="/buyer/orders" className="text-muted-foreground hover:text-foreground">
            Orders
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-primary font-bold">{order.orderNumber}</span>
        </div>

        <Link href="/buyer/orders">
          <Button variant="ghost" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Button>
        </Link>
      </div>

      {/* Main Order Header Banner */}
      <Card className="p-6 sm:p-8 bg-card/90 border-border/80 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                {order.orderNumber}
              </span>
              <span className="text-xs font-mono text-muted-foreground font-semibold">
                Style: {order.styleNumber}
              </span>
              <OrderStatusBadge status={order.currentStatus} size="md" />
              {order.priority && (
                <span className={`text-[11px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                  order.priority === 'urgent'
                    ? 'bg-rose-950/60 text-rose-400 border border-rose-800/60'
                    : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                }`}>
                  {order.priority} Priority
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              {order.productName}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Category: <strong className="text-foreground">{order.category}</strong></span>
              <span>•</span>
              <span>Total Volume: <strong className="text-foreground">{order.quantity.toLocaleString()} pcs</strong></span>
              <span>•</span>
              <span>Organization: <strong className="text-foreground font-mono">{order.buyerOrganizationId}</strong></span>
            </p>
          </div>

          {/* Quick Schedule Metric */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 p-4 rounded-xl bg-muted/40 border border-border/60 shrink-0">
            <div className="text-xs space-y-0.5">
              <span className="text-muted-foreground">Ex-Factory Date</span>
              <div className="font-mono font-bold text-foreground text-sm flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>{order.exFactoryDate}</span>
              </div>
            </div>
            {order.shipmentDate && (
              <div className="text-xs space-y-0.5 pt-2 sm:pt-0 sm:pl-3 lg:pl-0 lg:pt-2 border-t sm:border-t-0 sm:border-l lg:border-l-0 lg:border-t border-border/60">
                <span className="text-muted-foreground">Target Port Dispatch</span>
                <div className="font-mono font-bold text-emerald-400 text-sm">
                  {order.shipmentDate}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Progress Status Bar */}
        <div className="pt-4 border-t border-border/60">
          <OrderProgressBar
            status={order.currentStatus}
            customPercentage={progress}
            size="lg"
          />
        </div>
      </Card>

      {/* Module Navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
            activeTab === 'overview'
              ? 'border-primary text-primary font-bold bg-muted/40'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
          }`}
        >
          Overview &amp; Specifications
        </button>
        <button
          onClick={() => setActiveTab('production')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
            activeTab === 'production'
              ? 'border-primary text-primary font-bold bg-muted/40'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
          }`}
        >
          Daily Floor Production
        </button>
        <button
          onClick={() => setActiveTab('samples')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
            activeTab === 'samples'
              ? 'border-primary text-primary font-bold bg-muted/40'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
          }`}
        >
          Sample Approvals
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
            activeTab === 'documents'
              ? 'border-primary text-primary font-bold bg-muted/40'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
          }`}
        >
          Documents &amp; Certificates
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
            activeTab === 'quality'
              ? 'border-primary text-primary font-bold bg-muted/40'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
          }`}
        >
          Quality &amp; AQL Audits
        </button>
        <button
          onClick={() => setActiveTab('shipment')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
            activeTab === 'shipment'
              ? 'border-primary text-primary font-bold bg-muted/40'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20'
          }`}
        >
          Logistics &amp; Shipments
        </button>
      </div>

      {/* Tab Content Areas */}
      {activeTab === 'production' ? (
        <BuyerProductionView order={order} buyerOrgId={buyerOrgId} />
      ) : activeTab === 'samples' ? (
        <BuyerSampleApprovalView order={order} buyerOrgId={buyerOrgId} />
      ) : activeTab === 'documents' ? (
        <BuyerDocumentVaultView initialOrderId={order.id} orderNumber={order.orderNumber} />
      ) : activeTab === 'quality' ? (
        <BuyerQualityView initialOrderId={order.id} orderNumber={order.orderNumber} buyerOrgId={buyerOrgId} />
      ) : activeTab === 'shipment' ? (
        <BuyerShipmentView initialOrderId={order.id} orderNumber={order.orderNumber} buyerOrgId={buyerOrgId} />
      ) : (
        /* Grid Layout: Production Milestones & Technical Specifications */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3): Live Milestones Timeline */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6 sm:p-8 bg-card/80 border-border/80">
              <OrderStatusTimeline
                milestones={milestones}
                orderNumber={order.orderNumber}
              />
            </Card>

            {/* Production Progress Breakdown */}
            <Card className="p-6 bg-card/80 border-border/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <span className="text-xs font-mono uppercase text-primary font-bold">Floor Telemetry</span>
                  <h3 className="font-serif font-bold text-lg text-foreground">
                    Manufacturing Departmental Status
                  </h3>
                </div>
                <Badge variant="blue" size="sm">
                  Factory Unit Live
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase font-semibold">1. Cutting Dept</span>
                  <div className="text-base font-bold text-foreground font-mono">
                    {['Material', 'Cutting', 'Production', 'Finishing', 'QC', 'Packing', 'Shipment', 'Completed'].includes(order.currentStatus)
                      ? `${order.quantity.toLocaleString()} pcs (100%)`
                      : 'Scheduled'}
                  </div>
                  <span className="text-[11px] text-emerald-400">Marker approved</span>
                </div>

                <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase font-semibold">2. Sewing Assembly</span>
                  <div className="text-base font-bold text-foreground font-mono">
                    {['Production', 'Finishing', 'QC', 'Packing', 'Shipment', 'Completed'].includes(order.currentStatus)
                      ? 'In Assembly Lines'
                      : 'Awaiting cut panel feed'}
                  </div>
                  <span className="text-[11px] text-amber-400">Inline QA stationed</span>
                </div>

                <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                  <span className="text-[11px] font-mono text-muted-foreground uppercase font-semibold">3. Finishing &amp; QC</span>
                  <div className="text-base font-bold text-foreground font-mono">
                    {['Finishing', 'QC', 'Packing', 'Shipment', 'Completed'].includes(order.currentStatus)
                      ? 'Final Audit Queue'
                      : 'Pending Sewing completion'}
                  </div>
                  <span className="text-[11px] text-muted-foreground">AQL 1.5 Protocol</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (1/3): Specifications & Documents */}
          <div className="space-y-6">
            {/* Order Specifications Card */}
            <Card className="p-6 bg-card/80 border-border/80 space-y-4">
              <h3 className="font-serif font-bold text-base text-foreground pb-2 border-b border-border">
                Order Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">PO Number:</span>
                  <span className="font-mono font-bold text-foreground">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Style Code:</span>
                  <span className="font-mono font-semibold text-foreground">{order.styleNumber}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Order Quantity:</span>
                  <span className="font-mono font-bold text-foreground">{order.quantity.toLocaleString()} pcs</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Order Placed Date:</span>
                  <span className="font-mono text-foreground">{order.orderDate}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="font-mono font-semibold text-foreground">{order.currency || 'USD'}</span>
                </div>
                {order.factoryId && (
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Manufacturing Unit:</span>
                    <span className="font-mono text-primary font-semibold">{order.factoryId}</span>
                  </div>
                )}
                {order.assignedMerchandiserId && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Merchandiser Ref:</span>
                    <span className="font-mono text-foreground">{order.assignedMerchandiserId}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Quality & Audit Protocol */}
            <Card className="p-6 bg-card/80 border-border/80 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-serif font-bold text-base text-foreground">
                  Compliance &amp; Quality
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Inspected in accordance with ISO 2859-1 (AQL 1.5 Major / 2.5 Minor) sampling plans.
              </p>
              <div className="pt-2">
                <Badge variant="emerald" size="sm" dot>
                  Verified QA Compliance
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
