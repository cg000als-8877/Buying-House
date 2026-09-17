'use client';

import React from 'react';
import { Package, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { OrderAnalyticsReport } from '@/types/reporting';
import { MetricCard } from '@/components/reporting/MetricCard';
import { TimeSeriesAreaChart, DonutDistributionChart, CategoryBarChart } from '@/components/reporting/ReportCharts';
import { ReportTable, ColumnDef } from '@/components/reporting/ReportTable';
import { Badge } from '@/components/ui/Badge';

interface OrderAnalyticsProps {
  data: OrderAnalyticsReport;
  onExport?: () => void;
}

export function OrderAnalytics({ data, onExport }: OrderAnalyticsProps) {
  const columns: ColumnDef<OrderAnalyticsReport['ordersList'][0]>[] = [
    {
      key: 'orderNumber',
      header: 'PO Number',
      render: (item) => <span className="font-medium font-semibold text-primary">{item.orderNumber}</span>,
    },
    {
      key: 'buyerName',
      header: 'Buyer Organization',
      render: (item) => <span className="font-medium text-foreground">{item.buyerName}</span>,
    },
    {
      key: 'styleNumber',
      header: 'Style #',
      render: (item) => <span className="text-muted-foreground">{item.styleNumber}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => <span>{item.category}</span>,
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
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Purchase Orders"
          metric={data.totalOrders}
          icon={Package}
          iconColor="text-amber-500 bg-amber-500/10 border-amber-500/20"
        />
        <MetricCard
          title="Total Units Sourced"
          metric={data.totalUnits}
          icon={TrendingUp}
          iconColor="text-blue-500 bg-blue-500/10 border-blue-500/20"
        />
        <MetricCard
          title="Active Production"
          metric={data.activeOrders}
          icon={Clock}
          iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
        />
        <MetricCard
          title="On-Time Delivery Rate"
          metric={data.onTimeDeliveryRate}
          icon={CheckCircle2}
          iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          subtitle="Target: 95%"
        />
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimeSeriesAreaChart
            data={data.monthlyVolume}
            title="Monthly Purchase Order Sourcing Volume (pcs)"
            dataKey="value"
            name="Units Sourced"
            color="#3b82f6"
          />
        </div>
        <div className="lg:col-span-1">
          <DonutDistributionChart
            data={data.statusDistribution}
            title="PO Lifecycle Status Breakdown"
          />
        </div>
      </div>

      {/* Category Volume Breakdown */}
      <CategoryBarChart
        data={data.categoryDistribution}
        title="Volume Sourced by Product Category (pcs)"
        color="#8b5cf6"
      />

      {/* Detailed Orders Breakdown Table */}
      <ReportTable
        title="Purchase Orders Performance Ledger"
        subtitle="Individual order status, fulfillment parameters, and scheduled milestones"
        columns={columns}
        data={data.ordersList}
        searchKey="orderNumber"
        onExport={onExport}
      />
    </div>
  );
}
