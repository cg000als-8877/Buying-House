import { describe, it, expect } from 'vitest';
import {
  calculatePercentage,
  calculatePassRate,
  calculateOnTimeRate,
  calculateTrendPercentage,
  calculateAverageDays,
  calculateVariance,
  getPeriodDateRange,
  filterByDateRange,
  aggregateByMonth,
  aggregateByCategory,
  createMetric,
  formatMetricNumber,
} from '@/lib/reporting/calculations';
import {
  enforceTenantFilter,
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
} from '@/lib/reporting';
import { hasPermission } from '@/lib/auth/permissions';
import { User, UserRole } from '@/types/auth';

describe('Reporting & Analytics Engine', () => {
  // ==========================================================================
  // 1. PURE CALCULATION ENGINE TESTS
  // ==========================================================================
  describe('Pure KPI Calculations', () => {
    it('calculates percentage correctly with division-by-zero protection', () => {
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 3)).toBe(33.3);
      expect(calculatePercentage(0, 100)).toBe(0);
      expect(calculatePercentage(50, 0)).toBe(0);
      expect(calculatePercentage(50, -10)).toBe(0);
      expect(calculatePercentage(NaN, 100)).toBe(0);
      expect(calculatePercentage(10, NaN)).toBe(0);
    });

    it('calculates pass rate safely', () => {
      expect(calculatePassRate(95, 100)).toBe(95);
      expect(calculatePassRate(0, 0)).toBe(0);
      expect(calculatePassRate(19, 20)).toBe(95);
      expect(calculatePassRate(20, 20)).toBe(100);
    });

    it('calculates on-time rate safely', () => {
      expect(calculateOnTimeRate(48, 50)).toBe(96);
      expect(calculateOnTimeRate(0, 0)).toBe(0);
    });

    it('calculates trend percentages between periods', () => {
      expect(calculateTrendPercentage(120, 100)).toBe(20);
      expect(calculateTrendPercentage(80, 100)).toBe(-20);
      expect(calculateTrendPercentage(100, 100)).toBe(0);
      expect(calculateTrendPercentage(100, 0)).toBe(100);
      expect(calculateTrendPercentage(0, 0)).toBe(0);
      expect(calculateTrendPercentage(100, null)).toBeNull();
      expect(calculateTrendPercentage(100, undefined)).toBeNull();
    });

    it('calculates average turnaround days across date pairs', () => {
      const datePairs = [
        { start: '2026-08-01', end: '2026-08-05' }, // 4 days
        { start: '2026-08-10', end: '2026-08-16' }, // 6 days
      ];
      expect(calculateAverageDays(datePairs)).toBe(5);

      // Handles empty, invalid or null pairs
      expect(calculateAverageDays([])).toBe(0);
      expect(calculateAverageDays([{ start: null, end: '2026-08-05' }])).toBe(0);
      expect(calculateAverageDays([{ start: 'invalid-date', end: '2026-08-05' }])).toBe(0);
    });

    it('calculates plan vs actual variance', () => {
      const res1 = calculateVariance(11000, 10000);
      expect(res1.variance).toBe(1000);
      expect(res1.percentVariance).toBe(10);

      const res2 = calculateVariance(8500, 10000);
      expect(res2.variance).toBe(-1500);
      expect(res2.percentVariance).toBe(-15);

      const res3 = calculateVariance(5000, 0);
      expect(res3.variance).toBe(5000);
      expect(res3.percentVariance).toBe(0);
    });

    it('formats metric numbers with proper locale separators and units', () => {
      expect(formatMetricNumber(1250000, 'USD')).toBe('$1,250,000');
      expect(formatMetricNumber(95.4, '%', 1)).toBe('95.4%');
      expect(formatMetricNumber(5000, 'pcs')).toBe('5,000 pcs');
      expect(formatMetricNumber(null)).toBe('0');
      expect(formatMetricNumber(undefined)).toBe('0');
    });

    it('creates structured MetricValue objects with automatic status evaluation', () => {
      const m1 = createMetric(120, { previous: 100, unit: 'pcs' });
      expect(m1.current).toBe(120);
      expect(m1.trendPercent).toBe(20);
      expect(m1.status).toBe('positive');

      // Inverted metric (e.g. defects - decrease is positive)
      const m2 = createMetric(15, { previous: 25, unit: 'defects', invertTrend: true });
      expect(m2.current).toBe(15);
      expect(m2.trendPercent).toBe(-40);
      expect(m2.status).toBe('positive');
    });
  });

  // ==========================================================================
  // 2. DATE FILTERING & TIME-SERIES AGGREGATIONS
  // ==========================================================================
  describe('Date Filtering & Aggregations', () => {
    const testItems = [
      { id: '1', date: '2026-01-15', category: 'Knitwear', qty: 1000 },
      { id: '2', date: '2026-01-20', category: 'Denim', qty: 2000 },
      { id: '3', date: '2026-02-10', category: 'Knitwear', qty: 1500 },
      { id: '4', date: '2026-03-05', category: 'Outerwear', qty: 3000 },
    ];

    it('filters items strictly by date range', () => {
      const filtered = filterByDateRange(testItems, 'date', {
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });
      expect(filtered.length).toBe(2);
      expect(filtered.map((i) => i.id)).toEqual(['1', '2']);
    });

    it('aggregates time series monthly data points accurately', () => {
      const timeSeries = aggregateByMonth(testItems, 'date', 'qty');
      expect(timeSeries.length).toBe(3);
      expect(timeSeries[0].value).toBe(3000); // Jan: 1000 + 2000
      expect(timeSeries[1].value).toBe(1500); // Feb: 1500
      expect(timeSeries[2].value).toBe(3000); // Mar: 3000
    });

    it('aggregates categories with count, sum and percentage distribution', () => {
      const distribution = aggregateByCategory(testItems, 'category', 'qty');
      expect(distribution.length).toBe(3);

      const knit = distribution.find((d) => d.name === 'Knitwear');
      expect(knit).toBeDefined();
      expect(knit?.value).toBe(2500);
      expect(knit?.count).toBe(2);
      expect(knit?.percentage).toBe(33.3); // 2500 / 7500 = 33.3%
    });

    it('resolves standard period date presets', () => {
      const allRange = getPeriodDateRange('all');
      expect(allRange.startDate).toBe('2020-01-01');

      const custom = getPeriodDateRange('custom', { startDate: '2026-05-01', endDate: '2026-05-31' });
      expect(custom.startDate).toBe('2026-05-01');
      expect(custom.endDate).toBe('2026-05-31');
    });
  });

  // ==========================================================================
  // 3. DOMAIN REPORT SERVICES & INTEGRATION
  // ==========================================================================
  describe('Domain Report Services', () => {
    it('generates ExecutiveSummaryReport with all core operational metrics', async () => {
      const report = await getExecutiveSummary();
      expect(report).toBeDefined();
      expect(report.totalOrderVolume.current).toBeGreaterThan(0);
      expect(report.totalOrderValue.current).toBeGreaterThan(0);
      expect(report.overallQualityPassRate.current).toBeGreaterThanOrEqual(0);
      expect(report.onTimeShipmentRate.current).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(report.monthlyOrderTrends)).toBe(true);
      expect(Array.isArray(report.criticalAlerts)).toBe(true);
    });

    it('generates OrderAnalyticsReport with status & category breakdowns', async () => {
      const report = await getOrderAnalytics();
      expect(report.totalOrders.current).toBeGreaterThan(0);
      expect(report.statusDistribution.length).toBeGreaterThan(0);
      expect(report.categoryDistribution.length).toBeGreaterThan(0);
      expect(report.ordersList.length).toBeGreaterThan(0);
    });

    it('generates ProductionAnalyticsReport with stage telemetry', async () => {
      const report = await getProductionAnalytics();
      expect(report.totalUnitsPlanned.current).toBeGreaterThan(0);
      expect(report.cuttingOutput.current).toBeGreaterThan(0);
      expect(report.sewingOutput.current).toBeGreaterThan(0);
      expect(report.factoryTelemetry.length).toBeGreaterThan(0);
    });

    it('generates QualityAnalyticsReport with defect Pareto analysis', async () => {
      const report = await getQualityAnalytics();
      expect(report.firstTimePassRate.current).toBeGreaterThan(0);
      expect(report.defectPareto.length).toBeGreaterThan(0);
      expect(report.defectPareto[0]).toHaveProperty('defectCategory');
      expect(report.defectPareto[0]).toHaveProperty('severity');
    });

    it('generates SampleAnalyticsReport with approval cycles', async () => {
      const report = await getSampleAnalytics();
      expect(report.totalSamples.current).toBeGreaterThan(0);
      expect(report.firstRoundApprovalRate.current).toBeGreaterThanOrEqual(0);
      expect(report.buyerApprovalPerformance.length).toBeGreaterThan(0);
    });

    it('generates DocumentAnalyticsReport with compliance dossiers', async () => {
      const report = await getDocumentAnalytics();
      expect(report.totalDocuments.current).toBeGreaterThan(0);
      expect(report.complianceRate.current).toBeGreaterThan(0);
      expect(report.documentChecklistStatus.length).toBeGreaterThan(0);
    });

    it('generates ShipmentAnalyticsReport with freight splits', async () => {
      const report = await getShipmentAnalytics();
      expect(report.totalShipments.current).toBeGreaterThan(0);
      expect(report.onTimeDispatchRate.current).toBeGreaterThan(0);
      expect(report.carrierPerformance.length).toBeGreaterThan(0);
    });

    it('generates FactoryAnalyticsReport with capacity load and quality ratings', async () => {
      const report = await getFactoryAnalytics();
      expect(report.factories.length).toBeGreaterThan(0);
      expect(report.factories[0]).toHaveProperty('capacityUtilization');
      expect(report.factories[0]).toHaveProperty('qualityPassRate');
    });
  });

  // ==========================================================================
  // 4. TENANT ISOLATION, BUYER PRIVACY & CSV EXPORT SANITIZATION
  // ==========================================================================
  describe('Tenant Isolation & CSV Export Sanitizer', () => {
    const mockBuyerUser: User = {
      uid: 'buyer-u-001',
      email: 'buyer@target-brand.com',
      displayName: 'Sarah Jenkins',
      role: 'Buyer',
      buyerOrganizationId: 'buyer-org-001',
      status: 'active',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    };

    const mockAdminUser: User = {
      uid: 'admin-u-001',
      email: 'admin@buyinghouse.com',
      displayName: 'Operations Director',
      role: 'Super Admin',
      buyerOrganizationId: null,
      status: 'active',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    };

    it('enforces tenant filter so buyer user cannot query other organizations', () => {
      // Attempt to query buyer-org-999
      const filter = { buyerOrganizationId: 'buyer-org-999', period: '30d' as const };
      const safe = enforceTenantFilter(filter, mockBuyerUser);
      expect(safe.buyerOrganizationId).toBe('buyer-org-001');
    });

    it('allows staff users to query any buyer organization', () => {
      const filter = { buyerOrganizationId: 'buyer-org-999', period: '30d' as const };
      const safe = enforceTenantFilter(filter, mockAdminUser);
      expect(safe.buyerOrganizationId).toBe('buyer-org-999');
    });

    it('generates buyer analytics strictly bounded to the buyer organization', async () => {
      const report = await getBuyerAnalytics({}, mockBuyerUser);
      expect(report.buyerOrgId).toBe('buyer-org-001');
      expect(report.totalOrders.current).toBeGreaterThan(0);
    });

    it('exports CSV with RFC 4180 escaping and quotes', () => {
      const rows = [
        { orderNumber: 'PO-001', buyer: 'Target, Inc.', remarks: 'Special "priority" handling' },
        { orderNumber: 'PO-002', buyer: 'Zara Corp', remarks: 'Line 1\nLine 2' },
      ];

      const csv = exportReportToCSV('orders', rows, 'orders.csv', mockAdminUser);
      expect(csv).toContain('"orderNumber","buyer","remarks"');
      expect(csv).toContain('"PO-001","Target, Inc.","Special ""priority"" handling"');
    });

    it('strictly redacts internal margins and private notes for buyer CSV exports', () => {
      const rows = [
        {
          orderNumber: 'PO-001',
          quantity: 10000,
          factoryMargin: '18.5%',
          costPrice: '$4.20',
          internalRemarks: 'Internal QC warning on yarn strength',
        },
      ];

      const buyerCSV = exportReportToCSV('orders', rows, 'buyer-orders.csv', mockBuyerUser);
      expect(buyerCSV).toContain('"orderNumber","quantity"');
      expect(buyerCSV).not.toContain('factoryMargin');
      expect(buyerCSV).not.toContain('costPrice');
      expect(buyerCSV).not.toContain('internalRemarks');

      // Admin CSV retains operational details
      const adminCSV = exportReportToCSV('orders', rows, 'admin-orders.csv', mockAdminUser);
      expect(adminCSV).toContain('factoryMargin');
      expect(adminCSV).toContain('costPrice');
      expect(adminCSV).toContain('internalRemarks');
    });
  });

  // ==========================================================================
  // 5. RBAC PERMISSIONS FOR REPORTING
  // ==========================================================================
  describe('Reporting RBAC Matrix', () => {
    it('verifies reporting permissions across all 7 platform roles', () => {
      const roles: UserRole[] = [
        'Super Admin',
        'Admin',
        'Operations Manager',
        'Merchandiser',
        'Production Staff',
        'QC Staff',
        'Buyer',
      ];

      // All roles can read reports (with tenant bounding for buyers)
      roles.forEach((role) => {
        expect(hasPermission(role, 'reports.read')).toBe(true);
      });

      // Export permissions
      expect(hasPermission('Super Admin', 'reports.export')).toBe(true);
      expect(hasPermission('Admin', 'reports.export')).toBe(true);
      expect(hasPermission('Operations Manager', 'reports.export')).toBe(true);
      expect(hasPermission('Merchandiser', 'reports.export')).toBe(true);
      expect(hasPermission('Buyer', 'reports.export')).toBe(true);
      expect(hasPermission('Production Staff', 'reports.export')).toBe(false);
      expect(hasPermission('QC Staff', 'reports.export')).toBe(false);

      // Advanced reporting permissions
      expect(hasPermission('Super Admin', 'reports.advanced')).toBe(true);
      expect(hasPermission('Admin', 'reports.advanced')).toBe(true);
      expect(hasPermission('Operations Manager', 'reports.advanced')).toBe(true);
      expect(hasPermission('Buyer', 'reports.advanced')).toBe(false);

      // Report configuration permissions
      expect(hasPermission('Super Admin', 'reports.configure')).toBe(true);
      expect(hasPermission('Admin', 'reports.configure')).toBe(true);
      expect(hasPermission('Operations Manager', 'reports.configure')).toBe(false);
      expect(hasPermission('Buyer', 'reports.configure')).toBe(false);
    });
  });
});
