'use client';

import React from 'react';
import { Layers, Scissors, Activity, CheckCircle2, Factory } from 'lucide-react';
import { ProductionAnalyticsReport } from '@/types/reporting';
import { MetricCard } from '@/components/reporting/MetricCard';
import { TimeSeriesAreaChart, CategoryBarChart } from '@/components/reporting/ReportCharts';
import { ReportTable, ColumnDef } from '@/components/reporting/ReportTable';
import { Badge } from '@/components/ui/Badge';

interface ProductionAnalyticsProps {
  data: ProductionAnalyticsReport;
  onExport?: () => void;
}

export function ProductionAnalytics({ data, onExport }: ProductionAnalyticsProps) {
  const factoryColumns: ColumnDef<ProductionAnalyticsReport['factoryTelemetry'][0]>[] = [
    {
      key: 'factoryName',
      header: 'Partner Factory',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Factory className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">{item.factoryName}</span>
        </div>
      ),
    },
    {
      key: 'activeLines',
      header: 'Active Lines',
      align: 'center',
      render: (item) => <span className="font-mono">{item.activeLines} Lines</span>,
    },
    {
      key: 'plannedQty',
      header: 'Planned (pcs)',
      align: 'right',
      render: (item) => <span className="font-mono">{item.plannedQty.toLocaleString()}</span>,
    },
    {
      key: 'producedQty',
      header: 'Produced (pcs)',
      align: 'right',
      render: (item) => <span className="font-mono font-bold text-emerald-500">{item.producedQty.toLocaleString()}</span>,
    },
    {
      key: 'efficiencyRate',
      header: 'Achievement %',
      align: 'right',
      render: (item) => (
        <Badge variant={item.efficiencyRate >= 85 ? 'success' : item.efficiencyRate >= 70 ? 'warning' : 'error'}>
          {item.efficiencyRate}%
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Target Units"
          metric={data.totalUnitsPlanned}
          icon={Layers}
          iconColor="text-blue-500 bg-blue-500/10 border-blue-500/20"
        />
        <MetricCard
          title="Cutting Output"
          metric={data.cuttingOutput}
          icon={Scissors}
          iconColor="text-amber-500 bg-amber-500/10 border-amber-500/20"
        />
        <MetricCard
          title="Sewing Completed"
          metric={data.sewingOutput}
          icon={Activity}
          iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
        />
        <MetricCard
          title="Overall Completion Rate"
          metric={data.overallCompletionRate}
          icon={CheckCircle2}
          iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          subtitle="Target: 90% floor efficiency"
        />
      </div>

      {/* Production Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesAreaChart
          data={data.dailyOutputTrend}
          title="Floor Output & Throughput Velocity (pcs)"
          dataKey="value"
          name="Daily Output"
          color="#10b981"
        />
        <CategoryBarChart
          data={data.stageProgress}
          title="Stage-Wise Units Completed (pcs)"
          color="#3b82f6"
        />
      </div>

      {/* Factory Floor Telemetry Table */}
      <ReportTable
        title="Factory Floor Telemetry & Line Utilization"
        subtitle="Live production achievement rates and line allocation across partner units"
        columns={factoryColumns}
        data={data.factoryTelemetry}
        searchKey="factoryName"
        onExport={onExport}
      />
    </div>
  );
}
