'use client';

import React from 'react';
import { FileCheck2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { SampleAnalyticsReport } from '@/types/reporting';
import { MetricCard } from '@/components/reporting/MetricCard';
import { TimeSeriesAreaChart, DonutDistributionChart } from '@/components/reporting/ReportCharts';
import { ReportTable, ColumnDef } from '@/components/reporting/ReportTable';
import { Badge } from '@/components/ui/Badge';

interface SampleAnalyticsProps {
  data: SampleAnalyticsReport;
  onExport?: () => void;
}

export function SampleAnalytics({ data, onExport }: SampleAnalyticsProps) {
  const buyerColumns: ColumnDef<SampleAnalyticsReport['buyerApprovalPerformance'][0]>[] = [
    {
      key: 'buyerName',
      header: 'Buyer Organization',
      render: (item) => <span className="font-semibold text-foreground">{item.buyerName}</span>,
    },
    {
      key: 'totalSamples',
      header: 'Samples Submitted',
      align: 'center',
      render: (item) => <span className="font-medium">{item.totalSamples}</span>,
    },
    {
      key: 'approvalRate',
      header: 'Approval Rate',
      align: 'right',
      render: (item) => (
        <Badge variant={item.approvalRate >= 80 ? 'success' : item.approvalRate >= 60 ? 'warning' : 'error'}>
          {item.approvalRate}%
        </Badge>
      ),
    },
    {
      key: 'avgCycleDays',
      header: 'Avg Decision Turnaround',
      align: 'right',
      render: (item) => <span className="font-medium text-primary font-semibold">{item.avgCycleDays} days</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Samples Developed"
          metric={data.totalSamples}
          icon={FileCheck2}
          iconColor="text-amber-500 bg-amber-500/10 border-amber-500/20"
        />
        <MetricCard
          title="First-Round Approval Rate"
          metric={data.firstRoundApprovalRate}
          icon={CheckCircle2}
          iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          subtitle="Target: 80% First Revision"
        />
        <MetricCard
          title="Avg Approval Cycle Time"
          metric={data.averageApprovalCycleDays}
          icon={Clock}
          iconColor="text-violet-500 bg-violet-500/10 border-violet-500/20"
          subtitle="Dispatch to Buyer Decision"
        />
        <MetricCard
          title="Pending Buyer Decisions"
          metric={data.pendingReviewCount}
          icon={AlertCircle}
          iconColor="text-blue-500 bg-blue-500/10 border-blue-500/20"
        />
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimeSeriesAreaChart
            data={data.monthlySubmissions}
            title="Monthly Sample Development & Submission Velocity"
            dataKey="value"
            name="Samples Submitted"
            color="#f59e0b"
          />
        </div>
        <div className="lg:col-span-1">
          <DonutDistributionChart
            data={data.stageBreakdown}
            title="Sample Stage Breakdown (Proto, Fit, PP, TOP)"
          />
        </div>
      </div>

      {/* Buyer Approval Performance Table */}
      <ReportTable
        title="Buyer Sample Approval Benchmarks"
        subtitle="Approval speed and revision frequency across retail partners"
        columns={buyerColumns}
        data={data.buyerApprovalPerformance}
        searchKey="buyerName"
        onExport={onExport}
      />
    </div>
  );
}
