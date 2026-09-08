'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { BuyerOrder } from '@/components/buyer/OrderCard';

export interface OrderEditorProps {
  isOpen: boolean;
  onClose: () => void;
  order?: BuyerOrder | null;
  onSave: (updated: BuyerOrder) => void;
}

export function OrderEditor({ isOpen, onClose, order, onSave }: OrderEditorProps) {
  const [formData, setFormData] = useState<BuyerOrder>(
    order || {
      id: `ord-${Date.now()}`,
      orderNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      styleName: '',
      category: 'Knitwear',
      quantity: 500,
      fobPrice: '$8.50',
      totalValue: '$4,250',
      currentStage: 'Fabric Sourcing & Lab-Dip',
      progressPercent: 20,
      estShipDate: 'Nov 20, 2026',
      factoryName: 'Apex Eco Textiles (Dhaka)',
      thumbnail: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
      status: 'In Production',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Edit Order ${order.orderNumber}` : 'Create New Buyer Purchase Order'}
      description="Update manufacturing milestones, assigned factory, and quantities."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Style / Product Name"
            required
            value={formData.styleName}
            onChange={(e) => setFormData({ ...formData, styleName: e.target.value })}
            placeholder="e.g. Heavyweight Boxy Tee"
          />

          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[
              { value: 'Knitwear', label: 'Knitwear' },
              { value: 'Woven', label: 'Woven' },
              { value: 'Denim', label: 'Denim' },
              { value: 'Activewear', label: 'Activewear' },
              { value: 'Outerwear', label: 'Outerwear' },
            ]}
          />

          <Input
            label="Total Quantity (Units)"
            type="number"
            required
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
          />

          <Input
            label="Target FOB Price per Unit"
            value={formData.fobPrice}
            onChange={(e) => setFormData({ ...formData, fobPrice: e.target.value })}
            placeholder="$7.50 USD"
          />

          <Input
            label="Assigned Factory Partner"
            value={formData.factoryName}
            onChange={(e) => setFormData({ ...formData, factoryName: e.target.value })}
          />

          <Select
            label="Current Order Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as BuyerOrder['status'] })}
            options={[
              { value: 'In Production', label: 'In Production' },
              { value: 'Sample Approved', label: 'Sample Approved' },
              { value: 'Inspection Passed', label: 'Inspection Passed' },
              { value: 'Shipped', label: 'Shipped' },
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Production Progress ({formData.progressPercent}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.progressPercent}
            onChange={(e) => setFormData({ ...formData, progressPercent: parseInt(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gold" size="sm">
            Save Order Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
