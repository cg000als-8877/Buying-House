'use client';

import React from 'react';
import {
  DollarSign,
  Package,
  Layers,
  ShieldCheck,
  Truck,
  Clock,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';
import { ExecutiveSummaryReport } from '@/types/reporting';
import { MetricCard } from '@/components/reporting/MetricCard';
import { TimeSeriesAreaChart, DonutDistributionChart } from '@/components/reporting/ReportCharts';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface ExecutiveDashboardProps {
  data: ExecutiveSummaryReport;
}

export function ExecutiveDashboard({ data }: ExecutiveDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Top Level KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Order Volume"
          metric={data.totalOrderVolume}
          icon={Package}
          iconColor="text-amber-500 bg-amber-500/10 border-amber-500/20"
        />
        <MetricCard
          title="Estimated FOB Value"
          metric={data.totalOrderValue}
          icon={DollarSign}
          iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
        />
        <MetricCard
          title="Active Production Orders"
          metric={data.activeOrdersCount}
          icon={Layers}
          iconColor="text-blue-500 bg-blue-500/10 border-blue-500/20"
        />
        <MetricCard
          title="Average Lead Time"
          metric={data.averageLeadTimeDays}
          icon={Clock}
          iconColor="text-violet-500 bg-violet-500/10 border-violet-500/20"
        />
      </div>

      {/* Operational Quality & Logistics Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="First-Time Quality Pass Rate"
          metric={data.overallQualityPassRate}
          icon={ShieldCheck}
          iconColor="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          subtitle="Target: 95% AQL 1.5/2.5"
        />
        <MetricCard
          title="On-Time Delivery Rate"
          metric={data.onTimeShipmentRate}
          icon={Truck}
          iconColor="text-blue-500 bg-blue-500/10 border-blue-500/20"
          subtitle="Target: 98% On-Time Ex-Factory"
        />
        <MetricCard
          title="Sample Approval Cycle"
          metric={data.sampleApprovalCycleDays}
          icon={FileCheck2}
          iconColor="text-amber-500 bg-amber-500/10 border-amber-500/20"
          subtitle="Submission to Buyer Decision"
        />
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimeSeriesAreaChart
            data={data.monthlyOrderTrends}
            title="Monthly Order Volume & Execution Trajectory (Units)"
            dataKey="value"
            name="Order Quantity (pcs)"
            color="#f59e0b"
          />
        </div>
        <div className="lg:col-span-1">
          <DonutDistributionChart
            data={data.stageThroughput}
            title="Active Workflow Stage Distribution"
          />
        </div>
      </div>

      {/* Critical Operational Alerts */}
      {data.criticalAlerts && data.criticalAlerts.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Critical Exceptions & Action Items ({data.criticalAlerts.length})
            </h3>
          </div>

          <div className="space-y-2.5">
            {data.criticalAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        alert.severity === 'critical'
                          ? 'error'
                          : alert.severity === 'warning'
                          ? 'warning'
                          : 'info'
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {alert.type}
                    </Badge>
                    <span className="text-xs font-semibold text-foreground">{alert.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>

                {alert.actionUrl && (
                  <Link
                    href={alert.actionUrl}
                    className="text-xs font-medium text-primary hover:underline whitespace-nowrap self-center"
                  >
                    View Details &rarr;
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
