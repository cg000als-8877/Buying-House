/**
 * STEP 15: ADVANCED REPORTING & ANALYTICS DOMAIN MODELS
 * Deterministic, tenant-isolated data models for management intelligence.
 */

export type ReportPeriod = 'all' | 'today' | '7d' | '30d' | '90d' | '12m' | 'custom';

export interface ReportDateRange {
  startDate: string; // ISO string or YYYY-MM-DD
  endDate: string;   // ISO string or YYYY-MM-DD
}

export interface ReportFilter {
  dateRange?: ReportDateRange;
  period?: ReportPeriod;
  buyerOrganizationId?: string;
  factoryId?: string;
  category?: string;
  status?: string;
}

export interface MetricValue {
  current: number;
  previous?: number;
  target?: number;
  unit?: string;
  trendPercent?: number | null;
  status?: 'positive' | 'negative' | 'neutral';
  formattedValue?: string;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  value: number;
  secondaryValue?: number;
  target?: number;
}

export interface DistributionItem {
  name: string;
  value: number;
  count: number;
  percentage: number;
  color?: string;
}

export interface CriticalAlert {
  id: string;
  type: 'QUALITY' | 'SHIPMENT' | 'PRODUCTION' | 'DOCUMENT' | 'SAMPLE';
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  entityId?: string;
  actionUrl?: string;
}

// ============================================================================
// DOMAIN-SPECIFIC REPORTS
// ============================================================================

export interface ExecutiveSummaryReport {
  period: ReportPeriod;
  dateRange: ReportDateRange;
  generatedAt: string;
  totalOrderVolume: MetricValue; // total units
  totalOrderValue: MetricValue;  // total monetary estimate
  activeOrdersCount: MetricValue;
  averageLeadTimeDays: MetricValue;
  overallQualityPassRate: MetricValue; // First-time pass rate %
  onTimeShipmentRate: MetricValue;     // On-time dispatch %
  sampleApprovalCycleDays: MetricValue;
  monthlyOrderTrends: TimeSeriesPoint[];
  stageThroughput: DistributionItem[];
  criticalAlerts: CriticalAlert[];
}

export interface OrderAnalyticsReport {
  period: ReportPeriod;
  dateRange: ReportDateRange;
  generatedAt: string;
  totalOrders: MetricValue;
  totalUnits: MetricValue;
  completedOrders: MetricValue;
  activeOrders: MetricValue;
  cancelledOrders: MetricValue;
  onTimeDeliveryRate: MetricValue;
  leadTimeAverageDays: MetricValue;
  statusDistribution: DistributionItem[];
  categoryDistribution: DistributionItem[];
  monthlyVolume: TimeSeriesPoint[];
  ordersList: Array<{
    id: string;
    orderNumber: string;
    buyerName: string;
    buyerOrganizationId: string;
    styleNumber: string;
    category: string;
    quantity: number;
    status: string;
    orderDate: string;
    exFactoryDate: string;
    onTime: boolean;
  }>;
}

export interface ProductionAnalyticsReport {
  period: ReportPeriod;
  dateRange: ReportDateRange;
  generatedAt: string;
  totalUnitsPlanned: MetricValue;
  totalUnitsProduced: MetricValue;
  overallCompletionRate: MetricValue;
  cuttingOutput: MetricValue;
  sewingOutput: MetricValue;
  finishingOutput: MetricValue;
  dailyOutputTrend: TimeSeriesPoint[];
  factoryTelemetry: Array<{
    factoryId: string;
    factoryName: string;
    plannedQty: number;
    producedQty: number;
    efficiencyRate: number;
    activeLines: number;
  }>;
  stageProgress: DistributionItem[];
}

export interface DefectDistributionItem {
  defectCategory: string;
  count: number;
  percentage: number;
  severity: 'minor' | 'major' | 'critical';
}

export interface QualityAnalyticsReport {
  period: ReportPeriod;
  dateRange: ReportDateRange;
  generatedAt: string;
  firstTimePassRate: MetricValue;
  totalInspections: MetricValue;
  passedInspections: MetricValue;
  failedInspections: MetricValue;
  pendingReinspections: MetricValue;
  capClosureRate: MetricValue;
  defectPareto: DefectDistributionItem[];
  factoryQualityScores: Array<{
    factoryId: string;
    factoryName: string;
    totalInspections: number;
    passRate: number;
    criticalDefects: number;
    majorDefects: number;
    minorDefects: number;
  }>;
  inspectionTrend: TimeSeriesPoint[];
}

export interface SampleAnalyticsReport {
  period: ReportPeriod;
  dateRange: ReportDateRange;
  generatedAt: string;
  totalSamples: MetricValue;
  approvedSamples: MetricValue;
  firstRoundApprovalRate: MetricValue;
  averageApprovalCycleDays: MetricValue;
  rejectionRate: MetricValue;
  pendingReviewCount: MetricValue;
  stageBreakdown: DistributionItem[];
  buyerApprovalPerformance: Array<{
    buyerId: string;
    buyerName: string;
    totalSamples: number;
    approvalRate: number;
    avgCycleDays: number;
  }>;
  monthlySubmissions: TimeSeriesPoint[];
}

export interface DocumentAnalyticsReport {
  period: ReportPeriod;
  dateRange: ReportDateRange;
  generatedAt: string;
  totalDocuments: MetricValue;
  verifiedDocuments: MetricValue;
  complianceRate: MetricValue;
  pendingReviewCount: MetricValue;
  expiringSoonCount: MetricValue;
  categoryDistribution: DistributionItem[];
  documentChecklistStatus: Array<{
    orderId: string;
    orderNumber: string;
    buyerName: string;
    requiredDocsCount: number;
    approvedDocsCount: number;
    isCompliant: boolean;
  }>;
}

export interface ShipmentAnalyticsReport {
  period: ReportPeriod;
  dateRange: ReportDateRange;
  generatedAt: string;
  totalShipments: MetricValue;
  onTimeDispatchRate: MetricValue;
  inTransitShipments: MetricValue;
  deliveredShipments: MetricValue;
  averageDelayDays: MetricValue;
  transportModeDistribution: DistributionItem[];
  portDistribution: DistributionItem[];
  carrierPerformance: Array<{
    carrier: string;
    totalShipments: number;
    onTimeRate: number;
    avgDelayDays: number;
  }>;
  monthlyShipmentVolume: TimeSeriesPoint[];
}

export interface BuyerAnalyticsReport {
  period: ReportPeriod;
  dateRange: ReportDateRange;
  generatedAt: string;
  buyerOrgId: string;
  buyerName: string;
  totalOrders: MetricValue;
  totalQuantity: MetricValue;
  activeOrders: MetricValue;
  completedOrders: MetricValue;
  onTimeDeliveryRate: MetricValue;
  qualityPassRate: MetricValue;
  sampleApprovalSpeedDays: MetricValue;
  orderStatusDistribution: DistributionItem[];
  categoryDistribution: DistributionItem[];
  monthlyVolume: TimeSeriesPoint[];
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    styleNumber: string;
    productName: string;
    quantity: number;
    status: string;
    exFactoryDate: string;
    shipmentDate?: string;
  }>;
  activeShipments: Array<{
    id: string;
    shipmentNumber: string;
    trackingNumber?: string;
    carrier?: string;
    transportMode: string;
    status: string;
    estimatedArrival: string;
    destinationPort: string;
  }>;
}

export interface FactoryAnalyticsReport {
  period: ReportPeriod;
  dateRange: ReportDateRange;
  generatedAt: string;
  factories: Array<{
    factoryId: string;
    factoryName: string;
    country: string;
    activeOrdersCount: number;
    totalUnitsProduced: number;
    capacityUtilization: number;
    qualityPassRate: number;
    onTimeDeliveryRate: number;
    openDefectsCount: number;
    status: 'optimal' | 'warning' | 'critical';
  }>;
}

export interface ReportSnapshot {
  id: string;
  reportType: 'executive' | 'orders' | 'production' | 'quality' | 'samples' | 'documents' | 'shipments' | 'buyers' | 'factories';
  title: string;
  generatedAt: string;
  generatedBy: string;
  buyerOrganizationId?: string | null;
  filter: ReportFilter;
  payload: Record<string, unknown>;
  isPublic?: boolean;
}

export interface ExportReportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  redactInternal?: boolean;
}
