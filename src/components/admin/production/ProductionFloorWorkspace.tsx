'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  Layers,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Check,
  X,
  Camera,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Eye,
  Send,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { hasPermission } from '@/lib/auth/permissions';
import {
  ProductionStage,
  ProductionUpdate,
  ProductionPhoto,
  ProductionSummary,
  ProductionUpdateStatus,
} from '@/types/production';
import { Order } from '@/types/order';
import {
  getProductionStages,
  getProductionUpdates,
  getProductionPhotos,
  createProductionUpdate,
  updateProductionUpdate,
  submitProductionUpdate,
  publishProductionUpdate,
  rejectProductionUpdate,
  uploadProductionPhoto,
  deleteProductionPhoto,
  getProductionSummary,
  saveProductionStages,
} from '@/lib/production';
import { calculateAchievementPercentage, calculateVariance } from '@/lib/production/calculations';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface ProductionFloorWorkspaceProps {
  order: Order;
}

export function ProductionFloorWorkspace({ order }: ProductionFloorWorkspaceProps) {
  const { user } = useAuth();
  const canPublish = hasPermission(user?.role, 'orders.write');

  const [summary, setSummary] = useState<ProductionSummary | null>(null);
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [updates, setUpdates] = useState<ProductionUpdate[]>([]);
  const [photos, setPhotos] = useState<ProductionPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isConfigureStagesModalOpen, setIsConfigureStagesModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Notification / Feedback banner
  const [notice, setNotice] = useState<string | null>(null);

  // Daily Log Form State
  const [formData, setFormData] = useState({
    productionStageId: '',
    productionDate: new Date().toISOString().split('T')[0],
    plannedQuantity: 1500,
    actualQuantity: 1500,
    remarks: '',
    issues: '',
    correctiveAction: '',
    status: 'draft' as ProductionUpdateStatus,
    photoUrl: '',
    photoCaption: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Data
  const loadProductionData = async () => {
    setIsLoading(true);
    try {
      const [sumData, stagesData, updatesData, photosData] = await Promise.all([
        getProductionSummary(order.id, order.quantity, order.exFactoryDate),
        getProductionStages(order.id),
        getProductionUpdates(order.id),
        getProductionPhotos(order.id),
      ]);

      setSummary(sumData);
      setStages(stagesData);
      setUpdates(updatesData);
      setPhotos(photosData);

      if (stagesData.length > 0 && !formData.productionStageId) {
        const activeOrFirst = stagesData.find((s) => s.status === 'in_progress') || stagesData[0];
        setFormData((prev) => ({
          ...prev,
          productionStageId: activeOrFirst.id,
        }));
      }
    } catch (err) {
      console.error('Error loading production workspace data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProductionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  // Real-time calculation previews for form
  const liveAchievement = useMemo(() => {
    return calculateAchievementPercentage(formData.actualQuantity, formData.plannedQuantity);
  }, [formData.actualQuantity, formData.plannedQuantity]);

  const liveVariance = useMemo(() => {
    return calculateVariance(formData.actualQuantity, formData.plannedQuantity);
  }, [formData.actualQuantity, formData.plannedQuantity]);

  // Filtered daily updates
  const filteredUpdates = useMemo(() => {
    return updates.filter((u) => {
      if (selectedStageFilter !== 'ALL' && u.productionStageId !== selectedStageFilter && u.stageId !== selectedStageFilter) {
        return false;
      }
      if (selectedStatusFilter !== 'ALL' && u.status !== selectedStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const stageMatch = (u.stageName || '').toLowerCase().includes(q);
        const remarksMatch = (u.remarks || '').toLowerCase().includes(q);
        const issuesMatch = (u.issues || '').toLowerCase().includes(q);
        const dateMatch = (u.productionDate || u.date || '').includes(q);
        if (!stageMatch && !remarksMatch && !issuesMatch && !dateMatch) {
          return false;
        }
      }
      return true;
    });
  }, [updates, selectedStageFilter, selectedStatusFilter, searchQuery]);

  // Prepare chart dataset (Chronological planned vs actual)
  const chartData = useMemo(() => {
    const sorted = [...updates]
      .filter((u) => u.status !== 'rejected')
      .sort((a, b) => new Date(a.productionDate || a.date || 0).getTime() - new Date(b.productionDate || b.date || 0).getTime());

    return sorted.map((u) => ({
      date: u.productionDate || u.date,
      stage: u.stageName,
      planned: u.plannedQuantity,
      actual: u.actualQuantity,
      cumulative: u.cumulativeQuantity,
    }));
  }, [updates]);

  // Action Handlers
  const handleSaveLog = async (targetStatus: ProductionUpdateStatus) => {
    if (!user) return;
    setFormErrors({});

    const selectedStage = stages.find((s) => s.id === formData.productionStageId);
    if (!selectedStage) {
      setFormErrors({ stage: 'Please select a valid production stage' });
      return;
    }

    if (formData.plannedQuantity < 0 || formData.actualQuantity < 0) {
      setFormErrors({ quantities: 'Quantities cannot be negative numbers' });
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createProductionUpdate(
        {
          orderId: order.id,
          buyerOrganizationId: order.buyerOrganizationId,
          productionStageId: selectedStage.id,
          stageKey: selectedStage.stageKey,
          stageName: selectedStage.stageName,
          productionDate: formData.productionDate,
          plannedQuantity: Number(formData.plannedQuantity),
          actualQuantity: Number(formData.actualQuantity),
          remarks: formData.remarks.trim(),
          issues: formData.issues.trim(),
          correctiveAction: formData.correctiveAction.trim(),
          status: targetStatus,
        },
        { uid: user.uid, role: user.role }
      );

      // Upload photo if provided
      if (formData.photoUrl.trim()) {
        await uploadProductionPhoto(
          order.id,
          created.id,
          {
            url: formData.photoUrl.trim(),
            caption: formData.photoCaption.trim() || `Inspection photo for ${selectedStage.stageName}`,
          },
          { uid: user.uid, role: user.role }
        );
      }

      setNotice(`Production record successfully saved as ${targetStatus.toUpperCase()}.`);
      setTimeout(() => setNotice(null), 4000);
      setIsLogModalOpen(false);
      setFormData({
        productionStageId: stages[0]?.id || '',
        productionDate: new Date().toISOString().split('T')[0],
        plannedQuantity: 1500,
        actualQuantity: 1500,
        remarks: '',
        issues: '',
        correctiveAction: '',
        status: 'draft',
        photoUrl: '',
        photoCaption: '',
      });

      await loadProductionData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFormErrors({ general: error.message || 'Failed to record production log' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusTransition = async (updateId: string, action: 'submit' | 'publish' | 'reject') => {
    if (!user) return;
    try {
      if (action === 'submit') {
        await submitProductionUpdate(updateId, { uid: user.uid, role: user.role });
        setNotice('Production update submitted for merchandiser review.');
      } else if (action === 'publish') {
        await publishProductionUpdate(updateId, { uid: user.uid, role: user.role });
        setNotice('Production update published live to Buyer Portal.');
      } else if (action === 'reject') {
        if (!rejectReason.trim()) return;
        await rejectProductionUpdate(updateId, rejectReason.trim(), { uid: user.uid, role: user.role });
        setNotice('Production update rejected with feedback.');
        setRejectingId(null);
        setRejectReason('');
      }
      setTimeout(() => setNotice(null), 4000);
      await loadProductionData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setNotice(error.message || 'Error updating status');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!user) return;
    try {
      await deleteProductionPhoto(photoId, { uid: user.uid, role: user.role });
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setNotice('Production photo removed.');
      setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      console.error('Error deleting photo:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notice Banner */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-amber-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Production Overview KPIs */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[11px] font-medium uppercase text-slate-400 font-semibold block">
              Order Volume
            </span>
            <div className="text-xl font-bold text-white font-medium">
              {summary.orderQuantity.toLocaleString()} <span className="text-xs text-slate-500">pcs</span>
            </div>
            <span className="text-[10px] text-slate-400">Total Purchase Order Target</span>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[11px] font-medium uppercase text-slate-400 font-semibold block">
              Cumulative Output
            </span>
            <div className="text-xl font-bold text-emerald-400 font-medium">
              {summary.completedQuantity.toLocaleString()} <span className="text-xs text-slate-500">pcs</span>
            </div>
            <span className="text-[10px] text-slate-400">Current Output Stage</span>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[11px] font-medium uppercase text-slate-400 font-semibold block">
              Remaining Balance
            </span>
            <div className="text-xl font-bold text-amber-400 font-medium">
              {summary.remainingQuantity.toLocaleString()} <span className="text-xs text-slate-500">pcs</span>
            </div>
            <span className="text-[10px] text-slate-400">Balance to complete</span>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[11px] font-medium uppercase text-slate-400 font-semibold block">
              Completion Progress
            </span>
            <div className="text-xl font-bold text-white font-medium flex items-center gap-1.5">
              <span>{summary.completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${summary.completionPercentage}%` }}
              />
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1 col-span-2 lg:col-span-1">
            <span className="text-[11px] font-medium uppercase text-slate-400 font-semibold block">
              Line Operational Health
            </span>
            <div className="pt-1">
              <Badge
                variant={
                  summary.status === 'On Track' || summary.status === 'Completed'
                    ? 'emerald'
                    : summary.status === 'At Risk'
                    ? 'amber'
                    : 'rose'
                }
                size="md"
              >
                {summary.status}
              </Badge>
            </div>
            <span className="text-[10px] text-slate-400 block pt-0.5">
              Active: {summary.currentStageName}
            </span>
          </Card>
        </div>
      )}

      {/* Production Pipeline Stepper */}
      <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-medium uppercase text-amber-400 font-bold">
              Sequential Workflow
            </span>
            <h3 className="font-serif font-bold text-lg text-white">
              Configured Production Stages
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfigureStagesModalOpen(true)}
              className="text-xs text-slate-300 border-slate-700"
            >
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              <span>Configure Pipeline</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsLogModalOpen(true)}
              className="text-xs font-semibold gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Daily Output</span>
            </Button>
          </div>
        </div>

        {/* Responsive Horizontal Stepper Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-2">
          {summary?.stages.map((stage) => {
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress';
            const isDelayed = stage.status === 'delayed';

            return (
              <div
                key={stage.stageId}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : isInProgress
                    ? 'bg-amber-950/20 border-amber-400/40 text-amber-300 shadow-sm'
                    : isDelayed
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-slate-800/60">
                  <span className="text-[10px] font-medium font-bold uppercase text-slate-400">
                    Step {stage.sequence}
                  </span>
                  <Badge
                    variant={isCompleted ? 'emerald' : isInProgress ? 'amber' : isDelayed ? 'rose' : 'slate'}
                    size="sm"
                  >
                    {isCompleted ? 'Done' : isInProgress ? 'In Assembly' : isDelayed ? 'Delayed' : 'Pending'}
                  </Badge>
                </div>

                <h4 className="font-semibold text-xs text-white pt-2 truncate" title={stage.stageName}>
                  {stage.stageName}
                </h4>

                <div className="pt-2 space-y-1 text-[11px] font-medium">
                  <div className="flex justify-between text-slate-400">
                    <span>Cumulative:</span>
                    <span className="text-white font-bold">{stage.cumulativeQuantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Achievement:</span>
                    <span className="text-amber-400 font-bold">{stage.achievementPercent}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Variance:</span>
                    <span
                      className={
                        stage.variance >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'
                      }
                    >
                      {stage.variance >= 0 ? `+${stage.variance}` : stage.variance}
                    </span>
                  </div>
                </div>

                {stage.lastUpdateDate && (
                  <div className="mt-2 pt-1.5 border-t border-slate-800/60 text-[10px] font-medium text-slate-500 truncate">
                    Updated: {stage.lastUpdateDate}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Production Output Trend Chart */}
      {chartData.length > 0 && (
        <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-xs font-medium uppercase text-amber-400 font-bold">
                Output Analytics
              </span>
              <h3 className="font-serif font-bold text-lg text-white">
                Daily Output vs Planned Volume
              </h3>
            </div>
            <span className="text-xs font-medium text-slate-400">Units (Pcs)</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="planned" name="Planned Output" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual Produced" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Daily Production Logs Table */}
      <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-medium uppercase text-amber-400 font-bold">
              Factory Reporting Stream
            </span>
            <h3 className="font-serif font-bold text-lg text-white">
              Daily Production Logs &amp; Variance
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-400">{filteredUpdates.length} Records</span>
        </div>

        {/* Search & Filtering Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search remarks, issues, or stage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <select
              value={selectedStageFilter}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Production Stages</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.stageName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Publication States</option>
              <option value="published">Published to Buyer</option>
              <option value="submitted">Submitted (Under Review)</option>
              <option value="draft">Internal Draft</option>
              <option value="rejected">Rejected / Revision Needed</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {filteredUpdates.length === 0 ? (
          <EmptyState
            title="No production records match criteria"
            description="Adjust your search query or filters, or record a new daily output report for this order."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px] uppercase">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3 text-right">Planned</th>
                  <th className="py-3 px-3 text-right">Actual</th>
                  <th className="py-3 px-3 text-right">Variance</th>
                  <th className="py-3 px-3 text-right">Achievement</th>
                  <th className="py-3 px-3 text-right">Cumulative</th>
                  <th className="py-3 px-3">Publication State</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredUpdates.map((log) => {
                  const variance = log.actualQuantity - log.plannedQuantity;
                  const isDraft = log.status === 'draft';
                  const isSubmitted = log.status === 'submitted';
                  const isPublished = log.status === 'published';
                  const isRejected = log.status === 'rejected';

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-white font-semibold whitespace-nowrap">
                        {log.productionDate || log.date}
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-200">{log.stageName}</td>
                      <td className="py-3 px-3 text-right text-slate-400">
                        {log.plannedQuantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-white font-bold">
                        {log.actualQuantity.toLocaleString()}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold ${
                          variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {variance >= 0 ? `+${variance}` : variance}
                      </td>
                      <td className="py-3 px-3 text-right text-amber-400 font-bold">
                        {log.achievementPercent}%
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        {log.cumulativeQuantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <Badge
                          variant={
                            isPublished
                              ? 'emerald'
                              : isSubmitted
                              ? 'amber'
                              : isRejected
                              ? 'rose'
                              : 'slate'
                          }
                          size="sm"
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right font-sans whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDraft && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusTransition(log.id, 'submit')}
                              className="text-[11px] px-2 py-0.5 border-slate-700 text-amber-300 hover:bg-slate-800"
                            >
                              Submit
                            </Button>
                          )}

                          {isSubmitted && canPublish && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleStatusTransition(log.id, 'publish')}
                                className="text-[11px] px-2 py-0.5"
                              >
                                Publish
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRejectingId(log.id)}
                                className="text-[11px] px-2 py-0.5 text-rose-400 hover:bg-rose-950/40"
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {isPublished && (
                            <span className="text-[10px] text-emerald-400 font-medium">Live on Portal</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Production Photo Gallery */}
      <Card className="p-6 bg-slate-900/80 border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-medium uppercase text-amber-400 font-bold">
              Visual Documentation
            </span>
            <h3 className="font-serif font-bold text-lg text-white">
              Inspection &amp; Factory Floor Photos
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPhotoModalOpen(true)}
            className="text-xs text-slate-300 border-slate-700 gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </Button>
        </div>

        {photos.length === 0 ? (
          <EmptyState
            title="No production photos attached yet"
            description="Upload inspection photos, seam checks, and needle detection photos to provide visual proof of garment production."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={photo.url || photo.storagePath}
                    alt={photo.caption || 'Production photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2.5 space-y-1 text-xs">
                  <p className="text-slate-300 line-clamp-2">{photo.caption || 'Factory floor inspection'}</p>
                  <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 pt-1">
                    <span>{photo.createdAt?.split('T')[0]}</span>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="text-rose-400 hover:text-rose-300"
                      title="Delete Photo"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Record Daily Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="max-w-xl w-full p-6 bg-slate-900 border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-medium uppercase text-amber-400 font-bold">
                  Daily Telemetry Entry
                </span>
                <h3 className="font-serif font-bold text-lg text-white">
                  Record Floor Output for PO {order.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.general && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formErrors.general}
              </div>
            )}

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Production Stage <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.productionStageId}
                    onChange={(e) => setFormData({ ...formData, productionStageId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.stageName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Production Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.productionDate}
                    onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Planned Target Qty (pcs) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.plannedQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, plannedQuantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Actual Produced Qty (pcs) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.actualQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, actualQuantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>
              </div>

              {/* Real-time Math Preview */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <span className="text-slate-500 block text-[10px]">Calculated Achievement</span>
                  <span className="text-amber-400 font-bold text-sm">{liveAchievement}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Daily Variance</span>
                  <span
                    className={`font-bold text-sm ${
                      liveVariance.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {liveVariance.variance >= 0
                      ? `+${liveVariance.variance} pcs (${liveVariance.statusText})`
                      : `${liveVariance.variance} pcs (${liveVariance.statusText})`}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Floor Operational Remarks (Buyer-visible when published)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Line 3 operated at target efficiency. All seams verified."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Internal Issues / Stoppages (Internal Staff only)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 30-min power glitch on feeder station #2."
                  value={formData.issues}
                  onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Attach Inspection Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLogModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleSaveLog('draft')}
                  className="text-slate-300 border-slate-700"
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleSaveLog('submitted')}
                >
                  Submit for Review
                </Button>
                {canPublish && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => handleSaveLog('published')}
                  >
                    Publish to Portal
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Rejection Feedback Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 bg-slate-900 border-slate-800 space-y-4">
            <h3 className="font-serif font-bold text-base text-white">Reject Production Submission</h3>
            <p className="text-xs text-slate-400">
              Provide feedback or instructions on why this daily production record cannot be published.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Quantity discrepancy on Line 5. Recount cutting bundles."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRejectingId(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!rejectReason.trim()}
                onClick={() => handleStatusTransition(rejectingId, 'reject')}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Rejection
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Upload Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 bg-slate-900 border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-serif font-bold text-base text-white">Attach Inspection Photo</h3>
              <button onClick={() => setIsPhotoModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Photo URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Caption / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Seam tension check on garment assembly"
                  value={formData.photoCaption}
                  onChange={(e) => setFormData({ ...formData, photoCaption: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsPhotoModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!formData.photoUrl.trim() || !user}
                onClick={async () => {
                  if (!user) return;
                  await uploadProductionPhoto(
                    order.id,
                    updates[0]?.id || 'direct',
                    {
                      url: formData.photoUrl.trim(),
                      caption: formData.photoCaption.trim() || 'Floor inspection photo',
                    },
                    { uid: user.uid, role: user.role }
                  );
                  setIsPhotoModalOpen(false);
                  setNotice('Photo attached to order stream.');
                  await loadProductionData();
                }}
              >
                Save Photo
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Configure Pipeline Modal */}
      {isConfigureStagesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="max-w-xl w-full p-6 bg-slate-900 border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-serif font-bold text-base text-white">Configure Production Pipeline</h3>
                <p className="text-xs text-slate-400">Enable, disable, or adjust target volumes for this order.</p>
              </div>
              <button onClick={() => setIsConfigureStagesModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {stages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs font-medium"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">#{stage.sequence}</span>
                    <span className="font-sans text-white font-semibold">{stage.stageName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={stage.plannedQuantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setStages((prev) =>
                          prev.map((s) => (s.id === stage.id ? { ...s, plannedQuantity: val } : s))
                        );
                      }}
                      className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-white"
                    />
                    <span className="text-slate-500">pcs</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStages((prev) =>
                          prev.map((s) => (s.id === stage.id ? { ...s, enabled: !s.enabled } : s))
                        );
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-sans ${
                        stage.enabled
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {stage.enabled ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setIsConfigureStagesModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  if (!user) return;
                  await saveProductionStages(order.id, stages, { uid: user.uid, role: user.role });
                  setIsConfigureStagesModalOpen(false);
                  setNotice('Production pipeline updated.');
                  await loadProductionData();
                }}
              >
                Save Configuration
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
