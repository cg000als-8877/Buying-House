'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Layers,
  Package,
  ShieldCheck,
  FileCheck2,
  FileText,
  Truck,
  Building2,
  Factory,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { hasPermission } from '@/lib/auth/permissions';
import { ReportFilter, ReportPeriod } from '@/types/reporting';
import {
  getExecutiveSummary,
  getOrderAnalytics,
  getProductionAnalytics,
  getQualityAnalytics,
  getSampleAnalytics,
  getDocumentAnalytics,
  getShipmentAnalytics,
  getBuyerAnalytics,
  getFactoryAnalytics,
  exportReportToCSV,
  downloadCSV,
} from '@/lib/reporting';

// Domain components
import { ExecutiveDashboard } from '@/components/admin/reporting/ExecutiveDashboard';
import { OrderAnalytics } from '@/components/admin/reporting/OrderAnalytics';
import { ProductionAnalytics } from '@/components/admin/reporting/ProductionAnalytics';
import { QualityAnalytics } from '@/components/admin/reporting/QualityAnalytics';
import { SampleAnalytics } from '@/components/admin/reporting/SampleAnalytics';
import { DocumentAnalytics } from '@/components/admin/reporting/DocumentAnalytics';
import { ShipmentAnalytics } from '@/components/admin/reporting/ShipmentAnalytics';
import { BuyerAnalytics } from '@/components/admin/reporting/BuyerAnalytics';
import { FactoryAnalytics } from '@/components/admin/reporting/FactoryAnalytics';

import { ReportFilters } from '@/components/reporting/ReportFilters';
import { TEST_FACTORIES } from '@/lib/factories';

type AnalyticsTab =
  | 'executive'
  | 'orders'
  | 'production'
  | 'quality'
  | 'samples'
  | 'documents'
  | 'shipments'
  | 'buyers'
  | 'factories';

const TABS: { id: AnalyticsTab; label: string; icon: React.ElementType }[] = [
  { id: 'executive', label: 'Executive Overview', icon: BarChart3 },
  { id: 'orders', label: 'Purchase Orders', icon: Package },
  { id: 'production', label: 'Production Floor', icon: Layers },
  { id: 'quality', label: 'Quality & AQL', icon: ShieldCheck },
  { id: 'samples', label: 'Sample Approvals', icon: FileCheck2 },
  { id: 'documents', label: 'Document Vault', icon: FileText },
  { id: 'shipments', label: 'Shipments & Logistics', icon: Truck },
  { id: 'buyers', label: 'Buyer Accounts', icon: Building2 },
  { id: 'factories', label: 'Partner Factories', icon: Factory },
];

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('executive');
  const [filter, setFilter] = useState<ReportFilter>({ period: 'all' });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Domain data states
  const [executiveData, setExecutiveData] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<any>(null);
  const [productionData, setProductionData] = useState<any>(null);
  const [qualityData, setQualityData] = useState<any>(null);
  const [samplesData, setSamplesData] = useState<any>(null);
  const [documentsData, setDocumentsData] = useState<any>(null);
  const [shipmentsData, setShipmentsData] = useState<any>(null);
  const [buyerData, setBuyerData] = useState<any>(null);
  const [factoryData, setFactoryData] = useState<any>(null);

  const canReadReports = hasPermission(user?.role, 'reports.read');
  const canExportReports = hasPermission(user?.role, 'reports.export');

  // Load report data based on active tab and filter
  const loadReportData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'executive') {
        const res = await getExecutiveSummary(filter, user || undefined);
        setExecutiveData(res);
      } else if (activeTab === 'orders') {
        const res = await getOrderAnalytics(filter, user || undefined);
        setOrdersData(res);
      } else if (activeTab === 'production') {
        const res = await getProductionAnalytics(filter, user || undefined);
        setProductionData(res);
      } else if (activeTab === 'quality') {
        const res = await getQualityAnalytics(filter, user || undefined);
        setQualityData(res);
      } else if (activeTab === 'samples') {
        const res = await getSampleAnalytics(filter, user || undefined);
        setSamplesData(res);
      } else if (activeTab === 'documents') {
        const res = await getDocumentAnalytics(filter, user || undefined);
        setDocumentsData(res);
      } else if (activeTab === 'shipments') {
        const res = await getShipmentAnalytics(filter, user || undefined);
        setShipmentsData(res);
      } else if (activeTab === 'buyers') {
        const res = await getBuyerAnalytics(filter, user || undefined);
        setBuyerData(res);
      } else if (activeTab === 'factories') {
        const res = await getFactoryAnalytics(filter, user || undefined);
        setFactoryData(res);
      }
    } catch (err) {
      console.error('Error loading report analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [activeTab, filter]);

  // Handle Export
  const handleExport = () => {
    if (!canExportReports) return;

    let rows: Record<string, any>[] = [];
    let filename = `report-${activeTab}-${new Date().toISOString().split('T')[0]}`;

    if (activeTab === 'orders' && ordersData?.ordersList) {
      rows = ordersData.ordersList;
    } else if (activeTab === 'production' && productionData?.factoryTelemetry) {
      rows = productionData.factoryTelemetry;
    } else if (activeTab === 'quality' && qualityData?.factoryQualityScores) {
      rows = qualityData.factoryQualityScores;
    } else if (activeTab === 'samples' && samplesData?.buyerApprovalPerformance) {
      rows = samplesData.buyerApprovalPerformance;
    } else if (activeTab === 'documents' && documentsData?.documentChecklistStatus) {
      rows = documentsData.documentChecklistStatus;
    } else if (activeTab === 'shipments' && shipmentsData?.carrierPerformance) {
      rows = shipmentsData.carrierPerformance;
    } else if (activeTab === 'buyers' && buyerData?.recentOrders) {
      rows = buyerData.recentOrders;
    } else if (activeTab === 'factories' && factoryData?.factories) {
      rows = factoryData.factories;
    } else if (executiveData) {
      rows = [
        {
          period: executiveData.period,
          totalOrderVolume: executiveData.totalOrderVolume.current,
          totalOrderValueUSD: executiveData.totalOrderValue.current,
          activeOrders: executiveData.activeOrdersCount.current,
          leadTimeDays: executiveData.averageLeadTimeDays.current,
          qualityPassRate: executiveData.overallQualityPassRate.current,
          onTimeDeliveryRate: executiveData.onTimeShipmentRate.current,
        },
      ];
    }

    const csv = exportReportToCSV(activeTab, rows, filename, user || undefined);
    downloadCSV(csv, filename);
  };

  if (!canReadReports) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-2">
          You do not have permission to view reporting and analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Management Intelligence Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Reports & Operational Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cross-domain metrics synthesizing Orders, Production, Quality, Samples, Documents & Logistics.
          </p>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global Filter Toolbar */}
      <ReportFilters
        filter={filter}
        onFilterChange={setFilter}
        onRefresh={loadReportData}
        onExport={canExportReports ? handleExport : undefined}
        isLoading={isLoading}
        showFactoryFilter={['production', 'quality', 'orders'].includes(activeTab)}
        factories={TEST_FACTORIES.map((f) => ({ id: f.id, name: f.name }))}
        showCategoryFilter={activeTab === 'orders'}
      />

      {/* Analytics Content Area */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs font-medium">Synthesizing operational telemetry...</p>
        </div>
      ) : (
        <div>
          {activeTab === 'executive' && executiveData && (
            <ExecutiveDashboard data={executiveData} />
          )}
          {activeTab === 'orders' && ordersData && (
            <OrderAnalytics data={ordersData} onExport={canExportReports ? handleExport : undefined} />
          )}
          {activeTab === 'production' && productionData && (
            <ProductionAnalytics data={productionData} onExport={canExportReports ? handleExport : undefined} />
          )}
          {activeTab === 'quality' && qualityData && (
            <QualityAnalytics data={qualityData} onExport={canExportReports ? handleExport : undefined} />
          )}
          {activeTab === 'samples' && samplesData && (
            <SampleAnalytics data={samplesData} onExport={canExportReports ? handleExport : undefined} />
          )}
          {activeTab === 'documents' && documentsData && (
            <DocumentAnalytics data={documentsData} onExport={canExportReports ? handleExport : undefined} />
          )}
          {activeTab === 'shipments' && shipmentsData && (
            <ShipmentAnalytics data={shipmentsData} onExport={canExportReports ? handleExport : undefined} />
          )}
          {activeTab === 'buyers' && buyerData && (
            <BuyerAnalytics data={buyerData} onExport={canExportReports ? handleExport : undefined} />
          )}
          {activeTab === 'factories' && factoryData && (
            <FactoryAnalytics data={factoryData} onExport={canExportReports ? handleExport : undefined} />
          )}
        </div>
      )}
    </div>
  );
}
