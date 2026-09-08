'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Package,
  Layers,
  ShieldCheck,
  Truck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { BuyerAnalyticsReport, ReportFilter } from '@/types/reporting';
import { getBuyerAnalytics, exportReportToCSV, downloadCSV } from '@/lib/reporting';
import { MetricCard } from '@/components/reporting/MetricCard';
import { TimeSeriesAreaChart, DonutDistributionChart } from '@/components/reporting/ReportCharts';
import { ReportTable, ColumnDef } from '@/components/reporting/ReportTable';
import { ReportFilters } from '@/components/reporting/ReportFilters';
import { Badge } from '@/components/ui/Badge';

export function BuyerReportingDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<BuyerAnalyticsReport | null>(null);
  const [filter, setFilter] = useState<ReportFilter>({ period: 'all' });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await getBuyerAnalytics(
        { ...filter, buyerOrganizationId: user.buyerOrganizationId || undefined },
        user
      );
      setData(res);
    } catch (err) {
      console.error('Error fetching buyer report analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter, user]);

  const handleExport = () => {
    if (!data?.recentOrders) return;
    const filename = `buyer-orders-report-${new Date().toISOString().split('T')[0]}`;
    const csv = exportReportToCSV('buyer_orders', data.recentOrders, filename, user || undefined);
    downloadCSV(csv, filename);
  };

  const orderColumns: ColumnDef<BuyerAnalyticsReport['recentOrders'][0]>[] = [
    {
      key: 'orderNumber',
      header: 'Purchase Order',
      render: (item) => <span className="font-mono font-semibold text-primary">{item.orderNumber}</span>,
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
      header: 'Quantity (pcs)',
      align: 'right',
      render: (item) => <span className="font-mono font-semibold">{item.quantity.toLocaleString()}</span>,
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
      header: 'Target Ex-Factory',
      render: (item) => <span className="text-muted-foreground font-mono">{item.exFactoryDate}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Buyer Analytics & Performance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Sourcing & Fulfillment Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time telemetry on purchase orders, quality pass rates, and shipment deliveries for {data?.buyerName || 'your organization'}.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <ReportFilters
        filter={filter}
        onFilterChange={setFilter}
        onRefresh={loadData}
        onExport={handleExport}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs font-medium">Loading organization analytics...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top Level Metric Cards */}
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
              icon={Layers}
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
              title="On-Time Delivery Rate"
              metric={data.onTimeDeliveryRate}
              icon={Truck}
              iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
              subtitle="Target: 98.0% Punctuality"
            />
          </div>

          {/* Visual Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TimeSeriesAreaChart
                data={data.monthlyVolume}
                title="Monthly Order Volume & Fulfillment (Units)"
                dataKey="value"
                name="Units Sourced"
                color="#f59e0b"
              />
            </div>
            <div className="lg:col-span-1">
              <DonutDistributionChart
                data={data.orderStatusDistribution}
                title="Order Status Distribution"
              />
            </div>
          </div>

          {/* Orders Ledger */}
          <ReportTable
            title="Purchase Orders Performance Ledger"
            subtitle="Recent orders placed by your organization and their milestone progress"
            columns={orderColumns}
            data={data.recentOrders}
            searchKey="orderNumber"
            onExport={handleExport}
          />
        </div>
      ) : null}
    </div>
  );
}
