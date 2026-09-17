'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Building2,
  Plus,
  ArrowRight,
  TrendingUp,
  History,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getAllOrders, getAdminDashboardStats } from '@/lib/orders';
import { fetchAuditLogs } from '@/lib/audit';
import { Order, AdminDashboardStats } from '@/types/order';
import { AuditLog } from '@/types/audit';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/buyer/OrderStatusBadge';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AdminDashboardStats>({
    activeOrdersCount: 0,
    inProductionCount: 0,
    delayedOrdersCount: 0,
    pendingSampleApprovalsCount: 0,
    upcomingExFactoryCount: 0,
    qcIssuesCount: 0,
    upcomingShipmentsCount: 0,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [ordersData, statsData, logsData] = await Promise.all([
          getAllOrders(),
          getAdminDashboardStats(),
          fetchAuditLogs(5),
        ]);

        if (isMounted) {
          setOrders(ordersData);
          setStats(statsData);
          setAuditLogs(logsData);
        }
      } catch (error) {
        console.error('Error loading admin dashboard data:', error);
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
  }, []);

  const delayedOrders = orders.filter((o) => {
    if (o.currentStatus === 'Completed' || o.currentStatus === 'Cancelled') return false;
    const exDate = new Date(o.exFactoryDate).getTime();
    const today = new Date().getTime();
    return exDate < today || (o.priority === 'urgent' && o.currentStatus !== 'Shipment');
  });

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-widest text-amber-400 font-bold">
              Operations Control Center
            </span>
            <span className="text-slate-600">/</span>
            <Badge variant="amber" size="sm">
              Role: {user?.role || 'Staff'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
            Manufacturing &amp; Merchandising Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Live order progression across partner factory units, QA audit statuses, and upcoming ex-factory milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/buyers">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Building2 className="w-3.5 h-3.5" />
              <span>Buyer Orgs</span>
            </Button>
          </Link>
          <Link href="/admin/orders/new">
            <Button variant="primary" size="sm" className="gap-2 text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Purchase Order</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Card key={n} className="p-4 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-12" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Active Orders */}
          <Card className="p-4 bg-slate-900/80 border-slate-800 hover:border-amber-400/40 transition-colors">
            <span className="text-[11px] font-medium text-slate-400 uppercase font-semibold block truncate">
              Active Orders
            </span>
            <div className="text-2xl font-bold font-medium text-white mt-1">
              {stats.activeOrdersCount}
            </div>
            <span className="text-[10px] text-slate-500">In-flight POs</span>
          </Card>

          {/* In Production */}
          <Card className="p-4 bg-slate-900/80 border-slate-800 hover:border-indigo-400/40 transition-colors">
            <span className="text-[11px] font-medium text-slate-400 uppercase font-semibold block truncate">
              In Production
            </span>
            <div className="text-2xl font-bold font-medium text-indigo-400 mt-1">
              {stats.inProductionCount}
            </div>
            <span className="text-[10px] text-slate-500">Cut &amp; Sew</span>
          </Card>

          {/* Delayed / Urgent */}
          <Card className={`p-4 bg-slate-900/80 border-slate-800 transition-colors ${
            stats.delayedOrdersCount > 0 ? 'border-rose-500/40 bg-rose-950/20' : ''
          }`}>
            <span className="text-[11px] font-medium text-slate-400 uppercase font-semibold block truncate">
              Critical Attention
            </span>
            <div className={`text-2xl font-bold font-medium mt-1 ${
              stats.delayedOrdersCount > 0 ? 'text-rose-400' : 'text-slate-300'
            }`}>
              {stats.delayedOrdersCount}
            </div>
            <span className="text-[10px] text-slate-500">Ex-factory risks</span>
          </Card>

          {/* Pending Samples */}
          <Card className="p-4 bg-slate-900/80 border-slate-800 hover:border-purple-400/40 transition-colors">
            <span className="text-[11px] font-medium text-slate-400 uppercase font-semibold block truncate">
              Sample Reviews
            </span>
            <div className="text-2xl font-bold font-medium text-purple-400 mt-1">
              {stats.pendingSampleApprovalsCount}
            </div>
            <span className="text-[10px] text-slate-500">Proto / PP review</span>
          </Card>

          {/* Upcoming Ex-Factory */}
          <Card className="p-4 bg-slate-900/80 border-slate-800 hover:border-amber-400/40 transition-colors">
            <span className="text-[11px] font-medium text-slate-400 uppercase font-semibold block truncate">
              Upcoming Ex-Fac
            </span>
            <div className="text-2xl font-bold font-medium text-amber-400 mt-1">
              {stats.upcomingExFactoryCount}
            </div>
            <span className="text-[10px] text-slate-500">Next 45 days</span>
          </Card>

          {/* QC / Shipments */}
          <Card className="p-4 bg-slate-900/80 border-slate-800 hover:border-emerald-400/40 transition-colors">
            <span className="text-[11px] font-medium text-slate-400 uppercase font-semibold block truncate">
              QC &amp; Shipments
            </span>
            <div className="text-2xl font-bold font-medium text-emerald-400 mt-1">
              {stats.upcomingShipmentsCount}
            </div>
            <span className="text-[10px] text-slate-500">AQL audit / Port</span>
          </Card>
        </div>
      )}

      {/* Delayed Orders Callout (if any) */}
      {!isLoading && delayedOrders.length > 0 && (
        <Card className="p-5 bg-rose-950/20 border-rose-800/60 space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-sans font-bold text-sm sm:text-base">
              Urgent Attention Required: {delayedOrders.length} Order(s) Approaching Delivery Deadline
            </h3>
          </div>
          <div className="divide-y divide-rose-900/40 text-xs">
            {delayedOrders.map((order) => (
              <div key={order.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="font-medium font-bold text-white">{order.orderNumber}</span> - {order.productName} ({order.quantity.toLocaleString()} pcs)
                  <div className="text-[11px] text-slate-400">
                    Ex-Factory: <strong className="text-rose-300 font-medium">{order.exFactoryDate}</strong> | Factory: <span className="font-medium">{order.factoryId}</span> | Merchandiser: <span className="font-medium">{order.assignedMerchandiserId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <OrderStatusBadge status={order.currentStatus} size="sm" />
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-rose-800/80 text-rose-300 hover:bg-rose-950">
                      Manage Order
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Content Layout: Orders Table & Operational Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section (2/3): Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-sans font-bold text-white">
                Recent Purchase Orders
              </h2>
              <p className="text-xs text-slate-400">
                Floor status tracking across all buyer accounts.
              </p>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-amber-400 hover:text-amber-300">
                <span>All Orders ({orders.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="p-4 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </Card>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <EmptyState
                title="No Purchase Orders Recorded"
                description="No purchase orders are currently registered in the database."
              />
            </Card>
          ) : (
            <Card className="overflow-hidden border-slate-800 bg-slate-900/80">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase font-medium text-slate-400">
                    <tr>
                      <th className="py-3 px-4">PO &amp; Style</th>
                      <th className="py-3 px-4">Buyer Org</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Ex-Factory</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{order.orderNumber}</span>
                          <span className="text-[11px] text-slate-400 font-sans">{order.styleNumber}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {order.buyerOrganizationId}
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {order.quantity.toLocaleString()} pcs
                        </td>
                        <td className="py-3 px-4">
                          <OrderStatusBadge status={order.currentStatus} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {order.exFactoryDate}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-400 hover:text-amber-300 hover:bg-slate-800">
                              View
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

        {/* Right Section (1/3): Operational Activity & Audit Trail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-sans font-bold text-white">
              Recent Audit Activity
            </h2>
            <Link href="/admin/audit-logs">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-400 hover:text-white">
                <History className="w-3.5 h-3.5" />
                <span>Full Log</span>
              </Button>
            </Link>
          </div>

          <Card className="p-5 bg-slate-900/80 border-slate-800 space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-10 w-full" />
                ))}
              </div>
            ) : auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No recent security events logged.</p>
            ) : (
              <div className="divide-y divide-slate-800/80 space-y-3 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium font-semibold text-amber-400 text-[11px]">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Actor: <span className="text-white font-medium">{log.actorRole}</span> ({log.actorUid})
                    </p>
                    <p className="text-slate-500 text-[10px] font-medium">
                      Target: {log.entityType} ({log.entityId})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
