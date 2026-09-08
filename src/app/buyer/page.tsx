'use client';

import React, { useState } from 'react';
import {
  OrderCard,
  BuyerOrder,
  ProductionTimeline,
  ProductionChart,
  DocumentList,
  Milestone,
  OrderDocument,
} from '@/components/buyer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Dialog } from '@/components/ui/Dialog';
import { ShoppingBag, ShieldCheck, Sparkles, ArrowRight, Download, PackageCheck } from 'lucide-react';

const mockOrders: BuyerOrder[] = [
  {
    id: 'ord-101',
    orderNumber: 'PO-2026-8821',
    styleName: 'Luxury Pima Heavyweight Tee',
    category: 'Knitwear',
    quantity: 5000,
    fobPrice: '$6.80 USD',
    totalValue: '$34,000 USD',
    currentStage: 'Bulk Sewing Assembly',
    progressPercent: 70,
    estShipDate: 'Oct 28, 2026',
    factoryName: 'Apex Organic Mill #2 (Dhaka)',
    thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
    status: 'In Production',
  },
  {
    id: 'ord-102',
    orderNumber: 'PO-2026-9043',
    styleName: 'Organic French Terry Hoodie',
    category: 'Knitwear',
    quantity: 2500,
    fobPrice: '$16.50 USD',
    totalValue: '$41,250 USD',
    currentStage: 'Pre-Shipment AQL 1.5 Inspection',
    progressPercent: 95,
    estShipDate: 'Oct 14, 2026',
    factoryName: 'Ecoloom Knitting Hub',
    thumbnail: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80',
    status: 'Inspection Passed',
  },
  {
    id: 'ord-103',
    orderNumber: 'PO-2026-9112',
    styleName: 'Selvedge Heritage Denim Jacket',
    category: 'Denim',
    quantity: 1200,
    fobPrice: '$24.00 USD',
    totalValue: '$28,800 USD',
    currentStage: 'Yarn Ring Spinning & Dyeing',
    progressPercent: 25,
    estShipDate: 'Nov 30, 2026',
    factoryName: 'Indigo Heritage Mill',
    thumbnail: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=400&q=80',
    status: 'In Production',
  },
];

const mockMilestones: Milestone[] = [
  {
    id: '1',
    title: 'Yarn In-House & Fiber Verification',
    department: 'Spinning Lab',
    targetDate: 'Aug 10, 2026',
    actualDate: 'Aug 09, 2026',
    status: 'Completed',
    notes: 'Peruvian Pima long-staple fiber test passed. Zero contamination.',
  },
  {
    id: '2',
    title: 'Lab-Dip Spectrophotometer Shade Approval',
    department: 'Dyeing House',
    targetDate: 'Aug 18, 2026',
    actualDate: 'Aug 17, 2026',
    status: 'Completed',
    notes: 'Approved Shade #B-Navy under D65 / TL84 light source.',
  },
  {
    id: '3',
    title: 'Knitting & Compact Finishing (260 GSM)',
    department: 'Circular Knitting Unit',
    targetDate: 'Sep 02, 2026',
    actualDate: 'Sep 01, 2026',
    status: 'Completed',
    notes: 'Fabric pre-shrunk with silicon soft wash. Shrinkage under 2.5%.',
  },
  {
    id: '4',
    title: 'Precision Automated Laser Cutting',
    department: 'Cutting Section',
    targetDate: 'Sep 12, 2026',
    actualDate: 'Sep 12, 2026',
    status: 'Completed',
    notes: '5,000 units cut with 100% CAD grain alignment.',
  },
  {
    id: '5',
    title: 'Bulk Sewing Assembly & Neck Ribbing',
    department: 'Sewing Lines #4 & #5',
    targetDate: 'Oct 08, 2026',
    status: 'In Progress',
    notes: '3,500 / 5,000 units completed. Double-needle stitch tension verified.',
  },
  {
    id: '6',
    title: 'AQL 1.5 Final Pre-Shipment Inspection',
    department: 'Independent QA Lab',
    targetDate: 'Oct 20, 2026',
    status: 'Upcoming',
    notes: 'Metal detector scan, pull test, and carton drop test scheduled.',
  },
  {
    id: '7',
    title: 'Container Loading & Bill of Lading Release',
    department: 'Export Logistics',
    targetDate: 'Oct 28, 2026',
    status: 'Upcoming',
  },
];

const mockDocuments: OrderDocument[] = [
  {
    id: 'doc-1',
    name: 'Tech-Pack-Specification-PO-8821.pdf',
    type: 'Tech Pack',
    fileSize: '4.2 MB',
    uploadDate: 'Aug 05, 2026',
    verified: true,
  },
  {
    id: 'doc-2',
    name: 'Spectro-Color-LabDip-Report-Navy.pdf',
    type: 'Lab-Dip Report',
    fileSize: '1.8 MB',
    uploadDate: 'Aug 17, 2026',
    verified: true,
  },
  {
    id: 'doc-3',
    name: 'OEKO-TEX-Standard-100-Certificate.pdf',
    type: 'Inspection Certificate',
    fileSize: '2.5 MB',
    uploadDate: 'Aug 20, 2026',
    verified: true,
  },
  {
    id: 'doc-4',
    name: 'Fabric-Shrinkage-Test-Report-Intertek.pdf',
    type: 'Inspection Certificate',
    fileSize: '3.1 MB',
    uploadDate: 'Sep 05, 2026',
    verified: true,
  },
];

export default function BuyerPortalPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedOrder, setSelectedOrder] = useState<BuyerOrder>(mockOrders[0]);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  const tabs = [
    { id: 'active', label: 'Active Orders', count: 3 },
    { id: 'sampling', label: 'Sample Approvals', count: 1 },
    { id: 'shipped', label: 'Shipped History', count: 8 },
  ];

  const handleSelectOrder = (order: BuyerOrder) => {
    setSelectedOrder(order);
    setIsTimelineModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Buyer Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Buyer Portal • Nordic Atelier Studio</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Production &amp; Sourcing Command Center
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Real-time telemetry, lab-dip approvals, AQL 1.5 inspection scores, and digital shipping documentation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Dedicated Merchandiser</span>
              <span className="text-xs font-bold text-white">Tariq Rahman (Lead)</span>
              <span className="text-[11px] text-emerald-400 block">📞 Direct WhatsApp Ready</span>
            </div>
          </div>
        </div>

        {/* Top Overview Chart */}
        <ProductionChart
          totalPieces={8700}
          data={[
            { category: 'Knitwear (Tees & Hoodies)', pieces: 7500, color: '#f59e0b', percentage: 86 },
            { category: 'Selvedge Denim', pieces: 1200, color: '#10b981', percentage: 14 },
          ]}
        />

        {/* Tab Selector */}
        <div className="flex items-center justify-between">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <span className="text-xs text-slate-400 hidden sm:inline-block">
            Auto-synced with factory ERP every 15 minutes
          </span>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <OrderCard key={order.id} order={order} onSelect={handleSelectOrder} />
          ))}
        </div>

        {/* Document Vault */}
        <DocumentList documents={mockDocuments} />

        {/* Timeline Dialog Modal */}
        <Dialog
          isOpen={isTimelineModalOpen}
          onClose={() => setIsTimelineModalOpen(false)}
          maxWidth="xl"
        >
          <ProductionTimeline
            orderNumber={selectedOrder.orderNumber}
            styleName={selectedOrder.styleName}
            milestones={mockMilestones}
          />
        </Dialog>

      </div>
    </div>
  );
}
