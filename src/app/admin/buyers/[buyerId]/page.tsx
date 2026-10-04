'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Calendar,
  Users,
  Package,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getBuyerOrganizationById, updateBuyerOrganization } from '@/lib/buyers';
import { getOrdersByBuyerOrg } from '@/lib/orders';
import { getAllUsers } from '@/lib/users';
import { BuyerOrganization, BuyerOrgStatus } from '@/types/buyer';
import { Order } from '@/types/order';
import { User } from '@/types/auth';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/buyer/OrderStatusBadge';

export default function AdminBuyerDetailPage() {
  const params = useParams();
  const buyerId = typeof params?.buyerId === 'string' ? params.buyerId : Array.isArray(params?.buyerId) ? params.buyerId[0] : '';

  const { user } = useAuth();
  const [org, setOrg] = useState<BuyerOrganization | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [buyerUsers, setBuyerUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadBuyerDetails() {
      if (!buyerId) return;
      setIsLoading(true);
      try {
        const [orgData, ordersData, allUsersData] = await Promise.all([
          getBuyerOrganizationById(buyerId),
          getOrdersByBuyerOrg(buyerId),
          getAllUsers(),
        ]);

        if (isMounted) {
          setOrg(orgData);
          setOrders(ordersData);
          setBuyerUsers(allUsersData.filter((u) => u.buyerOrganizationId === buyerId));
        }
      } catch (error) {
        console.error('Error fetching buyer details:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBuyerDetails();

    return () => {
      isMounted = false;
    };
  }, [buyerId]);

  const handleStatusChange = async (newStatus: BuyerOrgStatus) => {
    if (!org || !user) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateBuyerOrganization(
        org.id,
        { status: newStatus },
        { uid: user.uid, role: user.role }
      );
      if (updated) {
        setOrg(updated);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 lg:col-span-2">
            <Skeleton className="h-32 w-full" />
          </Card>
          <Card className="p-6 space-y-4">
            <Skeleton className="h-32 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Card className="p-12 text-center space-y-4 border-border">
          <EmptyState
            title="Buyer Organization Not Found"
            description="The requested organization record could not be found in the database."
          />
          <Link href="/admin/buyers">
            <Button variant="primary" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Buyer Directory</span>
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const activeOrders = orders.filter(
    (o) => o.currentStatus !== 'Completed' && o.currentStatus !== 'Cancelled'
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Link href="/admin/dashboard" className="text-muted-foreground hover:text-white">
            Dashboard
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/admin/buyers" className="text-muted-foreground hover:text-white">
            Buyers
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-amber-400 font-bold">{org.name}</span>
        </div>

        <Link href="/admin/buyers">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Buyers</span>
          </Button>
        </Link>
      </div>

      {/* Main Organization Header Banner */}
      <Card className="p-6 sm:p-8 bg-card border-border space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium font-bold text-amber-400 px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-400/20">
                TENANT: {org.id}
              </span>
              <Badge
                variant={org.status === 'active' ? 'emerald' : org.status === 'pending' ? 'amber' : 'rose'}
                size="md"
               
              >
                {org.status.toUpperCase()} ACCOUNT
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">
                Country: <strong className="text-white">{org.country}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
              {org.name}
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Created: <strong className="text-muted-foreground font-medium">{new Date(org.createdAt).toLocaleDateString()}</strong></span>
              <span className="text-slate-700">|</span>
              <span>Active POs: <strong className="text-amber-400 font-medium">{activeOrders.length}</strong></span>
              <span className="text-slate-700">|</span>
              <span>Registered Reps: <strong className="text-muted-foreground font-medium">{buyerUsers.length}</strong></span>
            </p>
          </div>

          {/* Quick Actions / Status Toggle */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <Link href={`/admin/orders/new?buyerId=${org.id}`}>
              <Button variant="primary" size="sm" className="gap-2 text-xs w-full justify-center">
                <Plus className="w-3.5 h-3.5" />
                <span>Create Purchase Order</span>
              </Button>
            </Link>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">Account State:</span>
              <select
                value={org.status}
                disabled={isUpdatingStatus}
                onChange={(e) => handleStatusChange(e.target.value as BuyerOrgStatus)}
                className="px-2 py-1 text-xs bg-card rounded border border-border text-white focus:outline-none focus:border-amber-400"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Details, Representatives, and Purchase Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (1/3): Organization Specs & Users */}
        <div className="space-y-6">
          {/* Contact & Profile */}
          <Card className="p-6 bg-card border-border space-y-4">
            <h3 className="font-sans font-bold text-base text-white pb-2 border-b border-border">
              Organization Information
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-muted-foreground">Contact Email:</span>
                <span className="font-medium text-white flex items-center gap-1">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  {org.contactEmail}
                </span>
              </div>

              {org.contactPhone && (
                <div className="flex justify-between items-center py-1 border-b border-border">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium text-muted-foreground">{org.contactPhone}</span>
                </div>
              )}

              {org.website && (
                <div className="flex justify-between items-center py-1 border-b border-border">
                  <span className="text-muted-foreground">Website:</span>
                  <a
                    href={org.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-amber-400 hover:underline flex items-center gap-1 truncate max-w-[160px]"
                  >
                    <Globe className="w-3 h-3" />
                    {org.website.replace('https://', '')}
                  </a>
                </div>
              )}

              <div className="pt-2 space-y-1">
                <span className="text-muted-foreground block">Sourcing Notes:</span>
                <p className="text-xs text-muted-foreground bg-card p-3 rounded-lg border border-border leading-relaxed">
                  {org.notes || 'No internal notes recorded for this buyer organization.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Associated Buyer Users */}
          <Card className="p-6 bg-card border-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="font-sans font-bold text-base text-white">
                  Buyer Representatives ({buyerUsers.length})
                </h3>
              </div>
            </div>

            {buyerUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                No user accounts currently linked to this tenant ID.
              </p>
            ) : (
              <div className="divide-y divide-slate-800/80 space-y-2 text-xs">
                {buyerUsers.map((u) => (
                  <div key={u.uid} className="pt-2 first:pt-0 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{u.displayName}</p>
                      <p className="text-[11px] font-medium text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant={u.status === 'active' ? 'emerald' : 'amber'} size="sm">
                      {u.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (2/3): Purchase Orders List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-sans font-bold text-white">
                Purchase Orders ({orders.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                All manufacturing orders associated with this buyer organization.
              </p>
            </div>
            <Link href={`/admin/orders/new?buyerId=${org.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-amber-400 border-border">
                <Plus className="w-3.5 h-3.5" />
                <span>New PO</span>
              </Button>
            </Link>
          </div>

          {orders.length === 0 ? (
            <Card className="p-12 text-center">
              <EmptyState
                title="No Orders Associated"
                description="This organization does not currently have any registered purchase orders."
              />
            </Card>
          ) : (
            <Card className="overflow-hidden border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-muted-foreground">
                  <thead className="bg-card border-b border-border text-[11px] uppercase font-medium text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4">PO &amp; Style</th>
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Ex-Factory</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{order.orderNumber}</span>
                          <span className="text-[11px] text-muted-foreground font-sans">{order.styleNumber}</span>
                        </td>
                        <td className="py-3 px-4 text-foreground font-sans truncate max-w-[180px]">
                          {order.productName}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {order.quantity.toLocaleString()} pcs
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <OrderStatusBadge status={order.currentStatus} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {order.exFactoryDate}
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-400 hover:text-amber-300">
                              <span>Manage</span>
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
      </div>
    </div>
  );
}
