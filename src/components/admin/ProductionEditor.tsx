'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Milestone } from '@/components/buyer/ProductionTimeline';

export interface ProductionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  milestone?: Milestone | null;
  onSave: (updated: Milestone) => void;
}

export function ProductionEditor({ isOpen, onClose, milestone, onSave }: ProductionEditorProps) {
  const [formData, setFormData] = useState<Milestone>(
    milestone || {
      id: `ms-${Date.now()}`,
      title: 'Knitting & Yarn Dyeing',
      department: 'Knitting Mill',
      targetDate: 'Oct 15, 2026',
      actualDate: '',
      status: 'In Progress',
      notes: 'Yarn received from spinning mill. Dyeing lab-dip shade #4 approved.',
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
      title={milestone ? `Edit Milestone: ${milestone.title}` : 'Add New Production Milestone'}
      description="Update timeline target dates, QA sign-offs, and merchandiser notes."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Milestone Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Bulk Fabric Cutting"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Department / Unit"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="Cutting Dept"
          />

          <Select
            label="Stage Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            options={[
              { value: 'Upcoming', label: 'Upcoming' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Completed', label: 'Completed' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Target Date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            placeholder="Nov 02, 2026"
          />

          <Input
            label="Actual Completed Date"
            value={formData.actualDate || ''}
            onChange={(e) => setFormData({ ...formData, actualDate: e.target.value })}
            placeholder="Leave empty if in progress"
          />
        </div>

        <Textarea
          label="Merchandiser Note for Buyer"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="e.g. 100% fabric inspected at 4-point system. Zero shade variation detected."
        />

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gold" size="sm">
            Save Milestone
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
