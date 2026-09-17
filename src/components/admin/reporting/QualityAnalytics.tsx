'use client';

import React from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, Award } from 'lucide-react';
import { QualityAnalyticsReport } from '@/types/reporting';
import { MetricCard } from '@/components/reporting/MetricCard';
import { DefectParetoChart, TimeSeriesAreaChart } from '@/components/reporting/ReportCharts';
import { ReportTable, ColumnDef } from '@/components/reporting/ReportTable';
import { Badge } from '@/components/ui/Badge';

interface QualityAnalyticsProps {
  data: QualityAnalyticsReport;
  onExport?: () => void;
}

export function QualityAnalytics({ data, onExport }: QualityAnalyticsProps) {
  const factoryColumns: ColumnDef<QualityAnalyticsReport['factoryQualityScores'][0]>[] = [
    {
      key: 'factoryName',
      header: 'Partner Factory',
      render: (item) => <span className="font-semibold text-foreground">{item.factoryName}</span>,
    },
    {
      key: 'totalInspections',
      header: 'Total Audits',
      align: 'center',
      render: (item) => <span className="font-medium">{item.totalInspections}</span>,
    },
    {
      key: 'passRate',
      header: 'FTPR %',
      align: 'right',
      render: (item) => (
        <Badge variant={item.passRate >= 95 ? 'success' : item.passRate >= 85 ? 'warning' : 'error'}>
          {item.passRate}%
        </Badge>
      ),
    },
    {
      key: 'criticalDefects',
      header: 'Critical',
      align: 'center',
      render: (item) => (
        <span className={`font-medium font-bold ${item.criticalDefects > 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>
          {item.criticalDefects}
        </span>
      ),
    },
    {
      key: 'majorDefects',
      header: 'Major',
      align: 'center',
      render: (item) => <span className="font-medium text-amber-500 font-semibold">{item.majorDefects}</span>,
    },
    {
      key: 'minorDefects',
      header: 'Minor',
      align: 'center',
      render: (item) => <span className="font-medium text-muted-foreground">{item.minorDefects}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="First-Time Pass Rate (FTPR)"
          metric={data.firstTimePassRate}
          icon={ShieldCheck}
          iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          subtitle="Target: 95.0% AQL Standard"
        />
        <MetricCard
          title="Total AQL Inspections"
          metric={data.totalInspections}
          icon={Award}
          iconColor="text-blue-500 bg-blue-500/10 border-blue-500/20"
        />
        <MetricCard
          title="Failed Inspections"
          metric={data.failedInspections}
          icon={AlertOctagon}
          iconColor="text-rose-500 bg-rose-500/10 border-rose-500/20"
        />
        <MetricCard
          title="CAP Closure Rate"
          metric={data.capClosureRate}
          icon={CheckCircle2}
          iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          subtitle="Verified Corrective Actions"
        />
      </div>

      {/* Defect Pareto Chart & Audit Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DefectParetoChart
          data={data.defectPareto}
          title="Defect Pareto Breakdown (Critical, Major, Minor)"
        />
        <TimeSeriesAreaChart
          data={data.inspectionTrend}
          title="Monthly AQL Inspection Volume"
          dataKey="value"
          name="Audits Performed"
          color="#3b82f6"
        />
      </div>

      {/* Factory Quality Scorecards Table */}
      <ReportTable
        title="Factory Quality & Compliance Scorecards"
        subtitle="First-time pass rates, defect breakdowns, and factory quality reliability rankings"
        columns={factoryColumns}
        data={data.factoryQualityScores}
        searchKey="factoryName"
        onExport={onExport}
      />
    </div>
  );
}
