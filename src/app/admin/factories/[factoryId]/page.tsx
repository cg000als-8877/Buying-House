'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Mail,
  Phone,
  ArrowRight,
  Info,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getFactoryById, updateFactory } from '@/lib/factories';
import { getAllOrders } from '@/lib/orders';
import { Factory as FactoryType } from '@/types/factory';
import { Order } from '@/types/order';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/buyer/OrderStatusBadge';

export default function AdminFactoryDetailPage() {
  const params = useParams();
  const factoryId = typeof params?.factoryId === 'string' ? params.factoryId : Array.isArray(params?.factoryId) ? params.factoryId[0] : '';

  const { user } = useAuth();
  const [factory, setFactory] = useState<FactoryType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadFactory() {
      if (!factoryId) return;
      setIsLoading(true);
      try {
        const [factoryData, allOrdersData] = await Promise.all([
          getFactoryById(factoryId),
          getAllOrders(),
        ]);

        if (isMounted) {
          setFactory(factoryData);
          setOrders(allOrdersData.filter((o) => o.factoryId === factoryId));
        }
      } catch (error) {
        console.error('Error fetching factory details:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFactory();

    return () => {
      isMounted = false;
    };
  }, [factoryId]);

  const handleStatusChange = async (newStatus: 'active' | 'audited' | 'inactive') => {
    if (!factory || !user) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateFactory(
        factory.id,
        { status: newStatus },
        { uid: user.uid, role: user.role }
      );
      if (updated) {
        setFactory(updated);
      }
    } catch (error) {
      console.error('Error updating factory status:', error);
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
      </div>
    );
  }

  if (!factory) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Card className="p-12 text-center space-y-4 border-slate-800">
          <EmptyState
            title="Manufacturing Unit Not Found"
            description="The requested factory profile could not be located in the database."
          />
          <Link href="/admin/factories">
            <Button variant="primary" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Factories Directory</span>
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isAudited = factory.status === 'audited';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-white">
            Dashboard
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/admin/factories" className="text-slate-400 hover:text-white">
            Factories
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-amber-400 font-bold">{factory.name}</span>
        </div>

        <Link href="/admin/factories">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Factories</span>
          </Button>
        </Link>
      </div>

      {/* Main Factory Banner */}
      <Card className="p-6 sm:p-8 bg-slate-900/90 border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 px-2.5 py-1 rounded-md bg-amber-400/10 border border-amber-400/20">
                UNIT ID: {factory.id}
              </span>
              <Badge variant={isAudited ? 'emerald' : 'blue'} size="md" dot>
                {factory.status.toUpperCase()}
              </Badge>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                VERIFIED PARTNER
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {factory.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {factory.location}
              </span>
              <span>•</span>
              <span>Capacity: <strong className="text-white font-mono">{factory.capacity}</strong></span>
              {factory.employeeCount && (
                <>
                  <span>•</span>
                  <span>Workforce: <strong className="text-slate-200 font-mono">{factory.employeeCount.toLocaleString()} workers</strong></span>
                </>
              )}
            </p>
          </div>

          {/* Status Mutator */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 shrink-0">
            <span className="text-[11px] font-mono text-slate-400 block">Unit Compliance Status:</span>
            <select
              value={factory.status}
              disabled={isUpdatingStatus}
              onChange={(e) => handleStatusChange(e.target.value as 'audited' | 'active' | 'inactive')}
              className="w-full px-2.5 py-1 text-xs bg-slate-900 rounded border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-400"
            >
              <option value="audited">Verified Audited</option>
              <option value="active">Active Operations</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Information Dissection: Public vs Internal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Public Information Card */}
        <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              <h2 className="font-serif font-bold text-base text-white">
                Public Capability &amp; Compliance Data
              </h2>
            </div>
            <Badge variant="blue" size="sm">
              Public Buyer Visible
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-1.5 font-mono text-[11px] uppercase">
                Core Specializations:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {factory.specializations.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded bg-slate-950 text-slate-200 border border-slate-800 font-mono text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60">
              <span className="text-slate-400 block mb-1.5 font-mono text-[11px] uppercase">
                Audited Social &amp; Quality Certifications:
              </span>
              <div className="flex flex-wrap gap-2">
                {factory.certificationIds.map((c) => (
                  <Badge key={c} variant="emerald" size="sm" dot>
                    {c}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60">
              <span className="text-slate-400 block font-mono text-[11px] uppercase">
                Monthly Throughput Capacity:
              </span>
              <p className="text-sm font-mono font-bold text-white mt-0.5">
                {factory.capacity}
              </p>
            </div>
          </div>
        </Card>

        {/* Internal Operational Information Card */}
        <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <h2 className="font-serif font-bold text-base text-white">
                Internal Operational &amp; Contact Telemetry
              </h2>
            </div>
            <Badge variant="amber" size="sm">
              Staff Clearance Only
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            {factory.contactInformation && (
              <div className="space-y-1.5">
                <span className="text-slate-400 block font-mono text-[11px] uppercase">
                  Primary Floor Liaison:
                </span>
                <p className="font-semibold text-white">
                  {factory.contactInformation.contactPerson || 'Not assigned'}
                </p>
                <div className="flex flex-col gap-1 text-slate-300 font-mono pt-1">
                  {factory.contactInformation.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      {factory.contactInformation.email}
                    </span>
                  )}
                  {factory.contactInformation.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {factory.contactInformation.phone}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/60">
              <span className="text-slate-400 block font-mono text-[11px] uppercase mb-1">
                Internal Line Notes &amp; Capabilities Assessment:
              </span>
              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 leading-relaxed">
                {factory.internalNotes || 'No internal remarks recorded.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Allocated Purchase Orders Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-white">
              Allocated Purchase Orders ({orders.length})
            </h2>
            <p className="text-xs text-slate-400">
              Active production orders running across this factory unit.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="p-8 text-center bg-slate-900/80 border-slate-800">
            <p className="text-xs text-slate-500">
              No purchase orders are currently scheduled on this manufacturing floor.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden border-slate-800 bg-slate-900/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase font-mono text-slate-400">
                  <tr>
                    <th className="py-3 px-4">PO &amp; Style</th>
                    <th className="py-3 px-4">Buyer Organization</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Ex-Factory</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {orders.map((order) => (
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
                      <td className="py-3 px-4 font-sans">
                        <OrderStatusBadge status={order.currentStatus} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-300">
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
  );
}
