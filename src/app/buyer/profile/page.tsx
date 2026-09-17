'use client';

import React from 'react';
import {
  Building2,
  User,
  ShieldCheck,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function BuyerProfilePage() {
  const { user, signOut } = useAuth();

  const buyerOrgId = user?.buyerOrganizationId || 'buyer-org-001';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-widest text-primary font-bold">
              Account Settings
            </span>
            <span className="text-muted-foreground/60">/</span>
            <Badge variant="emerald" size="sm">
              Verified Buyer
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold text-foreground tracking-tight">
            Buyer Profile &amp; Organization
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account details and review your isolated tenant organization credentials.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="gap-2 shrink-0 text-muted-foreground hover:text-rose-400 hover:border-rose-800/60"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organization Information Card */}
        <Card className="p-6 bg-card/80 border-border/80 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-foreground">
                Buyer Organization Tenant
              </h2>
              <p className="text-xs text-muted-foreground">Scoped data isolation workspace</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">Organization Tenant ID:</span>
              <Badge variant="blue" size="sm" className="font-medium font-bold">
                {buyerOrgId}
              </Badge>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">Tenant Access Scope:</span>
              <span className="font-medium text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Isolated Workspace
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">Account Status:</span>
              <span className="font-medium text-foreground font-semibold">Active &amp; Verified</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Assigned Merchandising Hub:</span>
              <span className="font-medium text-foreground">Dhaka Operational Office</span>
            </div>
          </div>
        </Card>

        {/* User Identity Card */}
        <Card className="p-6 bg-card/80 border-border/80 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-foreground">
                User Identity &amp; Credentials
              </h2>
              <p className="text-xs text-muted-foreground">Authenticated representative</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">Display Name:</span>
              <span className="font-semibold text-foreground">
                {user?.displayName || 'Authorized Buyer Rep'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">Email Address:</span>
              <span className="font-medium text-foreground">
                {user?.email || 'buyer@example.com'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-border/40">
              <span className="text-muted-foreground">Role:</span>
              <Badge variant="purple" size="sm">
                {user?.role || 'buyer'}
              </Badge>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">User UID:</span>
              <span className="font-medium text-[11px] text-muted-foreground truncate max-w-[160px]">
                {user?.uid || 'buyer-uid-001'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Security & Access Notice */}
      <Card className="p-6 bg-muted/30 border-border/80 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold text-sm text-foreground">
            Security &amp; Tenant Integrity Policy
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          In strict adherence to the XYZ Buying House data protection model, all purchase orders, inline QC reports, pre-production approvals, and commercial documents are queried exclusively with server-validated tenant organization constraints. Access to data from other buyer organizations is strictly prohibited by Cloud Firestore security rules.
        </p>
      </Card>
    </div>
  );
}
