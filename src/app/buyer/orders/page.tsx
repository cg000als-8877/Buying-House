'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getOrdersByBuyerOrg } from '@/lib/orders';
import { Order } from '@/types/order';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderCard } from '@/components/buyer/OrderCard';

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Sampling', value: 'Sampling' },
  { label: 'Order Confirmation', value: 'Order Confirmation' },
  { label: 'Material & Cutting', value: 'Material' },
  { label: 'In Production (Sewing)', value: 'Production' },
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

export default function BuyerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');

  const buyerOrgId = user?.buyerOrganizationId || 'buyer-org-001';

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setIsLoading(true);
      try {
        const data = await getOrdersByBuyerOrg(buyerOrgId);
        if (isMounted) {
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching buyer orders:', error);
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
  }, [buyerOrgId]);

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'Material' && !['Material', 'Cutting'].includes(order.currentStatus)) {
          return false;
        } else if (statusFilter === 'Shipment' && !['Packing', 'Shipment'].includes(order.currentStatus)) {
          return false;
        } else if (statusFilter !== 'Material' && statusFilter !== 'Shipment' && order.currentStatus !== statusFilter) {
          return false;
        }
      }

      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPO = order.orderNumber.toLowerCase().includes(q);
        const matchesStyle = order.styleNumber.toLowerCase().includes(q);
        const matchesProduct = order.productName.toLowerCase().includes(q);
        const matchesCategory = order.category.toLowerCase().includes(q);
        const matchesFactory = order.factoryId ? order.factoryId.toLowerCase().includes(q) : false;

        return matchesPO || matchesStyle || matchesProduct || matchesCategory || matchesFactory;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-widest text-primary font-bold">
              Purchase Orders
            </span>
            <span className="text-muted-foreground/60">/</span>
            <Badge variant="blue" size="sm">
              Tenant: {buyerOrgId}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground tracking-tight">
            Order Directory &amp; Progress
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View live production progress, milestone timestamps, and authorized factory data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="slate" size="md" className="font-medium">
            {orders.length} Total Orders
          </Badge>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <Card className="p-4 sm:p-6 bg-card/80 border-border/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by PO #, style #, product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
            <span className="text-muted-foreground">
              Showing <strong className="text-foreground font-semibold">{filteredOrders.length}</strong> of {orders.length} orders
            </span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-primary hover:underline font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </Card>

      {/* Orders List / Loading / Empty State */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </Card>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <EmptyState
              title={orders.length === 0 ? "No Orders in Tenant Account" : "No Orders Match Criteria"}
              description={
                orders.length === 0
                  ? "There are no purchase orders associated with this buyer organization yet."
                  : "Try adjusting your search query or status filter to see other orders."
              }
            />
            {hasActiveFilters && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
