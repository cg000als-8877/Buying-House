'use client';

import React from 'react';
import { FileText, ShieldCheck, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DocumentAnalyticsReport } from '@/types/reporting';
import { MetricCard } from '@/components/reporting/MetricCard';
import { DonutDistributionChart } from '@/components/reporting/ReportCharts';
import { ReportTable, ColumnDef } from '@/components/reporting/ReportTable';
import { Badge } from '@/components/ui/Badge';

interface DocumentAnalyticsProps {
  data: DocumentAnalyticsReport;
  onExport?: () => void;
}

export function DocumentAnalytics({ data, onExport }: DocumentAnalyticsProps) {
  const complianceColumns: ColumnDef<DocumentAnalyticsReport['documentChecklistStatus'][0]>[] = [
    {
      key: 'orderNumber',
      header: 'Purchase Order',
      render: (item) => <span className="font-mono font-semibold text-primary">{item.orderNumber}</span>,
    },
    {
      key: 'buyerName',
      header: 'Buyer Organization',
      render: (item) => <span className="font-medium text-foreground">{item.buyerName}</span>,
    },
    {
      key: 'requiredDocsCount',
      header: 'Required Dossier',
      align: 'center',
      render: (item) => <span className="font-mono">{item.requiredDocsCount} Docs</span>,
    },
    {
      key: 'approvedDocsCount',
      header: 'Verified Dossier',
      align: 'center',
      render: (item) => <span className="font-mono font-bold text-emerald-500">{item.approvedDocsCount} Docs</span>,
    },
    {
      key: 'isCompliant',
      header: 'Compliance Status',
      align: 'right',
      render: (item) => (
        <Badge variant={item.isCompliant ? 'success' : 'warning'}>
          {item.isCompliant ? 'Fully Compliant' : 'Pending Verification'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Documents in Vault"
          metric={data.totalDocuments}
          icon={FileText}
          iconColor="text-blue-500 bg-blue-500/10 border-blue-500/20"
        />
        <MetricCard
          title="Verified Compliance Rate"
          metric={data.complianceRate}
          icon={ShieldCheck}
          iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          subtitle="Target: 100% Commercial Suite"
        />
        <MetricCard
          title="Pending Staff Verification"
          metric={data.pendingReviewCount}
          icon={Clock}
          iconColor="text-amber-500 bg-amber-500/10 border-amber-500/20"
        />
        <MetricCard
          title="Expiring Within 30 Days"
          metric={data.expiringSoonCount}
          icon={AlertTriangle}
          iconColor="text-rose-500 bg-rose-500/10 border-rose-500/20"
        />
      </div>

      {/* Distribution Chart & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DonutDistributionChart
            data={data.categoryDistribution}
            title="Document Classification Breakdown"
          />
        </div>
        <div className="lg:col-span-2">
          <div className="p-5 rounded-xl border border-border bg-card shadow-sm h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Commercial Document Verification Guidelines
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All export orders must complete mandatory 5-part commercial compliance before dispatch authorization:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verified Bill of Lading (B/L)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Commercial Invoice (CI)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Packing List with Gross/Net Weights</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Certificate of Origin (GSP/COO)</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground">
              Vault documents are strictly role-gated and auditable per ISO 9001:2015 traceability requirements.
            </div>
          </div>
        </div>
      </div>

      {/* PO Checklist Table */}
      <ReportTable
        title="PO Commercial Document Dossier Compliance"
        subtitle="Verification status of required shipping and customs documentation per purchase order"
        columns={complianceColumns}
        data={data.documentChecklistStatus}
        searchKey="orderNumber"
        onExport={onExport}
      />
    </div>
  );
}
