'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Download,
  Calendar,
  Layers,
  Clock,
  Eye,
  Info,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import {
  Inspection,
  InspectionType,
  InspectionResult,
  LabTestReport,
} from '@/types/quality';
import {
  getInspectionsForBuyer,
  getLabTestReportsForBuyer,
} from '@/lib/quality';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

interface BuyerQualityViewProps {
  initialOrderId?: string;
  orderNumber?: string;
  buyerOrgId?: string;
}

type ActiveTab = 'inspections' | 'cap' | 'labReports';

export function BuyerQualityView({
  initialOrderId,
  orderNumber,
  buyerOrgId: propBuyerOrgId,
}: BuyerQualityViewProps) {
  const { user } = useAuth();
  const effectiveBuyerOrgId =
    propBuyerOrgId || user?.buyerOrganizationId || 'buyer-org-001';

  const [activeTab, setActiveTab] = useState<ActiveTab>('inspections');
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [labReports, setLabReports] = useState<LabTestReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<InspectionType | 'ALL'>('ALL');
  const [resultFilter, setResultFilter] = useState<InspectionResult | 'ALL'>('ALL');

  // Modal / Drawer state
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [selectedReport, setSelectedReport] = useState<LabTestReport | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadQualityData = async () => {
    setIsLoading(true);
    try {
      const [inspData, labData] = await Promise.all([
        getInspectionsForBuyer(effectiveBuyerOrgId, {
          orderId: initialOrderId,
          inspectionType: typeFilter,
          result: resultFilter,
          searchQuery: searchQuery,
        }),
        getLabTestReportsForBuyer(effectiveBuyerOrgId, {
          orderId: initialOrderId,
        }),
      ]);

      setInspections(inspData);
      setLabReports(labData);
    } catch (err) {
      console.error('Error fetching buyer quality records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQualityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveBuyerOrgId, initialOrderId, typeFilter, resultFilter]);

  // Derived Metrics
  const metrics = useMemo(() => {
    const total = inspections.length;
    const passed = inspections.filter((i) => i.result === 'PASS').length;
    const failed = inspections.filter((i) => i.result === 'FAIL').length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 100;

    const allCaps = inspections.flatMap((i) => i.correctiveActions || []);
    const pendingCaps = allCaps.filter(
      (c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS'
    ).length;

    const verifiedReports = labReports.filter(
      (l) => l.verificationStatus === 'VERIFIED'
    ).length;

    return {
      total,
      passed,
      failed,
      passRate,
      pendingCaps,
      verifiedReports,
    };
  }, [inspections, labReports]);

  // Filtered Inspections for client search
  const filteredInspections = useMemo(() => {
    return inspections.filter((insp) => {
      if (typeFilter !== 'ALL' && insp.inspectionType !== typeFilter) return false;
      if (resultFilter !== 'ALL' && insp.result !== resultFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const poMatch = insp.orderNumber.toLowerCase().includes(q);
        const styleMatch = insp.styleNumber.toLowerCase().includes(q);
        const remarksMatch = (insp.remarks || '').toLowerCase().includes(q);
        if (!poMatch && !styleMatch && !remarksMatch) return false;
      }
      return true;
    });
  }, [inspections, typeFilter, resultFilter, searchQuery]);

  // Extract all CAPs across inspections
  const allCorrectiveActions = useMemo(() => {
    const list: Array<{ inspection: Inspection; cap: NonNullable<Inspection['correctiveActions']>[number] }> = [];
    inspections.forEach((insp) => {
      if (insp.correctiveActions && insp.correctiveActions.length > 0) {
        insp.correctiveActions.forEach((cap) => {
          list.push({ inspection: insp, cap });
        });
      }
    });
    return list;
  }, [inspections]);

  // Filtered Lab Reports
  const filteredLabReports = useMemo(() => {
    return labReports.filter((report) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const repMatch = report.reportNumber.toLowerCase().includes(q);
        const catMatch = report.testCategory.toLowerCase().includes(q);
        const labMatch = report.labName.toLowerCase().includes(q);
        const refMatch = (report.sampleReference || '').toLowerCase().includes(q);
        if (!repMatch && !catMatch && !labMatch && !refMatch) return false;
      }
      return true;
    });
  }, [labReports, searchQuery]);

  const handleDownloadReport = (report: LabTestReport) => {
    if (report.documentUrl) {
      window.open(report.documentUrl, '_blank');
      setNotice(`Opening verified laboratory report: ${report.fileName}`);
      setTimeout(() => setNotice(null), 4000);
    } else {
      setNotice(`Report file is pending final attachment by accredited laboratory.`);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const renderResultBadge = (result: InspectionResult) => {
    switch (result) {
      case 'PASS':
        return (
          <Badge variant="success" className="font-semibold gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PASS
          </Badge>
        );
      case 'FAIL':
        return (
          <Badge variant="danger" className="font-semibold gap-1">
            <XCircle className="w-3.5 h-3.5" />
            FAIL
          </Badge>
        );
      case 'PENDING':
      default:
        return (
          <Badge variant="warning" className="font-semibold gap-1">
            <Clock className="w-3.5 h-3.5" />
            PENDING
          </Badge>
        );
    }
  };

  const renderTypeBadge = (type: InspectionType) => {
    const map: Record<InspectionType, { label: string; variant: 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' }> = {
      PP_MEETING: { label: 'Pre-Production', variant: 'secondary' },
      INLINE: { label: 'Inline Inspection', variant: 'primary' },
      MIDLINE: { label: 'Midline Inspection', variant: 'neutral' },
      FINAL_RANDOM: { label: 'Final Random (FRI)', variant: 'success' },
      REINSPECTION: { label: 'Re-Inspection', variant: 'warning' },
    };
    const conf = map[type] || { label: type, variant: 'neutral' };
    return <Badge variant={conf.variant}>{conf.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-teal" />
            <h2 className="text-xl font-bold text-navy">
              Quality Assurance & AQL Inspection Portal
            </h2>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Standard ANSI/ASQ Z1.4 (ISO 2859-1) inspection audits, real-time defect breakdowns, Corrective Action Plans (CAP), and accredited laboratory certifications.
          </p>
        </div>
        {orderNumber && (
          <Badge variant="secondary" className="self-start sm:self-auto text-xs px-3 py-1">
            Filtered for PO: <span className="font-mono ml-1">{orderNumber}</span>
          </Badge>
        )}
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-lg flex items-center justify-between text-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-teal shrink-0" />
            <span>{notice}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-teal-700 hover:text-teal-900 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Published Audits
            </p>
            <p className="text-2xl font-bold text-navy mt-1">{metrics.total}</p>
            <p className="text-xs text-text-muted mt-0.5">
              Across all production stages
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              AQL Pass Rate
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {metrics.passRate}%
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {metrics.passed} Passed / {metrics.failed} Failed
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Active CAP Actions
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {metrics.pendingCaps}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Under factory resolution
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Lab Certifications
            </p>
            <p className="text-2xl font-bold text-navy mt-1">
              {metrics.verifiedReports}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Accredited third-party tests
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Navigation Tabs & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('inspections')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'inspections'
                ? 'bg-navy text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Inspection Audits ({filteredInspections.length})
          </button>
          <button
            onClick={() => setActiveTab('cap')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cap'
                ? 'bg-navy text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Corrective Actions (CAP) ({allCorrectiveActions.length})
          </button>
          <button
            onClick={() => setActiveTab('labReports')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'labReports'
                ? 'bg-navy text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Lab Test Reports ({filteredLabReports.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search PO, style, lab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal/50"
            />
          </div>

          {activeTab === 'inspections' && (
            <>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as InspectionType | 'ALL')}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal/50 text-slate-700"
              >
                <option value="ALL">All Types</option>
                <option value="PP_MEETING">Pre-Production</option>
                <option value="INLINE">Inline</option>
                <option value="MIDLINE">Midline</option>
                <option value="FINAL_RANDOM">Final Random (FRI)</option>
                <option value="REINSPECTION">Re-Inspection</option>
              </select>

              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value as InspectionResult | 'ALL')}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-teal/50 text-slate-700"
              >
                <option value="ALL">All Results</option>
                <option value="PASS">Pass Only</option>
                <option value="FAIL">Fail Only</option>
                <option value="PENDING">Pending</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* TAB 1: INSPECTION AUDITS */}
      {activeTab === 'inspections' && (
        <div className="space-y-4">
          {filteredInspections.length === 0 ? (
            <EmptyState
              title="No Quality Inspections Found"
              description="No published inspection audits match your current filter parameters."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredInspections.map((insp) => (
                <Card
                  key={insp.id}
                  className="p-5 bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Primary Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {renderTypeBadge(insp.inspectionType)}
                        {renderResultBadge(insp.result)}
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          PO: {insp.orderNumber}
                        </span>
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Style: {insp.styleNumber}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                        <div>
                          <span className="text-text-muted block">Audit Date:</span>
                          <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {insp.inspectionDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Sampling Standard:</span>
                          <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            AQL {insp.aqlLevel} (Maj {insp.aqlMajor}% / Min {insp.aqlMinor}%)
                          </span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Sample / Lot:</span>
                          <span className="font-semibold text-slate-800 block mt-0.5">
                            {insp.sampleSize} / {insp.orderQuantity.toLocaleString()} pcs
                          </span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Defect Tally:</span>
                          <span className="font-medium block mt-0.5">
                            <span className="text-emerald-700 font-semibold">
                              Maj: {insp.majorDefects}/{insp.maxAllowedMajor}
                            </span>
                            {' • '}
                            <span className="text-blue-700 font-semibold">
                              Min: {insp.minorDefects}/{insp.maxAllowedMinor}
                            </span>
                            {insp.criticalDefects > 0 && (
                              <span className="text-red-600 font-bold ml-1">
                                (Crit: {insp.criticalDefects})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {insp.remarks && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 mt-2">
                          <span className="font-semibold text-slate-700">Auditor Summary:</span>{' '}
                          {insp.remarks}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 shrink-0">
                      <button
                        onClick={() => setSelectedInspection(insp)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Audit
                      </button>

                      {insp.correctiveActions && insp.correctiveActions.length > 0 && (
                        <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          {insp.correctiveActions.length} CAP Registered
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CORRECTIVE ACTION PLANS (CAP) */}
      {activeTab === 'cap' && (
        <div className="space-y-4">
          {allCorrectiveActions.length === 0 ? (
            <EmptyState
              title="No Corrective Actions Registered"
              description="All published inspections comply with buyer quality standards. No active CAPs are required."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {allCorrectiveActions.map(({ inspection, cap }, idx) => (
                <Card
                  key={cap.id || idx}
                  className="p-5 bg-white border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-navy">
                        CAP #{cap.id.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        PO: {inspection.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                        Style: {inspection.styleNumber}
                      </span>
                    </div>

                    <Badge
                      variant={
                        cap.status === 'VERIFIED'
                          ? 'success'
                          : cap.status === 'COMPLETED'
                          ? 'primary'
                          : cap.status === 'IN_PROGRESS'
                          ? 'warning'
                          : 'danger'
                      }
                      className="text-xs font-semibold"
                    >
                      Status: {cap.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-red-50/50 rounded-lg border border-red-100">
                      <p className="font-semibold text-red-900 mb-1">Issue / Root Cause:</p>
                      <p className="text-red-700">{cap.rootCause}</p>
                    </div>

                    <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                      <p className="font-semibold text-emerald-900 mb-1">Factory Action Plan:</p>
                      <p className="text-emerald-800">{cap.actionPlan}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-600 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <span>
                        <strong className="text-slate-700">Target Date:</strong>{' '}
                        {cap.targetDate}
                      </span>
                      {cap.assignedTo && (
                        <span>
                          <strong className="text-slate-700">Responsible:</strong>{' '}
                          {cap.assignedTo}
                        </span>
                      )}
                    </div>

                    {cap.verificationNotes && (
                      <span className="text-slate-500 italic">
                        QA Verification: &ldquo;{cap.verificationNotes}&rdquo;
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACCREDITED LAB TEST REPORTS */}
      {activeTab === 'labReports' && (
        <div className="space-y-4">
          {filteredLabReports.length === 0 ? (
            <EmptyState
              title="No Laboratory Reports Found"
              description="No verified third-party laboratory test reports are available for this search."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLabReports.map((report) => (
                <Card
                  key={report.id}
                  className="p-5 bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-semibold">
                          {report.testCategory}
                        </Badge>
                        <Badge
                          variant={report.result === 'PASS' ? 'success' : 'danger'}
                          className="font-semibold"
                        >
                          Result: {report.result}
                        </Badge>
                        <Badge
                          variant={
                            report.verificationStatus === 'VERIFIED'
                              ? 'success'
                              : 'warning'
                          }
                          className="font-medium text-xs"
                        >
                          {report.verificationStatus === 'VERIFIED'
                            ? 'ISO/IEC 17025 Accredited'
                            : 'Verification Pending'}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-navy flex items-center gap-2">
                          {report.reportNumber}
                          <span className="text-xs font-normal text-slate-500 font-mono">
                            (PO: {report.orderNumber})
                          </span>
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Testing Body: <span className="font-semibold text-slate-800">{report.labName}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Sample Reference: {report.sampleReference} • Tested on: {report.reportDate}
                        </p>
                      </div>

                      {/* Parameters snippet */}
                      {report.testParameters && report.testParameters.length > 0 && (
                        <div className="pt-2">
                          <p className="text-xs font-semibold text-slate-700 mb-1">
                            Key Standard Parameters Tested:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {report.testParameters.slice(0, 4).map((p, pIdx) => (
                              <div
                                key={pIdx}
                                className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-medium text-slate-800 block">
                                    {p.parameter}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    Std: {p.standard}
                                  </span>
                                </div>
                                <span className="font-semibold text-emerald-700 text-right shrink-0 ml-2">
                                  {p.result}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {report.remarks && (
                        <p className="text-xs text-slate-600 italic bg-teal-50/50 p-2 rounded border border-teal-100 mt-2">
                          Conclusion: {report.remarks}
                        </p>
                      )}
                    </div>

                    {/* Report Download Action */}
                    <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="px-4 py-2 bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        Download Certificate
                      </button>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Full Inspection Audit Details */}
      {selectedInspection && (
        <Modal
          isOpen={!!selectedInspection}
          onClose={() => setSelectedInspection(null)}
          title={`Quality Audit: ${selectedInspection.orderNumber} (${selectedInspection.inspectionType})`}
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header info banner */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {renderTypeBadge(selectedInspection.inspectionType)}
                  {renderResultBadge(selectedInspection.result)}
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Audit ID: {selectedInspection.id}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-200">
                <div>
                  <span className="text-text-muted block">Order / Style:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedInspection.orderNumber} / {selectedInspection.styleNumber}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Audit Date:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedInspection.inspectionDate}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Lot Size / Sample:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedInspection.orderQuantity.toLocaleString()} pcs / {selectedInspection.sampleSize} sample
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">AQL Level / Plan:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedInspection.aqlLevel} (Maj: {selectedInspection.aqlMajor}%, Min: {selectedInspection.aqlMinor}%)
                  </span>
                </div>
              </div>
            </div>

            {/* AQL Acceptance Evaluation Matrix */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-navy flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-teal" />
                AQL ANSI/ASQ Z1.4 Sampling Matrix
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-semibold text-red-900">Critical Defects</p>
                  <p className="text-xl font-bold text-red-700 mt-1">
                    {selectedInspection.criticalDefects}
                  </p>
                  <p className="text-[11px] text-red-600 mt-0.5">Max Allowed: 0</p>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="font-semibold text-amber-900">Major Defects</p>
                  <p className="text-xl font-bold text-amber-700 mt-1">
                    {selectedInspection.majorDefects}
                  </p>
                  <p className="text-[11px] text-amber-600 mt-0.5">
                    Max Allowed: {selectedInspection.maxAllowedMajor}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-semibold text-blue-900">Minor Defects</p>
                  <p className="text-xl font-bold text-blue-700 mt-1">
                    {selectedInspection.minorDefects}
                  </p>
                  <p className="text-[11px] text-blue-600 mt-0.5">
                    Max Allowed: {selectedInspection.maxAllowedMinor}
                  </p>
                </div>
              </div>
            </div>

            {/* Defect Item Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-navy flex items-center justify-between">
                <span>Observed Defect Breakdown ({selectedInspection.defects?.length || 0})</span>
                <span className="text-xs font-normal text-text-muted">
                  Inspected Sample: {selectedInspection.sampleSize} garments
                </span>
              </h4>

              {(!selectedInspection.defects || selectedInspection.defects.length === 0) ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  Zero non-conformities identified during this inspection round.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedInspection.defects.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-lg border border-slate-200 bg-white space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              d.severity === 'CRITICAL'
                                ? 'danger'
                                : d.severity === 'MAJOR'
                                ? 'warning'
                                : 'neutral'
                            }
                            className="font-bold text-[10px]"
                          >
                            {d.severity}
                          </Badge>
                          <span className="font-semibold text-slate-800">
                            {d.category}
                          </span>
                        </div>
                        <span className="font-bold text-slate-700">
                          Qty: {d.quantity} pcs
                        </span>
                      </div>
                      <p className="text-slate-600">{d.description}</p>
                      {d.location && (
                        <p className="text-slate-400 text-[11px]">
                          Location: {d.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Auditor remarks */}
            {selectedInspection.remarks && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <p className="text-xs font-bold text-slate-700">Auditor Summary & Recommendations</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedInspection.remarks}
                </p>
              </div>
            )}

            {/* Notice for Confidential Internal notes */}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2 text-xs text-blue-800">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Standard buyer quality audit report. Internal QA staff notes are sanitized in accordance with commercial confidentiality.
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Full Lab Test Report Details */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Lab Test Certificate: ${selectedReport.reportNumber}`}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="font-semibold">
                  {selectedReport.testCategory}
                </Badge>
                <Badge
                  variant={selectedReport.result === 'PASS' ? 'success' : 'danger'}
                  className="font-semibold"
                >
                  {selectedReport.result}
                </Badge>
              </div>
              <p className="text-sm font-bold text-navy mt-1">
                {selectedReport.labName}
              </p>
              <p className="text-slate-600">
                Sample Tested: <span className="font-semibold">{selectedReport.sampleReference}</span>
              </p>
              <p className="text-slate-500">
                Report Date: {selectedReport.reportDate} • PO: {selectedReport.orderNumber}
              </p>
            </div>

            {/* Test Parameters */}
            {selectedReport.testParameters && selectedReport.testParameters.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-navy uppercase tracking-wider">
                  Test Parameters & Methodologies
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="p-2.5">Parameter</th>
                        <th className="p-2.5">Test Standard</th>
                        <th className="p-2.5">Observed Value</th>
                        <th className="p-2.5 text-right">Evaluation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedReport.testParameters.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-medium text-slate-800">
                            {p.parameter}
                          </td>
                          <td className="p-2.5 text-slate-500">{p.standard}</td>
                          <td className="p-2.5 font-semibold text-slate-700">
                            {p.result}
                          </td>
                          <td className="p-2.5 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.pass
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {p.pass ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Remarks */}
            {selectedReport.remarks && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs space-y-1 text-teal-900">
                <p className="font-bold">Laboratory Conclusion</p>
                <p>{selectedReport.remarks}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadReport(selectedReport)}
                className="px-4 py-2 bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
