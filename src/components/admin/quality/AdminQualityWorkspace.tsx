'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  FileText,
  FlaskConical,
  RotateCcw,
  Eye,
  Send,
  X,
  Trash2,
  Calendar,
  Building2,
  Package,
  Layers,
  ChevronRight,
  ExternalLink,
  Sliders,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { hasPermission } from '@/lib/auth/permissions';
import { UserRole } from '@/types/auth';
import {
  Inspection,
  InspectionType,
  InspectionResult,
  InspectionStatus,
  DefectItem,
  DefectSeverity,
  DefectCategory,
  InspectionLevel,
  LabTestReport,
  LabTestCategory,
  QualitySummaryMetrics,
} from '@/types/quality';
import {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  publishInspection,
  rejectInspection,
  createCorrectiveAction,
  updateCorrectiveAction,
  requestReinspection,
  createReinspection,
  getLabTestReports,
  createLabTestReport,
  publishLabTestReport,
  getQualityMetrics,
} from '@/lib/quality';
import {
  calculateAQLResult,
  getSampleSize,
  getCodeLetter,
} from '@/lib/quality/calculations';
import {
  INSPECTION_TYPES,
  DEFECT_CATEGORIES,
  DEFECT_SEVERITIES,
  LAB_TEST_CATEGORIES,
} from '@/lib/validation/quality.schema';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface AdminQualityWorkspaceProps {
  initialOrderId?: string;
  orderNumber?: string;
}

export function AdminQualityWorkspace({
  initialOrderId,
  orderNumber,
}: AdminQualityWorkspaceProps) {
  const { user } = useAuth();
  const canWrite = hasPermission(user?.role, 'quality.write');
  const canPublish = hasPermission(user?.role, 'quality.publish');
  const canReinspect = hasPermission(user?.role, 'quality.reinspection');
  const canLabReports = hasPermission(user?.role, 'quality.labReports');

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [labReports, setLabReports] = useState<LabTestReport[]>([]);
  const [metrics, setMetrics] = useState<QualitySummaryMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [activeTab, setActiveTab] = useState<'inspections' | 'labReports' | 'calculator'>('inspections');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [isCapModalOpen, setIsCapModalOpen] = useState(false);
  const [isReinspectModalOpen, setIsReinspectModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);

  // Notice & Feedback
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Inspection Form State
  const [formData, setFormData] = useState({
    orderId: initialOrderId || 'TEST-ORDER-001',
    orderNumber: orderNumber || 'PO-2026-0891',
    styleNumber: 'STY-KNIT-401',
    buyerOrganizationId: 'buyer-org-001',
    factoryId: 'FAC-001',
    inspectionType: 'FINAL_RANDOM' as InspectionType,
    inspectionDate: new Date().toISOString().split('T')[0],
    orderQuantity: 10000,
    inspectedQuantity: 200,
    aqlLevel: 'GII' as InspectionLevel,
    aqlMajor: 2.5,
    aqlMinor: 4.0,
    remarks: '',
    internalNotes: '',
    published: false,
  });

  const [formDefects, setFormDefects] = useState<
    Array<{
      category: DefectCategory;
      severity: DefectSeverity;
      quantity: number;
      location: string;
      description: string;
    }>
  >([]);

  // CAP Form State
  const [capFormData, setCapFormData] = useState({
    issueDescription: '',
    rootCause: '',
    actionRequired: '',
    responsibleParty: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  // Re-inspection Form State
  const [reinspectReason, setReinspectReason] = useState('');

  // Lab Report Form State
  const [labFormData, setLabFormData] = useState({
    reportNumber: `LAB-2026-${Date.now().toString(36).toUpperCase()}`,
    testCategory: 'Color Fastness' as LabTestCategory,
    labName: 'Bureau Veritas Consumer Products Services',
    reportDate: new Date().toISOString().split('T')[0],
    sampleReference: 'Bulk Production Fabric Swatch',
    orderId: initialOrderId || 'TEST-ORDER-001',
    orderNumber: orderNumber || 'PO-2026-0891',
    buyerOrganizationId: 'buyer-org-001',
    result: 'PASS' as 'PASS' | 'FAIL' | 'CONDITIONAL',
    verificationStatus: 'VERIFIED' as 'VERIFIED' | 'VERIFICATION_REQUIRED' | 'PENDING',
    visibility: 'buyer' as 'buyer' | 'internal',
    remarks: 'Complies with buyer performance benchmarks.',
    published: true,
  });

  // Calculator helper state
  const [calcLotSize, setCalcLotSize] = useState<number>(10000);
  const [calcLevel, setCalcLevel] = useState<InspectionLevel>('GII');
  const [calcMajorAQL, setCalcMajorAQL] = useState<number>(2.5);
  const [calcMinorAQL, setCalcMinorAQL] = useState<number>(4.0);
  const [calcMajorDefects, setCalcMajorDefects] = useState<number>(3);
  const [calcMinorDefects, setCalcMinorDefects] = useState<number>(7);
  const [calcCriticalDefects, setCalcCriticalDefects] = useState<number>(0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [inspData, labData, metricsData] = await Promise.all([
        getInspections(initialOrderId ? { orderId: initialOrderId } : undefined),
        getLabTestReports(initialOrderId ? { orderId: initialOrderId } : undefined),
        getQualityMetrics(initialOrderId),
      ]);
      setInspections(inspData);
      setLabReports(labData);
      setMetrics(metricsData);
    } catch (err) {
      console.error('Error loading quality data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [initialOrderId]);

  // Live AQL calculation for Create Inspection modal
  const liveAQLResult = useMemo(() => {
    let criticalCount = 0;
    let majorCount = 0;
    let minorCount = 0;

    formDefects.forEach((d) => {
      if (d.severity === 'CRITICAL') criticalCount += Number(d.quantity) || 0;
      if (d.severity === 'MAJOR') majorCount += Number(d.quantity) || 0;
      if (d.severity === 'MINOR') minorCount += Number(d.quantity) || 0;
    });

    try {
      return calculateAQLResult({
        lotSize: Number(formData.orderQuantity) || 100,
        inspectedQuantity: Number(formData.inspectedQuantity) || 20,
        level: formData.aqlLevel,
        majorAQL: Number(formData.aqlMajor) || 2.5,
        minorAQL: Number(formData.aqlMinor) || 4.0,
        criticalAQL: 0,
        defects: {
          critical: criticalCount,
          major: majorCount,
          minor: minorCount,
        },
      });
    } catch {
      return null;
    }
  }, [formData, formDefects]);

  // Interactive calculator calculation
  const interactiveCalcResult = useMemo(() => {
    try {
      return calculateAQLResult({
        lotSize: Number(calcLotSize) || 100,
        level: calcLevel,
        majorAQL: Number(calcMajorAQL) || 2.5,
        minorAQL: Number(calcMinorAQL) || 4.0,
        criticalAQL: 0,
        defects: {
          critical: Number(calcCriticalDefects) || 0,
          major: Number(calcMajorDefects) || 0,
          minor: Number(calcMinorDefects) || 0,
        },
      });
    } catch {
      return null;
    }
  }, [calcLotSize, calcLevel, calcMajorAQL, calcMinorAQL, calcCriticalDefects, calcMajorDefects, calcMinorDefects]);

  const handleAddDefectLine = () => {
    setFormDefects([
      ...formDefects,
      {
        category: 'Workmanship',
        severity: 'MAJOR',
        quantity: 1,
        location: '',
        description: '',
      },
    ]);
  };

  const handleRemoveDefectLine = (index: number) => {
    setFormDefects(formDefects.filter((_, i) => i !== index));
  };

  const handleDefectChange = (
    index: number,
    field: 'category' | 'severity' | 'quantity' | 'location' | 'description',
    value: unknown
  ) => {
    const next = [...formDefects];
    next[index] = { ...next[index], [field]: value };
    setFormDefects(next);
  };

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      await createInspection(
        {
          orderId: formData.orderId,
          orderNumber: formData.orderNumber,
          styleNumber: formData.styleNumber,
          buyerOrganizationId: formData.buyerOrganizationId,
          factoryId: formData.factoryId,
          inspectionType: formData.inspectionType,
          inspectionDate: formData.inspectionDate,
          inspectorId: user.uid,
          inspectorName: user.displayName || 'QA Auditor',
          orderQuantity: Number(formData.orderQuantity),
          inspectedQuantity: Number(formData.inspectedQuantity),
          aqlLevel: formData.aqlLevel,
          aqlMajor: Number(formData.aqlMajor),
          aqlMinor: Number(formData.aqlMinor),
          defects: formDefects.map((d) => ({
            category: d.category,
            severity: d.severity,
            quantity: Number(d.quantity),
            location: d.location,
            description: d.description,
          })),
          remarks: formData.remarks,
          internalNotes: formData.internalNotes,
          published: formData.published,
        },
        { uid: user.uid, role: user.role, displayName: user.displayName }
      );

      setNotice(`Inspection recorded successfully for ${formData.orderNumber}.`);
      setTimeout(() => setNotice(null), 4000);
      setIsCreateModalOpen(false);
      setFormDefects([]);
      await loadData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFormError(error.message || 'Failed to record inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (inspection: Inspection) => {
    if (!user) return;
    try {
      await publishInspection(inspection.id, { uid: user.uid, role: user.role });
      setNotice(`Inspection ${inspection.id} published to buyer portal.`);
      setTimeout(() => setNotice(null), 4000);
      await loadData();
      if (selectedInspection?.id === inspection.id) {
        setSelectedInspection({ ...selectedInspection, published: true });
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || 'Failed to publish inspection');
    }
  };

  const handleCreateCap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInspection || !user) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const updated = await createCorrectiveAction(
        selectedInspection.id,
        {
          inspectionId: selectedInspection.id,
          orderId: selectedInspection.orderId,
          issueDescription: capFormData.issueDescription,
          rootCause: capFormData.rootCause,
          actionRequired: capFormData.actionRequired,
          responsibleParty: capFormData.responsibleParty,
          dueDate: capFormData.dueDate,
          status: 'open',
        },
        { uid: user.uid, role: user.role, displayName: user.displayName }
      );

      setSelectedInspection(updated);
      setIsCapModalOpen(false);
      setNotice('Corrective Action Plan registered.');
      setTimeout(() => setNotice(null), 4000);
      await loadData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFormError(error.message || 'Failed to create corrective action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCapStatus = async (status: 'open' | 'in_progress' | 'completed' | 'verified') => {
    if (!selectedInspection || !user) return;
    try {
      const updated = await updateCorrectiveAction(
        selectedInspection.id,
        status,
        `Status transitioned to ${status} by ${user.displayName || user.role}`,
        { uid: user.uid, role: user.role, displayName: user.displayName }
      );
      setSelectedInspection(updated);
      setNotice(`CAP status updated to ${status}.`);
      setTimeout(() => setNotice(null), 4000);
      await loadData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || 'Failed to update CAP status');
    }
  };

  const handleCreateReinspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInspection || !user) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      await createReinspection(
        selectedInspection.id,
        {
          orderId: selectedInspection.orderId,
          orderNumber: selectedInspection.orderNumber,
          styleNumber: selectedInspection.styleNumber,
          buyerOrganizationId: selectedInspection.buyerOrganizationId,
          factoryId: selectedInspection.factoryId,
          inspectionType: 'REINSPECTION',
          inspectionDate: new Date().toISOString().split('T')[0],
          inspectorId: user.uid,
          inspectorName: user.displayName || 'QA Auditor',
          orderQuantity: selectedInspection.orderQuantity,
          inspectedQuantity: selectedInspection.inspectedQuantity,
          aqlLevel: selectedInspection.aqlLevel,
          aqlMajor: selectedInspection.aqlMajor,
          aqlMinor: selectedInspection.aqlMinor,
          defects: [],
          remarks: `Re-inspection audit following CAP. Initial reason: ${reinspectReason}`,
          published: false,
        },
        { uid: user.uid, role: user.role, displayName: user.displayName }
      );

      setIsReinspectModalOpen(false);
      setNotice('Re-inspection round registered.');
      setTimeout(() => setNotice(null), 4000);
      await loadData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFormError(error.message || 'Failed to create re-inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLabReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      await createLabTestReport(
        {
          reportNumber: labFormData.reportNumber,
          testCategory: labFormData.testCategory,
          labName: labFormData.labName,
          reportDate: labFormData.reportDate,
          sampleReference: labFormData.sampleReference,
          orderId: labFormData.orderId,
          orderNumber: labFormData.orderNumber,
          buyerOrganizationId: labFormData.buyerOrganizationId,
          result: labFormData.result,
          verificationStatus: labFormData.verificationStatus,
          visibility: labFormData.visibility,
          remarks: labFormData.remarks,
          published: labFormData.published,
        },
        { uid: user.uid, role: user.role, displayName: user.displayName }
      );

      setIsLabModalOpen(false);
      setNotice(`Laboratory report ${labFormData.reportNumber} registered.`);
      setTimeout(() => setNotice(null), 4000);
      await loadData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFormError(error.message || 'Failed to register lab report');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter((insp) => {
      if (typeFilter !== 'ALL' && insp.inspectionType !== typeFilter) return false;
      if (resultFilter !== 'ALL' && insp.result !== resultFilter) return false;
      if (statusFilter !== 'ALL' && insp.inspectionStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          insp.orderNumber.toLowerCase().includes(q) ||
          insp.styleNumber.toLowerCase().includes(q) ||
          insp.inspectorName.toLowerCase().includes(q) ||
          insp.factoryId.toLowerCase().includes(q) ||
          (insp.remarks || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [inspections, typeFilter, resultFilter, statusFilter, searchQuery]);

  const getResultBadge = (result: InspectionResult) => {
    switch (result) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> PASS
          </span>
        );
      case 'CONDITIONAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-medium bg-amber-950 text-amber-400 border border-amber-800">
            <AlertTriangle className="w-3 h-3" /> CONDITIONAL
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-medium bg-rose-950 text-rose-400 border border-rose-800">
            <XCircle className="w-3 h-3" /> FAIL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-medium bg-slate-800 text-slate-300">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
    }
  };

  const getInspectionTypeLabel = (type: InspectionType) => {
    switch (type) {
      case 'PP_MEETING':
        return 'Pre-Production (PP) Meeting';
      case 'INLINE':
        return 'Inline Floor Inspection';
      case 'MIDLINE':
        return 'Mid-Line / In-Process';
      case 'FINAL_RANDOM':
        return 'Final Random Inspection (FRI)';
      case 'REINSPECTION':
        return 'Re-Inspection Audit';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {notice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-400/60 hover:text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-white">
              Quality Assurance &amp; AQL Inspection Vault
            </h2>
            <Badge variant="blue" size="sm">
              ISO 2859-1 Engine
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard ANSI/ASQ Z1.4 sampling, defect classifications, AQL evaluations, and accredited laboratory certificates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canLabReports && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLabModalOpen(true)}
              className="gap-1.5 text-xs text-slate-300 border-slate-700 hover:text-white"
            >
              <FlaskConical className="w-3.5 h-3.5 text-sky-400" />
              <span>Record Lab Report</span>
            </Button>
          )}

          {canWrite && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setFormData({
                  orderId: initialOrderId || 'TEST-ORDER-001',
                  orderNumber: orderNumber || 'PO-2026-0891',
                  styleNumber: 'STY-KNIT-401',
                  buyerOrganizationId: 'buyer-org-001',
                  factoryId: 'FAC-001',
                  inspectionType: 'FINAL_RANDOM',
                  inspectionDate: new Date().toISOString().split('T')[0],
                  orderQuantity: 10000,
                  inspectedQuantity: 200,
                  aqlLevel: 'GII',
                  aqlMajor: 2.5,
                  aqlMinor: 4.0,
                  remarks: '',
                  internalNotes: '',
                  published: false,
                });
                setFormDefects([]);
                setIsCreateModalOpen(true);
              }}
              className="gap-1.5 text-xs bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Inspection Audit</span>
            </Button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <Card className="p-4 bg-slate-900/80 border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-slate-400">Total Audits</span>
            <div className="text-xl font-bold font-medium text-white">{metrics.totalInspections}</div>
            <div className="text-[10px] text-slate-500">Across workflow</div>
          </Card>

          <Card className="p-4 bg-slate-900/80 border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-emerald-400">Pass Rate</span>
            <div className="text-xl font-bold font-medium text-emerald-400">{metrics.passRatePercentage}%</div>
            <div className="text-[10px] text-emerald-400/70">{metrics.passedCount} Passed audits</div>
          </Card>

          <Card className="p-4 bg-slate-900/80 border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-amber-400">Conditional</span>
            <div className="text-xl font-bold font-medium text-amber-400">{metrics.conditionalCount}</div>
            <div className="text-[10px] text-amber-400/70">Minor tolerance only</div>
          </Card>

          <Card className="p-4 bg-slate-900/80 border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-rose-400">Failed Audits</span>
            <div className="text-xl font-bold font-medium text-rose-400">{metrics.failedCount}</div>
            <div className="text-[10px] text-rose-400/70">Threshold exceeded</div>
          </Card>

          <Card className="p-4 bg-slate-900/80 border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-amber-400">Open CAPs</span>
            <div className="text-xl font-bold font-medium text-white">{metrics.openCorrectiveActions}</div>
            <div className="text-[10px] text-slate-400">Pending verification</div>
          </Card>

          <Card className="p-4 bg-slate-900/80 border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-sky-400">Lab Reports</span>
            <div className="text-xl font-bold font-medium text-sky-400">{metrics.totalLabReports}</div>
            <div className="text-[10px] text-sky-400/70">Accredited tests</div>
          </Card>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('inspections')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
            activeTab === 'inspections'
              ? 'border-amber-400 text-amber-400 font-bold bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Factory Inspections ({inspections.length})
        </button>
        <button
          onClick={() => setActiveTab('labReports')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
            activeTab === 'labReports'
              ? 'border-amber-400 text-amber-400 font-bold bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Laboratory Test Reports ({labReports.length})
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
            activeTab === 'calculator'
              ? 'border-amber-400 text-amber-400 font-bold bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Interactive AQL Calculator
        </button>
      </div>

      {/* TAB 1: INSPECTIONS */}
      {activeTab === 'inspections' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search PO, style, factory, or inspector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Types</option>
                {INSPECTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {getInspectionTypeLabel(t)}
                  </option>
                ))}
              </select>

              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Results</option>
                <option value="PASS">Pass</option>
                <option value="CONDITIONAL">Conditional</option>
                <option value="FAIL">Fail</option>
              </select>
            </div>
          </div>

          {/* Inspections Table */}
          {isLoading ? (
            <Card className="p-8 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </Card>
          ) : filteredInspections.length === 0 ? (
            <Card className="p-12 text-center border-slate-800">
              <EmptyState
                title="No Quality Inspections Found"
                description="No inspection records match the current filter criteria."
              />
            </Card>
          ) : (
            <Card className="overflow-hidden border-slate-800 bg-slate-900/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-medium uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Order / PO</th>
                      <th className="p-3.5">Inspection Type</th>
                      <th className="p-3.5">Sample (AQL)</th>
                      <th className="p-3.5">Defect Count</th>
                      <th className="p-3.5">Result</th>
                      <th className="p-3.5">Date &amp; Auditor</th>
                      <th className="p-3.5">Visibility</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredInspections.map((insp) => (
                      <tr key={insp.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-medium font-bold text-amber-400">{insp.orderNumber}</div>
                          <div className="text-[11px] text-slate-400">{insp.styleNumber}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-medium text-white">{getInspectionTypeLabel(insp.inspectionType)}</div>
                          <div className="text-[11px] text-slate-500 font-medium">Factory: {insp.factoryId}</div>
                        </td>

                        <td className="p-3.5 font-medium">
                          <div className="text-slate-200">
                            <strong>{insp.inspectedQuantity} pcs</strong>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Level {insp.aqlLevel} (Ac: {insp.maxAllowedMajor} Maj / {insp.maxAllowedMinor} Min)
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/60 font-medium text-[10px]" title="Critical">
                              {insp.criticalDefects} Crit
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-medium text-[10px]" title="Major">
                              {insp.majorDefects} Maj
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[10px]" title="Minor">
                              {insp.minorDefects} Min
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">{getResultBadge(insp.result)}</td>

                        <td className="p-3.5">
                          <div className="font-medium text-slate-300">{insp.inspectionDate}</div>
                          <div className="text-[11px] text-slate-500">{insp.inspectorName}</div>
                        </td>

                        <td className="p-3.5">
                          {insp.published ? (
                            <Badge variant="emerald" size="sm" dot>
                              Published to Buyer
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">
                              Internal Draft
                            </Badge>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedInspection(insp)}
                              className="h-7 text-xs gap-1 text-slate-300 hover:text-white"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span>Inspect</span>
                            </Button>

                            {canPublish && !insp.published && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePublish(insp)}
                                className="h-7 text-[11px] text-emerald-400 border-emerald-800/60 hover:bg-emerald-950/40"
                              >
                                Publish
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: LAB TEST REPORTS */}
      {activeTab === 'labReports' && (
        <div className="space-y-4">
          <Card className="overflow-hidden border-slate-800 bg-slate-900/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-medium uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Report ID</th>
                    <th className="p-3.5">Test Category</th>
                    <th className="p-3.5">Accredited Laboratory</th>
                    <th className="p-3.5">Order Reference</th>
                    <th className="p-3.5">Date &amp; Sample</th>
                    <th className="p-3.5">Result</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5 text-right">Publication</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {labReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-medium font-bold text-sky-400">
                        {report.reportNumber}
                      </td>

                      <td className="p-3.5 font-semibold text-white">
                        {report.testCategory}
                      </td>

                      <td className="p-3.5 text-slate-300">
                        {report.labName}
                      </td>

                      <td className="p-3.5 font-medium text-slate-300">
                        {report.orderNumber || report.orderId}
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-slate-300">{report.reportDate}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{report.sampleReference}</div>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-medium font-bold text-[11px] ${
                          report.result === 'PASS'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {report.result}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <Badge variant={report.verificationStatus === 'VERIFIED' ? 'emerald' : 'amber'} size="sm">
                          {report.verificationStatus}
                        </Badge>
                      </td>

                      <td className="p-3.5 text-right">
                        {report.published ? (
                          <Badge variant="emerald" size="sm">
                            Buyer Visible
                          </Badge>
                        ) : canPublish ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!user) return;
                              await publishLabTestReport(report.id, { uid: user.uid, role: user.role });
                              setNotice(`Lab report ${report.reportNumber} published.`);
                              await loadData();
                            }}
                            className="h-7 text-[11px] text-emerald-400 border-emerald-800/60 hover:bg-emerald-950/40"
                          >
                            Publish
                          </Button>
                        ) : (
                          <span className="text-slate-500 font-medium text-[11px]">Draft</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: INTERACTIVE AQL CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-6 bg-slate-900/90 border-slate-800 space-y-4">
            <h3 className="font-serif font-bold text-base text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Inspection Parameters</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Lot Size (Total Order Quantity):</label>
                <input
                  type="number"
                  min="1"
                  value={calcLotSize}
                  onChange={(e) => setCalcLotSize(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Inspection Level:</label>
                <select
                  value={calcLevel}
                  onChange={(e) => setCalcLevel(e.target.value as InspectionLevel)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                >
                  <option value="GI">Level I (Reduced)</option>
                  <option value="GII">Level II (Normal - Industry Standard)</option>
                  <option value="GIII">Level III (Tightened)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Major AQL:</label>
                  <select
                    value={calcMajorAQL}
                    onChange={(e) => setCalcMajorAQL(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                  >
                    <option value="1.0">1.0</option>
                    <option value="1.5">1.5</option>
                    <option value="2.5">2.5 (Apparel Standard)</option>
                    <option value="4.0">4.0</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Minor AQL:</label>
                  <select
                    value={calcMinorAQL}
                    onChange={(e) => setCalcMinorAQL(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                  >
                    <option value="1.5">1.5</option>
                    <option value="2.5">2.5</option>
                    <option value="4.0">4.0 (Apparel Standard)</option>
                    <option value="6.5">6.5</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="text-amber-400 font-medium block font-bold">Simulate Sample Defects Found:</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-rose-400 block font-medium">Critical:</span>
                    <input
                      type="number"
                      min="0"
                      value={calcCriticalDefects}
                      onChange={(e) => setCalcCriticalDefects(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-rose-400 font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 block font-medium">Major:</span>
                    <input
                      type="number"
                      min="0"
                      value={calcMajorDefects}
                      onChange={(e) => setCalcMajorDefects(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-amber-400 font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 block font-medium">Minor:</span>
                    <input
                      type="number"
                      min="0"
                      value={calcMinorDefects}
                      onChange={(e) => setCalcMinorDefects(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-300 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 bg-slate-900/90 border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-medium uppercase text-amber-400 font-bold">ISO 2859-1 Calculation Output</span>
                <h3 className="font-serif font-bold text-lg text-white">Statistical AQL Result</h3>
              </div>
              {interactiveCalcResult && getResultBadge(interactiveCalcResult.result)}
            </div>

            {interactiveCalcResult ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-[10px] font-medium text-slate-400">Code Letter</span>
                    <div className="text-xl font-bold font-medium text-amber-400">{interactiveCalcResult.codeLetter}</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-[10px] font-medium text-slate-400">Sample Size</span>
                    <div className="text-xl font-bold font-medium text-white">{interactiveCalcResult.sampleSize} pcs</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-[10px] font-medium text-slate-400">Major Ac / Re</span>
                    <div className="text-xl font-bold font-medium text-emerald-400">{interactiveCalcResult.maxAllowedMajor} / {interactiveCalcResult.maxAllowedMajor + 1}</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-[10px] font-medium text-slate-400">Minor Ac / Re</span>
                    <div className="text-xl font-bold font-medium text-sky-400">{interactiveCalcResult.maxAllowedMinor} / {interactiveCalcResult.maxAllowedMinor + 1}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-medium text-xs font-bold text-white uppercase">Evaluation Breakdown</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-center justify-between">
                      <span>Critical Defects:</span>
                      <strong className={interactiveCalcResult.actualCritical > 0 ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
                        {interactiveCalcResult.actualCritical} found (Max Allowed: 0)
                      </strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Major Defects (AQL {interactiveCalcResult.majorAQL}):</span>
                      <strong className={interactiveCalcResult.actualMajor > interactiveCalcResult.maxAllowedMajor ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
                        {interactiveCalcResult.actualMajor} found (Max Allowed: {interactiveCalcResult.maxAllowedMajor})
                      </strong>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Minor Defects (AQL {interactiveCalcResult.minorAQL}):</span>
                      <strong className={interactiveCalcResult.actualMinor > interactiveCalcResult.maxAllowedMinor ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
                        {interactiveCalcResult.actualMinor} found (Max Allowed: {interactiveCalcResult.maxAllowedMinor})
                      </strong>
                    </li>
                  </ul>
                </div>

                {interactiveCalcResult.failureReasons.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-1">
                    <div className="flex items-center gap-2 text-rose-400 font-medium text-xs font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Audit Non-Conformance Reasons</span>
                    </div>
                    {interactiveCalcResult.failureReasons.map((reason, idx) => (
                      <p key={idx} className="text-xs text-rose-300/80 pl-6">
                        - {reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Please provide valid numeric parameters.</p>
            )}
          </Card>
        </div>
      )}

      {/* INSPECTION DETAIL DRAWER / MODAL */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs font-bold text-amber-400">
                    {selectedInspection.id}
                  </span>
                  {getResultBadge(selectedInspection.result)}
                  {selectedInspection.published ? (
                    <Badge variant="emerald" size="sm">
                      Published
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Internal Draft
                    </Badge>
                  )}
                </div>
                <h3 className="font-sans font-bold text-xl text-white">
                  {getInspectionTypeLabel(selectedInspection.inspectionType)}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  PO: {selectedInspection.orderNumber} | Style: {selectedInspection.styleNumber} | Factory: {selectedInspection.factoryId}
                </p>
              </div>

              <button
                onClick={() => setSelectedInspection(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AQL Metrics Banner */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-medium">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Sample Inspected</span>
                <div className="text-lg font-bold text-white">{selectedInspection.sampleSize} pcs</div>
                <span className="text-[10px] text-slate-500">Lot: {selectedInspection.orderQuantity.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Major Defects</span>
                <div className={`text-lg font-bold ${selectedInspection.majorDefects > selectedInspection.maxAllowedMajor ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedInspection.majorDefects} / {selectedInspection.maxAllowedMajor}
                </div>
                <span className="text-[10px] text-slate-500">AQL {selectedInspection.aqlMajor}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">Minor Defects</span>
                <div className={`text-lg font-bold ${selectedInspection.minorDefects > selectedInspection.maxAllowedMinor ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedInspection.minorDefects} / {selectedInspection.maxAllowedMinor}
                </div>
                <span className="text-[10px] text-slate-500">AQL {selectedInspection.aqlMinor}</span>
              </div>
            </div>

            {/* Defect Itemized Breakdown */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-white flex items-center justify-between">
                <span>Defect Itemization ({selectedInspection.defects.length})</span>
                <span className="text-xs font-medium text-slate-400">Total: {selectedInspection.totalDefects} units</span>
              </h4>

              {selectedInspection.defects.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/80 text-center text-xs text-slate-500">
                  Zero non-conformances detected in audited sample units.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedInspection.defects.map((d, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium font-bold ${
                            d.severity === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : d.severity === 'MAJOR'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {d.severity} ({d.quantity}x)
                          </span>
                          <span className="text-xs font-semibold text-white">{d.category}</span>
                          {d.location && <span className="text-xs text-slate-400 font-medium">| {d.location}</span>}
                        </div>
                        <p className="text-xs text-slate-300">{d.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Corrective Action Plan (CAP) Section */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <h4 className="font-serif font-bold text-sm text-white">Corrective Action Plan (CAP)</h4>
                </div>

                {!selectedInspection.correctiveAction && canWrite && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCapFormData({
                        issueDescription: selectedInspection.remarks || '',
                        rootCause: '',
                        actionRequired: '',
                        responsibleParty: `Factory Lead (${selectedInspection.factoryId})`,
                        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                      });
                      setIsCapModalOpen(true);
                    }}
                    className="h-7 text-xs text-amber-400 border-amber-400/40"
                  >
                    Initiate CAP
                  </Button>
                )}
              </div>

              {selectedInspection.correctiveAction ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Resolution Status:</span>
                    <Badge variant={selectedInspection.correctiveAction.status === 'verified' ? 'emerald' : 'amber'} size="sm">
                      {selectedInspection.correctiveAction.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Action Required:</span>
                    <p className="text-slate-200 mt-0.5 font-medium">{selectedInspection.correctiveAction.actionRequired}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-medium pt-1">
                    <div>Responsible: <strong className="text-white">{selectedInspection.correctiveAction.responsibleParty}</strong></div>
                    <div>Due Date: <strong className="text-amber-400">{selectedInspection.correctiveAction.dueDate}</strong></div>
                  </div>

                  {canWrite && selectedInspection.correctiveAction.status !== 'verified' && (
                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateCapStatus('completed')}
                        className="h-7 text-xs text-sky-400 border-slate-700"
                      >
                        Mark Completed
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateCapStatus('verified')}
                        className="h-7 text-xs text-emerald-400 border-emerald-800"
                      >
                        Verify &amp; Close CAP
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No active corrective action required for this audit round.</p>
              )}
            </div>

            {/* Internal Confidential Notes */}
            {selectedInspection.internalNotes && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="text-[11px] font-medium uppercase text-amber-400 font-bold">Internal QA Auditor Notes (Staff Only)</div>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedInspection.internalNotes}</p>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {canReinspect && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReinspectModalOpen(true)}
                  className="gap-1.5 text-xs text-amber-400 border-slate-700 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Schedule Re-Inspection</span>
                </Button>
              )}

              <div className="flex items-center gap-2">
                {canPublish && !selectedInspection.published && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePublish(selectedInspection)}
                    className="gap-1.5 text-xs bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish to Buyer</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE INSPECTION MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-3xl bg-slate-900 border-slate-800 p-6 space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Record Quality Inspection</h3>
                <p className="text-xs text-slate-400">Conduct multi-stage audit with real-time ISO 2859-1 AQL evaluation.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateInspection} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Inspection Stage / Type *</label>
                  <select
                    value={formData.inspectionType}
                    onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value as InspectionType })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                  >
                    {INSPECTION_TYPES.map((t) => (
                      <option key={t} value={t}>{getInspectionTypeLabel(t)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Inspection Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.inspectionDate}
                    onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Factory Unit *</label>
                  <input
                    type="text"
                    required
                    value={formData.factoryId}
                    onChange={(e) => setFormData({ ...formData, factoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">PO Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Style Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.styleNumber}
                    onChange={(e) => setFormData({ ...formData, styleNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Buyer Organization *</label>
                  <input
                    type="text"
                    required
                    value={formData.buyerOrganizationId}
                    onChange={(e) => setFormData({ ...formData, buyerOrganizationId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                  />
                </div>
              </div>

              {/* Quantities & AQL Configuration */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Order Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.orderQuantity}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      const standardSampleSize = getSampleSize(qty, formData.aqlLevel);
                      setFormData({ ...formData, orderQuantity: qty, inspectedQuantity: standardSampleSize });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Sample Size (Units)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.inspectedQuantity}
                    onChange={(e) => setFormData({ ...formData, inspectedQuantity: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Major AQL</label>
                  <select
                    value={formData.aqlMajor}
                    onChange={(e) => setFormData({ ...formData, aqlMajor: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium"
                  >
                    <option value="1.0">1.0</option>
                    <option value="1.5">1.5</option>
                    <option value="2.5">2.5 (Standard)</option>
                    <option value="4.0">4.0</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Minor AQL</label>
                  <select
                    value={formData.aqlMinor}
                    onChange={(e) => setFormData({ ...formData, aqlMinor: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium"
                  >
                    <option value="1.5">1.5</option>
                    <option value="2.5">2.5</option>
                    <option value="4.0">4.0 (Standard)</option>
                    <option value="6.5">6.5</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Defect Line Items */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs uppercase text-amber-400 font-bold">Defect Line Items</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddDefectLine}
                    className="h-7 text-xs text-amber-400 border-slate-700 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Defect</span>
                  </Button>
                </div>

                {formDefects.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No defects entered. Audit will evaluate as 0 defects (Pass).</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {formDefects.map((defect, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs items-center">
                        <div className="sm:col-span-3">
                          <select
                            value={defect.category}
                            onChange={(e) => handleDefectChange(idx, 'category', e.target.value as DefectCategory)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-[11px]"
                          >
                            {DEFECT_CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <select
                            value={defect.severity}
                            onChange={(e) => handleDefectChange(idx, 'severity', e.target.value as DefectSeverity)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-[11px]"
                          >
                            {DEFECT_SEVERITIES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={defect.quantity}
                            onChange={(e) => handleDefectChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium text-[11px]"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            placeholder="Description & location..."
                            value={defect.description}
                            onChange={(e) => handleDefectChange(idx, 'description', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-[11px]"
                          />
                        </div>

                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveDefectLine(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Live AQL Evaluation Preview */}
              {liveAQLResult && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="text-xs space-y-0.5">
                    <span className="text-slate-400 font-medium uppercase text-[10px]">Deterministic AQL Calculation:</span>
                    <div className="font-medium text-xs text-white">
                      Code Letter: <strong>{liveAQLResult.codeLetter}</strong> | Total Defects: <strong>{liveAQLResult.totalDefects}</strong> (Ac: {liveAQLResult.maxAllowedMajor} Maj / {liveAQLResult.maxAllowedMinor} Min)
                    </div>
                  </div>
                  {getResultBadge(liveAQLResult.result)}
                </div>
              )}

              {/* Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Public Remarks (Buyer Visible)</label>
                  <textarea
                    rows={2}
                    placeholder="General observations, line tension status..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>

                <div>
                  <label className="text-amber-400 font-medium block mb-1">Internal Notes (Staff Only)</label>
                  <textarea
                    rows={2}
                    placeholder="Confidential factory communications..."
                    value={formData.internalNotes}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-amber-400 focus:ring-0"
                  />
                  <span>Publish report immediately upon saving</span>
                </label>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="text-xs text-slate-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting}
                    className="text-xs bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Inspection Record'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* CREATE LAB TEST REPORT MODAL */}
      {isLabModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-xl bg-slate-900 border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-serif font-bold text-lg text-white">Record Laboratory Test Report</h3>
              <button onClick={() => setIsLabModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLabReport} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Test Category *</label>
                <select
                  value={labFormData.testCategory}
                  onChange={(e) => setLabFormData({ ...labFormData, testCategory: e.target.value as LabTestCategory })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                >
                  {LAB_TEST_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Accredited Laboratory *</label>
                  <input
                    type="text"
                    required
                    value={labFormData.labName}
                    onChange={(e) => setLabFormData({ ...labFormData, labName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Report Date *</label>
                  <input
                    type="date"
                    required
                    value={labFormData.reportDate}
                    onChange={(e) => setLabFormData({ ...labFormData, reportDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Sample Reference / Material Swatch</label>
                <input
                  type="text"
                  value={labFormData.sampleReference}
                  onChange={(e) => setLabFormData({ ...labFormData, sampleReference: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Test Result</label>
                  <select
                    value={labFormData.result}
                    onChange={(e) => setLabFormData({ ...labFormData, result: e.target.value as 'PASS' | 'FAIL' | 'CONDITIONAL' })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                  >
                    <option value="PASS">PASS</option>
                    <option value="CONDITIONAL">CONDITIONAL</option>
                    <option value="FAIL">FAIL</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Verification Status</label>
                  <select
                    value={labFormData.verificationStatus}
                    onChange={(e) => setLabFormData({ ...labFormData, verificationStatus: e.target.value as 'VERIFIED' | 'VERIFICATION_REQUIRED' })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="VERIFICATION_REQUIRED">VERIFICATION_REQUIRED</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={labFormData.published}
                    onChange={(e) => setLabFormData({ ...labFormData, published: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-amber-400"
                  />
                  <span>Publish to Buyer Portal</span>
                </label>

                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="text-xs bg-amber-400 text-slate-950 font-bold">
                  {isSubmitting ? 'Saving...' : 'Register Lab Report'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* CREATE CAP MODAL */}
      {isCapModalOpen && selectedInspection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-slate-900 border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-serif font-bold text-lg text-white">Create Corrective Action Plan (CAP)</h3>
              <button onClick={() => setIsCapModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCap} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Issue Description *</label>
                <textarea
                  required
                  rows={2}
                  value={capFormData.issueDescription}
                  onChange={(e) => setCapFormData({ ...capFormData, issueDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Action Required *</label>
                <textarea
                  required
                  rows={2}
                  value={capFormData.actionRequired}
                  onChange={(e) => setCapFormData({ ...capFormData, actionRequired: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Responsible Party *</label>
                  <input
                    type="text"
                    required
                    value={capFormData.responsibleParty}
                    onChange={(e) => setCapFormData({ ...capFormData, responsibleParty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={capFormData.dueDate}
                    onChange={(e) => setCapFormData({ ...capFormData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsCapModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="bg-amber-400 text-slate-950 font-bold">
                  {isSubmitting ? 'Saving...' : 'Register CAP'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* SCHEDULE RE-INSPECTION MODAL */}
      {isReinspectModalOpen && selectedInspection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-slate-900 border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-serif font-bold text-lg text-white">Schedule Re-Inspection</h3>
              <button onClick={() => setIsReinspectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReinspection} className="space-y-3 text-xs">
              <p className="text-slate-400 leading-relaxed">
                This will create a linked <strong>REINSPECTION</strong> audit round for {selectedInspection.orderNumber} to verify corrective fixes.
              </p>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Reason / Scope *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. 100% sorting completed on washing line. Verifying replacement panels..."
                  value={reinspectReason}
                  onChange={(e) => setReinspectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsReinspectModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="bg-amber-400 text-slate-950 font-bold">
                  {isSubmitting ? 'Scheduling...' : 'Confirm Re-Inspection'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
