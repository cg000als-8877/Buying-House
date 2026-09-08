'use client';

import React, { useState } from 'react';
import { AdminSidebar, DataTable, OrderEditor, ProductionEditor, Column } from '@/components/admin';
import { BuyerOrder } from '@/components/buyer/OrderCard';
import { Milestone } from '@/components/buyer/ProductionTimeline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, Download, Search, RefreshCw, ShoppingBag, Factory, ShieldCheck, Users } from 'lucide-react';

const initialOrders: BuyerOrder[] = [
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

export default function AdminPage() {
  const [section, setSection] = useState('orders');
  const [orders, setOrders] = useState<BuyerOrder[]>(initialOrders);
  const [editingOrder, setEditingOrder] = useState<BuyerOrder | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  const handleEditOrder = (order: BuyerOrder) => {
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleDeleteOrder = (order: BuyerOrder) => {
    if (confirm(`Are you sure you want to delete ${order.orderNumber}?`)) {
      setOrders(orders.filter((o) => o.id !== order.id));
    }
  };

  const handleSaveOrder = (saved: BuyerOrder) => {
    if (editingOrder) {
      setOrders(orders.map((o) => (o.id === saved.id ? saved : o)));
    } else {
      setOrders([saved, ...orders]);
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.styleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.factoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<BuyerOrder>[] = [
    {
      key: 'orderNumber',
      header: 'PO #',
      render: (row) => <span className="font-mono font-bold text-amber-400">{row.orderNumber}</span>,
    },
    {
      key: 'styleName',
      header: 'Style / Product',
      render: (row) => (
        <div>
          <span className="font-semibold text-white block">{row.styleName}</span>
          <span className="text-[11px] text-slate-400">{row.category}</span>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row) => <span className="font-mono text-slate-200">{row.quantity.toLocaleString()} pcs</span>,
    },
    {
      key: 'factoryName',
      header: 'Assigned Mill',
      render: (row) => <span className="text-slate-300 text-xs">{row.factoryName}</span>,
    },
    {
      key: 'currentStage',
      header: 'Stage & Progress',
      render: (row) => (
        <div className="w-36 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 truncate max-w-[90px]">{row.currentStage}</span>
            <span className="text-white font-bold">{row.progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${row.progressPercent}%` }} />
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variants: Record<BuyerOrder['status'], 'amber' | 'emerald' | 'blue' | 'purple'> = {
          'In Production': 'amber',
          'Sample Approved': 'blue',
          'Inspection Passed': 'emerald',
          'Shipped': 'purple',
        };
        return <Badge variant={variants[row.status]} size="sm" dot>{row.status}</Badge>;
      },
    },
    {
      key: 'estShipDate',
      header: 'Ship Date',
      render: (row) => <span className="text-xs text-slate-400">{row.estShipDate}</span>,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row pt-20">
      
      {/* Admin Sidebar */}
      <AdminSidebar activeSection={section} onSelectSection={setSection} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-x-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Merchandising &amp; Sourcing Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage live production orders, assign factory lines, upload QA certificates, and update buyer milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="gold" size="sm" onClick={handleCreateOrder}>
              <Plus className="w-3.5 h-3.5" />
              <span>Create Purchase Order</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Active Production Units</span>
              <ShoppingBag className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-serif font-bold text-white">8,700 <span className="text-xs text-emerald-400 font-sans font-normal">+12% vs last mo</span></div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Partner Factories Active</span>
              <Factory className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-serif font-bold text-white">8 Units <span className="text-xs text-slate-500 font-sans font-normal">in Dhaka/Chittagong</span></div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">AQL 1.5 First-Pass Yield</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-serif font-bold text-white">99.4% <span className="text-xs text-emerald-400 font-sans font-normal">Passed</span></div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Active Brand Accounts</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-serif font-bold text-white">24 Brands <span className="text-xs text-slate-500 font-sans font-normal">US/EU</span></div>
          </Card>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by PO #, style, or mill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOrders([...initialOrders])}>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </Button>
          </div>
        </div>

        {/* Orders Data Table */}
        <DataTable
          columns={columns}
          data={filteredOrders}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          onView={(order) => alert(`Viewing full order dossier for ${order.orderNumber}`)}
        />

        {/* Order Editor Modal */}
        <OrderEditor
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          order={editingOrder}
          onSave={handleSaveOrder}
        />

      </main>
    </div>
  );
}
