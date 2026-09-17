'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  Plus,
  ArrowRight,
  Globe,
  Mail,
  Phone,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getBuyerOrganizations, createBuyerOrganization } from '@/lib/buyers';
import { getAllOrders } from '@/lib/orders';
import { BuyerOrganization, BuyerOrgStatus } from '@/types/buyer';
import { Order } from '@/types/order';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminBuyersPage() {
  const { user } = useAuth();
  const [buyers, setBuyers] = useState<BuyerOrganization[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BuyerOrgStatus>('ALL');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    status: 'active' as BuyerOrgStatus,
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [buyersData, ordersData] = await Promise.all([
          getBuyerOrganizations(),
          getAllOrders(),
        ]);

        if (isMounted) {
          setBuyers(buyersData);
          setOrders(ordersData);
        }
      } catch (error) {
        console.error('Error loading buyer directory:', error);
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

  const filteredBuyers = useMemo(() => {
    return buyers.filter((buyer) => {
      if (statusFilter !== 'ALL' && buyer.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = buyer.name.toLowerCase().includes(q);
        const matchesCountry = buyer.country.toLowerCase().includes(q);
        const matchesEmail = buyer.contactEmail.toLowerCase().includes(q);
        const matchesId = buyer.id.toLowerCase().includes(q);
        return matchesName || matchesCountry || matchesEmail || matchesId;
      }
      return true;
    });
  }, [buyers, searchQuery, statusFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contactEmail.trim() || !formData.country.trim()) {
      setFormError('Organization name, country, and contact email are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const created = await createBuyerOrganization(
        {
          name: formData.name.trim(),
          country: formData.country.trim(),
          website: formData.website.trim() || undefined,
          contactEmail: formData.contactEmail.trim(),
          contactPhone: formData.contactPhone.trim() || undefined,
          status: formData.status,
          notes: formData.notes.trim() || undefined,
        },
        user ? { uid: user.uid, role: user.role } : undefined
      );

      setBuyers((prev) => [created, ...prev]);
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        country: '',
        website: '',
        contactEmail: '',
        contactPhone: '',
        status: 'active',
        notes: '',
      });
    } catch (err) {
      setFormError('Failed to create buyer organization. Please check permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActiveOrdersCount = (orgId: string) => {
    return orders.filter(
      (o) => o.buyerOrganizationId === orgId && o.currentStatus !== 'Completed' && o.currentStatus !== 'Cancelled'
    ).length;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-widest text-amber-400 font-bold">
              Client Directory
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-medium text-slate-400">{buyers.length} Organizations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
            Buyer Organizations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Provision and manage tenant organizations, assigned accounts, and historical order volumes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 shrink-0 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision Buyer Organization</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 bg-slate-900/80 border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company name, country, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 text-white placeholder:text-slate-600"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | BuyerOrgStatus)}
              className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-400 text-white"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="pending">Pending Approval</option>
              <option value="inactive">Inactive / Suspended</option>
            </select>
          </div>
        </div>

        {(searchQuery || statusFilter !== 'ALL') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">
              Showing <strong className="text-white font-medium">{filteredBuyers.length}</strong> of {buyers.length} organizations
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

      {/* Buyer Directory Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-6 space-y-3">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-3 w-1/2" />
            </Card>
          ))}
        </div>
      ) : filteredBuyers.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            title="No Buyer Organizations Found"
            description="No client accounts match your current filter criteria."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-800 bg-slate-900/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase font-medium text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Organization Name</th>
                  <th className="py-3.5 px-4">Country</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Active POs</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBuyers.map((org) => {
                  const activeCount = getActiveOrdersCount(org.id);
                  const isPending = org.status === 'pending';
                  const isActive = org.status === 'active';

                  return (
                    <tr key={org.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white block text-sm">{org.name}</span>
                        <span className="text-[10px] font-medium text-slate-500">ID: {org.id}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {org.country}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 space-y-0.5">
                        <div className="flex items-center gap-1.5 font-medium text-[11px] text-slate-300">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{org.contactEmail}</span>
                        </div>
                        {org.contactPhone && (
                          <div className="flex items-center gap-1.5 font-medium text-[10px] text-slate-500">
                            <Phone className="w-3 h-3 text-slate-600" />
                            <span>{org.contactPhone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={isActive ? 'emerald' : isPending ? 'amber' : 'rose'}
                          size="sm"
                          dot
                        >
                          {org.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {activeCount} Active
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/admin/buyers/${org.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs text-amber-400 border-slate-700 hover:bg-slate-800"
                          >
                            <span>Manage</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Provision Buyer Organization Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">
                    Provision Buyer Organization
                  </h3>
                  <p className="text-xs text-slate-400">Creates a new isolated tenant boundary</p>
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
                  Company Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nordic Trend House A/S"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Country <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Denmark"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BuyerOrgStatus })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending Review</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Contact Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sourcing@example.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+45 33 12 34 56"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://company.example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Internal Notes &amp; Sourcing Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="Category focus, fabric requirements, delivery terms..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  {isSubmitting ? 'Provisioning...' : 'Provision Organization'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
