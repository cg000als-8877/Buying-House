'use client';

import React from 'react';
import { Truck, Navigation, CheckCircle2, Clock } from 'lucide-react';
import { ShipmentAnalyticsReport } from '@/types/reporting';
import { MetricCard } from '@/components/reporting/MetricCard';
import { TimeSeriesAreaChart, DonutDistributionChart, CategoryBarChart } from '@/components/reporting/ReportCharts';
import { ReportTable, ColumnDef } from '@/components/reporting/ReportTable';
import { Badge } from '@/components/ui/Badge';

interface ShipmentAnalyticsProps {
  data: ShipmentAnalyticsReport;
  onExport?: () => void;
}

export function ShipmentAnalytics({ data, onExport }: ShipmentAnalyticsProps) {
  const carrierColumns: ColumnDef<ShipmentAnalyticsReport['carrierPerformance'][0]>[] = [
    {
      key: 'carrier',
      header: 'Freight Carrier / Forwarder',
      render: (item) => <span className="font-semibold text-foreground">{item.carrier}</span>,
    },
    {
      key: 'totalShipments',
      header: 'Consignments Handled',
      align: 'center',
      render: (item) => <span className="font-mono">{item.totalShipments}</span>,
    },
    {
      key: 'onTimeRate',
      header: 'On-Time Dispatch %',
      align: 'right',
      render: (item) => (
        <Badge variant={item.onTimeRate >= 95 ? 'success' : item.onTimeRate >= 85 ? 'warning' : 'error'}>
          {item.onTimeRate}%
        </Badge>
      ),
    },
    {
      key: 'avgDelayDays',
      header: 'Avg Variance',
      align: 'right',
      render: (item) => (
        <span className={`font-mono ${item.avgDelayDays > 0 ? 'text-rose-500 font-semibold' : 'text-emerald-500'}`}>
          {item.avgDelayDays > 0 ? `+${item.avgDelayDays} days` : 'On Schedule'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Consignments"
          metric={data.totalShipments}
          icon={Truck}
          iconColor="text-blue-500 bg-blue-500/10 border-blue-500/20"
        />
        <MetricCard
          title="On-Time Dispatch Rate (OTD)"
          metric={data.onTimeDispatchRate}
          icon={CheckCircle2}
          iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          subtitle="Target: 98.0% Port Delivery"
        />
        <MetricCard
          title="Active In Transit"
          metric={data.inTransitShipments}
          icon={Navigation}
          iconColor="text-amber-500 bg-amber-500/10 border-amber-500/20"
        />
        <MetricCard
          title="Average Transit Variance"
          metric={data.averageDelayDays}
          icon={Clock}
          iconColor="text-violet-500 bg-violet-500/10 border-violet-500/20"
          subtitle="Variance vs Estimated Arrival"
        />
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimeSeriesAreaChart
            data={data.monthlyShipmentVolume}
            title="Monthly Export Consignment Volume"
            dataKey="value"
            name="Shipments Dispatched"
            color="#3b82f6"
          />
        </div>
        <div className="lg:col-span-1">
          <DonutDistributionChart
            data={data.transportModeDistribution}
            title="Freight Mode Split (Sea, Air, Road)"
          />
        </div>
      </div>

      {/* Destination Port Distribution */}
      <CategoryBarChart
        data={data.portDistribution}
        title="Destination Port Throughput"
        color="#06b6d4"
      />

      {/* Carrier Performance Table */}
      <ReportTable
        title="Carrier & Freight Forwarder Reliability Scorecard"
        subtitle="On-time delivery performance and transit variance by logistics partner"
        columns={carrierColumns}
        data={data.carrierPerformance}
        searchKey="carrier"
        onExport={onExport}
      />
    </div>
  );
}
