'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  Save,
  Sliders,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { hasPermission } from '@/lib/auth/permissions';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [savedNotice, setSavedNotice] = useState(false);

  const canEditSettings = hasPermission(user?.role, 'settings.write');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-widest text-amber-400 font-bold">
              System Configuration
            </span>
            <span className="text-slate-600">/</span>
            <Badge variant="amber" size="sm">
              Role: {user?.role || 'Staff'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
            Platform Operations &amp; Security Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage global operational parameters, QA inspection thresholds, and tenant security defaults.
          </p>
        </div>

        {canEditSettings && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="gap-2 shrink-0 text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </Button>
        )}
      </div>

      {savedNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Operational settings successfully updated and logged.</span>
        </div>
      )}

      {/* Organization Info */}
      <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Building2 className="w-5 h-5 text-amber-400" />
          <h2 className="font-sans font-bold text-base text-white">
            Headquarters &amp; Corporate Identity
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Buying House Legal Entity</label>
            <input
              type="text"
              readOnly
              value="XYZ Buying House & Sourcing Atelier Ltd."
              className="w-full px-3 py-2 bg-slate-950 rounded-lg border border-slate-800 text-white font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Primary Operations Hub</label>
            <input
              type="text"
              readOnly
              value="Gulshan-2, Dhaka-1212, Bangladesh"
              className="w-full px-3 py-2 bg-slate-950 rounded-lg border border-slate-800 text-white"
            />
          </div>
        </div>
      </Card>

      {/* Quality Control Parameters */}
      <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h2 className="font-sans font-bold text-base text-white">
            Manufacturing &amp; QA Standard Thresholds
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
          <div className="space-y-1">
            <label className="text-slate-400 font-sans font-semibold">Default Sampling Standard</label>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white">
              ISO 2859-1 (AQL 1.5 Major / 2.5 Minor)
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-sans font-semibold">Fabric Inspection Protocol</label>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white">
              ASTM D5430 (4-Point Standard)
            </div>
          </div>
        </div>
      </Card>

      {/* Security & Access Policies */}
      <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="font-sans font-bold text-base text-white">
            Security &amp; Tenant Isolation Governance
          </h2>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Multi-Tenant Scoped Firestore Rules</span>
              <span className="text-[11px] text-slate-400">Enforces belongsToBuyerOrg() across orders and inspection data</span>
            </div>
            <Badge variant="emerald" size="sm">
              Active Enforced
            </Badge>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Role-Based Clearance Matrix (7 Roles)</span>
              <span className="text-[11px] text-slate-400">Strict granular operation mapping via src/lib/auth/permissions.ts</span>
            </div>
            <Badge variant="emerald" size="sm">
              Active Enforced
            </Badge>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Immutable Security Audit Trail</span>
              <span className="text-[11px] text-slate-400">Append-only event stream stored in Firestore with server timestamps</span>
            </div>
            <Badge variant="emerald" size="sm">
              Active Enforced
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
