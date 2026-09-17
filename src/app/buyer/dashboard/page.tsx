'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getOrdersByBuyerOrg, getBuyerDashboardStats } from '@/lib/orders';
import { Order, BuyerDashboardStats } from '@/types/order';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderCard } from '@/components/buyer/OrderCard';

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<BuyerDashboardStats>({
    activeOrdersCount: 0,
    inProductionCount: 0,
    upcomingShipmentsCount: 0,
    unreadNotificationsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const buyerOrgId = user?.buyerOrganizationId || 'buyer-org-001';

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [ordersData, statsData] = await Promise.all([
          getOrdersByBuyerOrg(buyerOrgId),
          getBuyerDashboardStats(buyerOrgId, user?.uid),
        ]);

        if (isMounted) {
          setOrders(ordersData);
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error loading buyer dashboard data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [buyerOrgId, user?.uid]);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-widest text-primary font-bold">
              Buyer Portal Workspace
            </span>
            <span className="text-muted-foreground/60">/</span>
            <Badge variant="blue" size="sm">
              Org: {buyerOrgId}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground tracking-tight">
            Production &amp; Order Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time status updates, milestone progress, and verified inspection telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/buyer/orders">
            <Button variant="primary" size="md" className="gap-2">
              <Search className="w-4 h-4" />
              <span>Browse All Orders</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Orders */}
          <Card className="p-5 relative overflow-hidden group border-border/80 hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-semibold">
                Active Orders
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold font-medium text-foreground">
                {stats.activeOrdersCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span>In-flight purchase orders</span>
              </p>
            </div>
          </Card>

          {/* In Production */}
          <Card className="p-5 relative overflow-hidden group border-border/80 hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-semibold">
                In Production
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold font-medium text-foreground">
                {stats.inProductionCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Material, cutting &amp; sewing
              </p>
            </div>
          </Card>

          {/* Upcoming Shipments / QC */}
          <Card className="p-5 relative overflow-hidden group border-border/80 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-semibold">
                QC &amp; Shipments
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold font-medium text-foreground">
                {stats.upcomingShipmentsCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                AQL inspection &amp; dispatch
              </p>
            </div>
          </Card>

          {/* Unread Alerts */}
          <Card className="p-5 relative overflow-hidden group border-border/80 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-semibold">
                Notifications
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold font-medium text-foreground">
                {stats.unreadNotificationsCount}
              </div>
              <Link
                href="/buyer/notifications"
                className="text-xs text-primary hover:underline mt-1 flex items-center gap-1 font-medium"
              >
                <span>View action items</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content Sections: Recent Orders & Quick Overview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-foreground">
              Recent Purchase Orders
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time progression across factory production lines.
            </p>
          </div>
          {orders.length > 0 && (
            <Link href="/buyer/orders">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <span>View All ({orders.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </Card>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <EmptyState
              title="No Active Orders Found"
              description="There are currently no purchase orders registered under your buyer organization."
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Production Highlights Banner */}
      <Card className="p-6 bg-gradient-to-r from-card to-muted/40 border-border/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                Verified Quality Protocol (AQL 1.5 / 2.5)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              All production updates and milestone completions are logged directly by certified merchandisers and QA teams.
            </p>
          </div>
          <Link href="/buyer/orders">
            <Button variant="outline" size="sm" className="shrink-0">
              <span>View Production Telemetry</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
