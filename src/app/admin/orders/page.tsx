'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { getAllOrders } from '@/lib/orders';
import { Order } from '@/types/order';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/buyer/OrderStatusBadge';

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Sampling & Approvals', value: 'Sampling' },
  { label: 'Order Confirmation', value: 'Order Confirmation' },
  { label: 'Material & Cutting', value: 'Material' },
  { label: 'In Production (Sewing)', value: 'Production' },
  { label: 'Finishing & Final QA', value: 'Finishing' },
  { label: 'Quality & AQL Audit (QC)', value: 'QC' },
  { label: 'Packing & Shipment', value: 'Shipment' },
  { label: 'Completed / Delivered', value: 'Completed' },
];

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Newest Order First', value: 'date_desc' },
  { label: 'Oldest Order First', value: 'date_asc' },
  { label: 'Quantity: High to Low', value: 'qty_desc' },
  { label: 'Quantity: Low to High', value: 'qty_asc' },
  { label: 'Ex-Factory Delivery Date', value: 'ex_factory' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setIsLoading(true);
      try {
        const data = await getAllOrders();
        if (isMounted) {
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching admin orders:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'Material' && !['Material', 'Cutting'].includes(order.currentStatus)) {
          return false;
        } else if (statusFilter === 'Shipment' && !['Packing', 'Shipment'].includes(order.currentStatus)) {
          return false;
        } else if (statusFilter !== 'Material' && statusFilter !== 'Shipment' && order.currentStatus !== statusFilter) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPO = order.orderNumber.toLowerCase().includes(q);
        const matchesStyle = order.styleNumber.toLowerCase().includes(q);
        const matchesProduct = order.productName.toLowerCase().includes(q);
        const matchesBuyer = order.buyerOrganizationId.toLowerCase().includes(q);
        const matchesFactory = order.factoryId ? order.factoryId.toLowerCase().includes(q) : false;
        const matchesMerch = order.assignedMerchandiserId ? order.assignedMerchandiserId.toLowerCase().includes(q) : false;

        return matchesPO || matchesStyle || matchesProduct || matchesBuyer || matchesFactory || matchesMerch;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'qty_desc') {
        return b.quantity - a.quantity;
      }
      if (sortBy === 'qty_asc') {
        return a.quantity - b.quantity;
      }
      if (sortBy === 'ex_factory') {
        return new Date(a.exFactoryDate).getTime() - new Date(b.exFactoryDate).getTime();
      }
      return 0;
    });
  }, [orders, searchQuery, statusFilter, sortBy]);

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'ALL' || sortBy !== 'date_desc';

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSortBy('date_desc');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              Purchase Order Master
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">{orders.length} Total Registered POs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Manufacturing Orders Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Central operational registry for all purchase orders, factory allocations, and critical milestone tracking.
          </p>
        </div>

        <Link href="/admin/orders/new">
          <Button variant="primary" size="sm" className="gap-2 shrink-0 text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Purchase Order</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 bg-slate-900/80 border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by PO #, style #, buyer, factory, merchandiser..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 text-white placeholder:text-slate-600"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 text-white"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 text-white"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">
              Showing <strong className="text-white font-mono">{filteredOrders.length}</strong> of {orders.length} orders
            </span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-amber-400 hover:underline text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </Card>

      {/* Orders Directory Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="p-6 space-y-3">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            title="No Purchase Orders Found"
            description="No orders match your current search and filter parameters."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-800 bg-slate-900/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase font-mono text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">PO &amp; Style</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Buyer Org</th>
                  <th className="py-3.5 px-4">Factory Unit</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Ex-Factory</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{order.orderNumber}</span>
                      <span className="text-[11px] text-slate-400 font-sans">{order.styleNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-sans truncate max-w-[180px]">
                      {order.productName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {order.buyerOrganizationId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {order.factoryId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-bold">
                      {order.quantity.toLocaleString()} pcs
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <OrderStatusBadge status={order.currentStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {order.exFactoryDate}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-amber-400 border-slate-700 hover:bg-slate-800"
                        >
                          <span>Workspace</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
