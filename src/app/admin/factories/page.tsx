'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Factory,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  MapPin,
  RotateCcw,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getFactories, createFactory } from '@/lib/factories';
import { getAllOrders } from '@/lib/orders';
import { Factory as FactoryType } from '@/types/factory';
import { Order } from '@/types/order';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminFactoriesPage() {
  const { user } = useAuth();
  const [factories, setFactories] = useState<FactoryType[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    specializations: 'Circular Knitwear, Single Jersey, Heavy Fleece',
    capacity: '800,000 pcs / month',
    employeeCount: 2500,
    certificationIds: 'OEKO-TEX-100, WRAP-GOLD, SEDEX-SMETA',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    status: 'audited' as 'active' | 'audited' | 'inactive',
    internalNotes: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [factoriesData, ordersData] = await Promise.all([
          getFactories(),
          getAllOrders(),
        ]);

        if (isMounted) {
          setFactories(factoriesData);
          setOrders(ordersData);
        }
      } catch (error) {
        console.error('Error loading factories:', error);
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

  const filteredFactories = useMemo(() => {
    return factories.filter((factory) => {
      if (statusFilter !== 'ALL' && factory.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = factory.name.toLowerCase().includes(q);
        const matchesLoc = factory.location.toLowerCase().includes(q);
        const matchesSpecs = factory.specializations.some((s) => s.toLowerCase().includes(q));
        const matchesId = factory.id.toLowerCase().includes(q);
        return matchesName || matchesLoc || matchesSpecs || matchesId;
      }
      return true;
    });
  }, [factories, searchQuery, statusFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      setFormError('Factory name and location are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const created = await createFactory(
        {
          name: formData.name.trim(),
          location: formData.location.trim(),
          specializations: formData.specializations.split(',').map((s) => s.trim()).filter(Boolean),
          capacity: formData.capacity.trim(),
          employeeCount: Number(formData.employeeCount) || undefined,
          certificationIds: formData.certificationIds.split(',').map((c) => c.trim()).filter(Boolean),
          contactInformation: {
            contactPerson: formData.contactPerson.trim() || undefined,
            email: formData.contactEmail.trim() || undefined,
            phone: formData.contactPhone.trim() || undefined,
          },
          status: formData.status,
          internalNotes: formData.internalNotes.trim() || undefined,
        },
        user ? { uid: user.uid, role: user.role } : undefined
      );

      setFactories((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        location: '',
        specializations: '',
        capacity: '',
        employeeCount: 0,
        certificationIds: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        status: 'audited',
        internalNotes: '',
      });
    } catch (err) {
      setFormError('Failed to register manufacturing unit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFactoryActiveOrders = (factoryId: string) => {
    return orders.filter(
      (o) => o.factoryId === factoryId && o.currentStatus !== 'Completed' && o.currentStatus !== 'Cancelled'
    ).length;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              Manufacturing Units
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">{factories.length} Registered Units</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Partner Factories Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manufacturing capacity registry, verified audit status, and technical specialization metrics.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 shrink-0 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register Factory Unit</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 bg-slate-900/80 border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by factory name, division, specialization..."
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
              <option value="ALL">All Audit Statuses</option>
              <option value="audited">Verified Audited Units</option>
              <option value="active">Active Operations</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {(searchQuery || statusFilter !== 'ALL') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">
              Showing <strong className="text-white font-mono">{filteredFactories.length}</strong> of {factories.length} factories
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="flex items-center gap-1 text-amber-400 hover:underline text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </Card>

      {/* Factories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredFactories.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            title="No Factories Found"
            description="No manufacturing units match your current filter parameters."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFactories.map((factory) => {
            const activeCount = getFactoryActiveOrders(factory.id);
            const isAudited = factory.status === 'audited';

            return (
              <Card
                key={factory.id}
                className="p-6 bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase block">
                        {factory.id}
                      </span>
                      <h3 className="font-serif font-bold text-base text-white hover:text-amber-400 transition-colors">
                        <Link href={`/admin/factories/${factory.id}`}>
                          {factory.name}
                        </Link>
                      </h3>
                    </div>
                    <Badge variant={isAudited ? 'emerald' : 'blue'} size="sm" dot>
                      {factory.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{factory.location}</span>
                  </div>

                  {/* Specializations Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {factory.specializations.slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {spec}
                      </span>
                    ))}
                    {factory.specializations.length > 3 && (
                      <span className="text-[10px] font-mono text-slate-500 px-1 py-0.5">
                        +{factory.specializations.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-mono">Monthly Capacity</span>
                      <strong className="text-white font-mono text-[11px]">{factory.capacity}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-mono">Active POs</span>
                      <strong className="text-amber-400 font-mono text-[11px]">{activeCount} Orders</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    {factory.certificationIds.length} Certifications
                  </span>
                  <Link href={`/admin/factories/${factory.id}`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs text-amber-400 border-slate-700">
                      <span>View Profile</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Register Factory Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Factory className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">
                    Register Manufacturing Unit
                  </h3>
                  <p className="text-xs text-slate-400">Technical capacity &amp; compliance profile</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 pt-0 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Factory Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Composite Knitwear Ltd."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Location (Division / Industrial Hub) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gazipur, Dhaka Division, Bangladesh"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Monthly Capacity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1,000,000 pcs / month"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Audit Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'audited' | 'active' | 'inactive' })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="audited">Verified Audited</option>
                    <option value="active">Active Operations</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Specializations (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Circular Knitwear, Single Jersey, Heavy Fleece"
                  value={formData.specializations}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Certifications (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. OEKO-TEX-100, WRAP-GOLD, SEDEX-SMETA"
                  value={formData.certificationIds}
                  onChange={(e) => setFormData({ ...formData, certificationIds: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Internal Operational Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Equipment specs, line configurations, audit remarks..."
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register Factory'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
