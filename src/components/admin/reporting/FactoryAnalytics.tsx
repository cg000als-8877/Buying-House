'use client';

import React from 'react';
import { Factory, ShieldCheck, Activity } from 'lucide-react';
import { FactoryAnalyticsReport } from '@/types/reporting';
import { ReportTable, ColumnDef } from '@/components/reporting/ReportTable';
import { Badge } from '@/components/ui/Badge';

interface FactoryAnalyticsProps {
  data: FactoryAnalyticsReport;
  onExport?: () => void;
}

export function FactoryAnalytics({ data, onExport }: FactoryAnalyticsProps) {
  const factoryColumns: ColumnDef<FactoryAnalyticsReport['factories'][0]>[] = [
    {
      key: 'factoryName',
      header: 'Partner Factory',
      render: (item) => (
        <div>
          <div className="font-semibold text-foreground">{item.factoryName}</div>
          <div className="text-[11px] text-muted-foreground">{item.country}</div>
        </div>
      ),
    },
    {
      key: 'activeOrdersCount',
      header: 'Active Orders',
      align: 'center',
      render: (item) => <span className="font-medium">{item.activeOrdersCount} POs</span>,
    },
    {
      key: 'capacityUtilization',
      header: 'Capacity Load',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full ${
                item.capacityUtilization > 90
                  ? 'bg-rose-500'
                  : item.capacityUtilization > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${item.capacityUtilization}%` }}
            />
          </div>
          <span className="font-medium text-xs">{item.capacityUtilization}%</span>
        </div>
      ),
    },
    {
      key: 'qualityPassRate',
      header: 'Quality FTPR %',
      align: 'right',
      render: (item) => (
        <Badge variant={item.qualityPassRate >= 95 ? 'success' : item.qualityPassRate >= 85 ? 'warning' : 'error'}>
          {item.qualityPassRate}%
        </Badge>
      ),
    },
    {
      key: 'onTimeDeliveryRate',
      header: 'On-Time Delivery %',
      align: 'right',
      render: (item) => <span className="font-medium text-emerald-500 font-semibold">{item.onTimeDeliveryRate}%</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => (
        <Badge variant={item.status === 'optimal' ? 'success' : item.status === 'warning' ? 'warning' : 'error'}>
          {item.status.toUpperCase()}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Factory Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-2">
            <Factory className="w-4 h-4 text-primary" />
            <span>TOTAL MONITORED UNITS</span>
          </div>
          <div className="text-2xl font-bold font-medium text-foreground">
            {data.factories.length} Factories
          </div>
          <p className="text-xs text-muted-foreground mt-1">Active compliant partner manufacturing units</p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>AVG NETWORK QUALITY</span>
          </div>
          <div className="text-2xl font-bold font-medium text-emerald-500">
            95.2% Pass Rate
          </div>
          <p className="text-xs text-muted-foreground mt-1">Across all inline & final AQL audits</p>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span>AVG CAPACITY LOAD</span>
          </div>
          <div className="text-2xl font-bold font-medium text-blue-500">
            82.4% Allocated
          </div>
          <p className="text-xs text-muted-foreground mt-1">Optimal utilization range</p>
        </div>
      </div>

      {/* Factories Performance Table */}
      <ReportTable
        title="Factory Performance & Capacity Benchmarks"
        subtitle="Capacity utilization, quality compliance, and delivery punctuality per manufacturing partner"
        columns={factoryColumns}
        data={data.factories}
        searchKey="factoryName"
        onExport={onExport}
      />
    </div>
  );
}
