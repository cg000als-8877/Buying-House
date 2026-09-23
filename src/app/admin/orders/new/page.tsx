'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getBuyerOrganizations } from '@/lib/buyers';
import { getFactories } from '@/lib/factories';
import { getAllUsers } from '@/lib/users';
import { createOrder } from '@/lib/orders';
import { BuyerOrganization } from '@/types/buyer';
import { Factory as FactoryType } from '@/types/factory';
import { User } from '@/types/auth';
import { OrderStatus, PriorityLevel } from '@/types/order';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createOrderSchema } from '@/lib/validation/order.schema';

const APPAREL_CATEGORIES = [
  'Circular Knitwear',
  'Woven Tops & Bottoms',
  'Denim & Washed Apparel',
  'Outerwear & Heavy Jackets',
  'Sweaters & Heavy Knit',
  'Activewear & Athleisure',
];

export default function CreateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultBuyerId = searchParams.get('buyerId') || '';

  const { user } = useAuth();
  const [buyers, setBuyers] = useState<BuyerOrganization[]>([]);
  const [factories, setFactories] = useState<FactoryType[]>([]);
  const [merchandisers, setMerchandisers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    orderNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    buyerOrganizationId: defaultBuyerId,
    styleNumber: '',
    productName: '',
    category: 'Circular Knitwear',
    factoryId: '',
    quantity: 5000,
    currency: 'USD',
    unitPrice: '',
    orderDate: new Date().toISOString().split('T')[0],
    exFactoryDate: '',
    shipmentDate: '',
    priority: 'medium' as PriorityLevel,
    assignedMerchandiserId: 'merch-001',
    currentStatus: 'Order Confirmation' as OrderStatus,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadFormOptions() {
      setIsLoading(true);
      try {
        const [buyersData, factoriesData, usersData] = await Promise.all([
          getBuyerOrganizations(),
          getFactories(),
          getAllUsers(),
        ]);

        if (isMounted) {
          setBuyers(buyersData);
          setFactories(factoriesData);
          setMerchandisers(usersData.filter((u) => u.role === 'Merchandiser' || u.role === 'Operations Manager' || u.role === 'Super Admin'));

          // Default assignments if not set
          if (!formData.buyerOrganizationId && buyersData.length > 0) {
            setFormData((prev) => ({ ...prev, buyerOrganizationId: buyersData[0].id }));
          }
          if (!formData.factoryId && factoriesData.length > 0) {
            setFormData((prev) => ({ ...prev, factoryId: factoriesData[0].id }));
          }
        }
      } catch (error) {
        console.error('Error loading order form options:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFormOptions();

    return () => {
      isMounted = false;
    };
  }, [defaultBuyerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const validationResult = createOrderSchema.safeParse({
      orderNumber: formData.orderNumber,
      buyerOrganizationId: formData.buyerOrganizationId,
      styleNumber: formData.styleNumber,
      productName: formData.productName,
      category: formData.category,
      factoryId: formData.factoryId,
      quantity: Number(formData.quantity),
      currency: formData.currency,
      unitPrice: formData.unitPrice ? Number(formData.unitPrice) : undefined,
      orderDate: formData.orderDate,
      exFactoryDate: formData.exFactoryDate,
      priority: formData.priority,
      assignedMerchandiserId: formData.assignedMerchandiserId,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const newOrder = await createOrder(
        {
          orderNumber: formData.orderNumber,
          buyerOrganizationId: formData.buyerOrganizationId,
          styleNumber: formData.styleNumber,
          productName: formData.productName,
          category: formData.category,
          factoryId: formData.factoryId,
          quantity: Number(formData.quantity),
          currency: formData.currency,
          unitPrice: formData.unitPrice ? Number(formData.unitPrice) : undefined,
          orderDate: formData.orderDate,
          exFactoryDate: formData.exFactoryDate,
          shipmentDate: formData.shipmentDate || undefined,
          priority: formData.priority,
          assignedMerchandiserId: formData.assignedMerchandiserId,
          currentStatus: formData.currentStatus,
        },
        user ? { uid: user.uid, role: user.role } : undefined
      );

      router.push(`/admin/orders/${newOrder.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      setFormErrors({ submit: 'Failed to create order. Please verify inputs and permissions.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Link href="/admin/dashboard" className="text-slate-400 hover:text-white">
            Dashboard
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/admin/orders" className="text-slate-400 hover:text-white">
            Orders
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-amber-400 font-bold">New Purchase Order</span>
        </div>

        <Link href="/admin/orders">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </Button>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-sans font-bold text-white">
          Create Purchase Order
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Register a purchase order, assign manufacturing line capacity, and schedule production milestones.
        </p>
      </div>

      {/* Form Card */}
      <Card className="p-6 sm:p-8 bg-slate-900/90 border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formErrors.submit && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
              {formErrors.submit}
            </div>
          )}

          {/* Section 1: Order Identification & Client */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-amber-400 font-bold pb-2 border-b border-slate-800">
              1. Order Identification &amp; Tenant Assignment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Buyer Organization <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.buyerOrganizationId}
                  onChange={(e) => setFormData({ ...formData, buyerOrganizationId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  {buyers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.id})
                    </option>
                  ))}
                </select>
                {formErrors.buyerOrganizationId && (
                  <p className="text-[11px] text-rose-400">{formErrors.buyerOrganizationId}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  PO Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="PO-2026-XXXX"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
                {formErrors.orderNumber && (
                  <p className="text-[11px] text-rose-400">{formErrors.orderNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Product Specifications */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-amber-400 font-bold pb-2 border-b border-slate-800">
              2. Product &amp; Garment Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Style Code / Reference <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STY-KNIT-402"
                  value={formData.styleNumber}
                  onChange={(e) => setFormData({ ...formData, styleNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
                {formErrors.styleNumber && (
                  <p className="text-[11px] text-rose-400">{formErrors.styleNumber}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Product Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                >
                  {APPAREL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Product Name / Description <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 240 GSM Combed Cotton Heavyweight Crewneck T-Shirt"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
              />
              {formErrors.productName && (
                <p className="text-[11px] text-rose-400">{formErrors.productName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Total Order Quantity (pcs) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
                {formErrors.quantity && (
                  <p className="text-[11px] text-rose-400">{formErrors.quantity}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Target FOB Unit Price (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 4.50"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Manufacturing & Operations Allocation */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-amber-400 font-bold pb-2 border-b border-slate-800">
              3. Factory Allocation &amp; Merchandising Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Assigned Factory Unit <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.factoryId}
                  onChange={(e) => setFormData({ ...formData, factoryId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  {factories.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.location.split(',')[0]})
                    </option>
                  ))}
                </select>
                {formErrors.factoryId && (
                  <p className="text-[11px] text-rose-400">{formErrors.factoryId}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Assigned Merchandiser <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.assignedMerchandiserId}
                  onChange={(e) => setFormData({ ...formData, assignedMerchandiserId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  {merchandisers.map((m) => (
                    <option key={m.uid} value={m.uid}>
                      {m.displayName} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Order Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Ex-Factory Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.exFactoryDate}
                  onChange={(e) => setFormData({ ...formData, exFactoryDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
                {formErrors.exFactoryDate && (
                  <p className="text-[11px] text-rose-400">{formErrors.exFactoryDate}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Target Port Dispatch
                </label>
                <input
                  type="date"
                  value={formData.shipmentDate}
                  onChange={(e) => setFormData({ ...formData, shipmentDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Standard</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent / Critical Line</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Initial Workflow Stage
                </label>
                <select
                  value={formData.currentStatus}
                  onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value as OrderStatus })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Order Confirmation">Order Confirmation</option>
                  <option value="Inquiry">Inquiry</option>
                  <option value="Sampling">Sampling</option>
                  <option value="Material">Material</option>
                  <option value="Production">Production</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
            <Link href="/admin/orders">
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering Order...' : 'Create & Register Order'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
