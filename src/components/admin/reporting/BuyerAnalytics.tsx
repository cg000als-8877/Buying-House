'use client';

import React from 'react';
import { Building2, Package, ShieldCheck, Clock } from 'lucide-react';
import { BuyerAnalyticsReport } from '@/types/reporting';
import { MetricCard } from '@/components/reporting/MetricCard';
import { TimeSeriesAreaChart, DonutDistributionChart } from '@/components/reporting/ReportCharts';
import { ReportTable, ColumnDef } from '@/components/reporting/ReportTable';
import { Badge } from '@/components/ui/Badge';

interface BuyerAnalyticsProps {
  data: BuyerAnalyticsReport;
  onExport?: () => void;
}

export function BuyerAnalytics({ data, onExport }: BuyerAnalyticsProps) {
  const orderColumns: ColumnDef<BuyerAnalyticsReport['recentOrders'][0]>[] = [
    {
      key: 'orderNumber',
      header: 'Purchase Order',
      render: (item) => <span className="font-medium font-semibold text-primary">{item.orderNumber}</span>,
    },
    {
      key: 'styleNumber',
      header: 'Style #',
      render: (item) => <span className="text-muted-foreground">{item.styleNumber}</span>,
    },
    {
      key: 'productName',
      header: 'Product Description',
      render: (item) => <span className="font-medium text-foreground">{item.productName}</span>,
    },
    {
      key: 'quantity',
      header: 'Units (pcs)',
      align: 'right',
      render: (item) => <span className="font-medium font-semibold">{item.quantity.toLocaleString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'Completed' ? 'success' : item.status === 'Cancelled' ? 'error' : 'neutral'}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'exFactoryDate',
      header: 'Ex-Factory Date',
      render: (item) => <span className="text-muted-foreground font-medium">{item.exFactoryDate}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Buyer Organization Header */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{data.buyerName}</h2>
          <p className="text-xs text-muted-foreground">
            Tenant Account Intelligence & Operational Sourcing Metrics
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Purchase Orders"
          metric={data.totalOrders}
          icon={Package}
          iconColor="text-amber-500 bg-amber-500/10 border-amber-500/20"
        />
        <MetricCard
          title="Total Sourced Units"
          metric={data.totalQuantity}
          icon={Package}
          iconColor="text-blue-500 bg-blue-500/10 border-blue-500/20"
        />
        <MetricCard
          title="Quality Pass Rate"
          metric={data.qualityPassRate}
          icon={ShieldCheck}
          iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          subtitle="Target: 95.0% AQL"
        />
        <MetricCard
          title="Sample Approval Speed"
          metric={data.sampleApprovalSpeedDays}
          icon={Clock}
          iconColor="text-violet-500 bg-violet-500/10 border-violet-500/20"
          subtitle="Buyer Turnaround Time"
        />
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimeSeriesAreaChart
            data={data.monthlyVolume}
            title="Monthly Sourcing Volume (pcs)"
            dataKey="value"
            name="Units Sourced"
            color="#f59e0b"
          />
        </div>
        <div className="lg:col-span-1">
          <DonutDistributionChart
            data={data.orderStatusDistribution}
            title="Order Pipeline Breakdown"
          />
        </div>
      </div>

      {/* Recent Orders Table */}
      <ReportTable
        title="Buyer Purchase Orders"
        subtitle="Recent purchase orders placed by this buyer organization"
        columns={orderColumns}
        data={data.recentOrders}
        searchKey="orderNumber"
        onExport={onExport}
      />
    </div>
  );
}
