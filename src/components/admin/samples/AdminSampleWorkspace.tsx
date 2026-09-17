'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Send,
  RotateCcw,
  X,
  Search,
  Truck,
  Paperclip,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { hasPermission } from '@/lib/auth/permissions';
import {
  Sample,
  SampleType,
  SampleStatus,
} from '@/types/sample';
import { Order } from '@/types/order';
import {
  getSamplesByOrder,
  createSample,
  submitSampleForBuyerReview,
  createSampleRevision,
  addSampleComment,
  uploadSampleAttachment,
  deleteSampleAttachment,
} from '@/lib/samples';
import { SAMPLE_TYPES } from '@/lib/validation/sample.schema';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface AdminSampleWorkspaceProps {
  order: Order;
}

export function AdminSampleWorkspace({ order }: AdminSampleWorkspaceProps) {
  const { user } = useAuth();
  const canManageSamples = hasPermission(user?.role, 'samples.write');

  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submittingSample, setSubmittingSample] = useState<Sample | null>(null);
  const [revisingSample, setRevisingSample] = useState<Sample | null>(null);
  const [activeSampleDetail, setActiveSampleDetail] = useState<Sample | null>(null);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    sampleType: 'Fit Sample' as SampleType,
    targetDate: '',
    courierName: 'DHL Express',
    trackingNumber: '',
    internalRemarks: '',
    buyerRemarks: '',
    status: 'in_development' as SampleStatus,
  });

  const [submitCourierData, setSubmitCourierData] = useState({
    courierName: 'DHL Express',
    trackingNumber: '',
  });

  const [revisionData, setRevisionData] = useState({
    revisionNotes: '',
    targetDate: '',
  });

  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentInternalOnly, setNewCommentInternalOnly] = useState(false);

  const [attachmentFormData, setAttachmentFormData] = useState({
    fileName: '',
    fileSize: '2.5 MB',
    fileType: 'image/jpeg',
    url: '',
    caption: '',
    visibility: 'buyer' as 'buyer' | 'internal',
  });

  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

  // Load samples
  const loadSamples = async () => {
    setIsLoading(true);
    try {
      const data = await getSamplesByOrder(order.id);
      setSamples(data);
      if (activeSampleDetail) {
        const refreshed = data.find((s) => s.id === activeSampleDetail.id);
        if (refreshed) setActiveSampleDetail(refreshed);
      }
    } catch (err) {
      console.error('Error loading samples:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSamples();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  // Filtered samples
  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      if (selectedStatusFilter !== 'ALL' && s.status !== selectedStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const typeMatch = s.sampleType.toLowerCase().includes(q);
        const buyerRemarksMatch = (s.buyerRemarks || '').toLowerCase().includes(q);
        const internalRemarksMatch = (s.internalRemarks || '').toLowerCase().includes(q);
        const trackingMatch = (s.trackingNumber || '').toLowerCase().includes(q);
        if (!typeMatch && !buyerRemarksMatch && !internalRemarksMatch && !trackingMatch) {
          return false;
        }
      }
      return true;
    });
  }, [samples, selectedStatusFilter, searchQuery]);

  // Handlers
  const handleCreateSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);
    setIsActionSubmitting(true);

    try {
      await createSample(
        {
          orderId: order.id,
          buyerOrganizationId: order.buyerOrganizationId,
          sampleType: createFormData.sampleType,
          targetDate: createFormData.targetDate || undefined,
          courierName: createFormData.courierName.trim(),
          trackingNumber: createFormData.trackingNumber.trim(),
          internalRemarks: createFormData.internalRemarks.trim(),
          buyerRemarks: createFormData.buyerRemarks.trim(),
          status: createFormData.status,
        },
        { uid: user.uid, role: user.role }
      );

      setIsCreateModalOpen(false);
      setNotice(`Sample request created for ${createFormData.sampleType}.`);
      setTimeout(() => setNotice(null), 4000);
      setCreateFormData({
        sampleType: 'Fit Sample',
        targetDate: '',
        courierName: 'DHL Express',
        trackingNumber: '',
        internalRemarks: '',
        buyerRemarks: '',
        status: 'in_development',
      });
      await loadSamples();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFormError(error.message || 'Failed to create sample');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleSubmitForReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingSample || !user) return;
    setIsActionSubmitting(true);

    try {
      await submitSampleForBuyerReview(
        submittingSample.id,
        {
          courierName: submitCourierData.courierName.trim(),
          trackingNumber: submitCourierData.trackingNumber.trim(),
        },
        { uid: user.uid, role: user.role }
      );

      setNotice(`${submittingSample.sampleType} (v${submittingSample.revisionNumber}) submitted for Buyer Review.`);
      setTimeout(() => setNotice(null), 4000);
      setSubmittingSample(null);
      await loadSamples();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setNotice(error.message || 'Error submitting sample');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleCreateRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisingSample || !user) return;
    if (!revisionData.revisionNotes.trim()) {
      setFormError('Please enter revision round notes.');
      return;
    }
    setIsActionSubmitting(true);

    try {
      const nextRev = await createSampleRevision(
        {
          sampleId: revisingSample.id,
          revisionNotes: revisionData.revisionNotes.trim(),
          targetDate: revisionData.targetDate || undefined,
        },
        { uid: user.uid, role: user.role }
      );

      setNotice(`Revision round v${nextRev.revisionNumber} initiated for ${revisingSample.sampleType}.`);
      setTimeout(() => setNotice(null), 4000);
      setRevisingSample(null);
      setRevisionData({ revisionNotes: '', targetDate: '' });
      await loadSamples();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFormError(error.message || 'Error creating revision');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSampleDetail || !user || !newCommentText.trim()) return;

    try {
      await addSampleComment(
        activeSampleDetail.id,
        newCommentText.trim(),
        newCommentInternalOnly,
        { uid: user.uid, role: user.role, displayName: user.displayName }
      );

      setNewCommentText('');
      await loadSamples();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSampleDetail || !user || !attachmentFormData.fileName.trim()) return;

    try {
      await uploadSampleAttachment(
        activeSampleDetail.id,
        {
          sampleId: activeSampleDetail.id,
          fileName: attachmentFormData.fileName.trim(),
          fileSize: attachmentFormData.fileSize,
          fileType: attachmentFormData.fileType,
          url: attachmentFormData.url.trim() || undefined,
          caption: attachmentFormData.caption.trim(),
          visibility: attachmentFormData.visibility,
        },
        { uid: user.uid, role: user.role }
      );

      setAttachmentFormData({
        fileName: '',
        fileSize: '2.5 MB',
        fileType: 'image/jpeg',
        url: '',
        caption: '',
        visibility: 'buyer',
      });
      setNotice('Attachment uploaded to sample revision.');
      setTimeout(() => setNotice(null), 4000);
      await loadSamples();
    } catch (err) {
      console.error('Error uploading attachment:', err);
    }
  };

  const handleDeleteAttachment = async (sampleId: string, attachmentId: string) => {
    if (!user) return;
    try {
      await deleteSampleAttachment(sampleId, attachmentId, { uid: user.uid, role: user.role });
      await loadSamples();
    } catch (err) {
      console.error('Error deleting attachment:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-56 w-full" />
          ))}
        </div>
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

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-medium uppercase text-amber-400 font-bold">
            Sampling &amp; Prototyping
          </span>
          <h2 className="text-xl font-serif font-bold text-white">
            Sample Development Pipeline
          </h2>
        </div>

        {canManageSamples && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5 text-xs font-semibold self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Sample Request</span>
          </Button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search sample type, courier tracking #, or remarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
          >
            <option value="ALL">All Sample States</option>
            <option value="submitted">Submitted (Under Buyer Review)</option>
            <option value="approved">Approved by Buyer</option>
            <option value="changes_requested">Changes Requested</option>
            <option value="in_development">In Development (Factory)</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Internal Draft</option>
          </select>
        </div>
      </div>

      {/* Sample Cards Grid */}
      {filteredSamples.length === 0 ? (
        <EmptyState
          title="No sample records found"
          description="Create a Proto, Fit, or PP sample request to initiate physical garment development and track buyer approvals."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSamples.map((sample) => {
            const isApproved = sample.status === 'approved';
            const isSubmitted = sample.status === 'submitted';
            const isChangesRequested = sample.status === 'changes_requested';
            const isRejected = sample.status === 'rejected';
            const isInDev = sample.status === 'in_development';

            return (
              <Card
                key={sample.id}
                className={`p-5 bg-slate-900/90 border-slate-800 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between ${
                  isApproved
                    ? 'border-emerald-500/30'
                    : isChangesRequested
                    ? 'border-amber-500/40'
                    : isRejected
                    ? 'border-rose-500/30'
                    : ''
                }`}
              >
                <div className="space-y-3">
                  {/* Card Top: Type, Version & Status */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-medium text-amber-400 uppercase font-bold tracking-wider">
                        Revision v{sample.revisionNumber}
                      </span>
                      <h3 className="font-serif font-bold text-base text-white">
                        {sample.sampleType}
                      </h3>
                    </div>
                    <Badge
                      variant={
                        isApproved
                          ? 'emerald'
                          : isSubmitted
                          ? 'blue'
                          : isChangesRequested
                          ? 'amber'
                          : isRejected
                          ? 'rose'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {sample.status === 'changes_requested'
                        ? 'Changes Req.'
                        : sample.status === 'in_development'
                        ? 'In Factory Dev'
                        : sample.status}
                    </Badge>
                  </div>

                  {/* Dates & Logistics */}
                  <div className="space-y-1.5 text-xs font-medium text-slate-400">
                    {sample.targetDate && (
                      <div className="flex justify-between">
                        <span>Target Date:</span>
                        <span className="text-white">{sample.targetDate}</span>
                      </div>
                    )}
                    {sample.submittedAt && (
                      <div className="flex justify-between">
                        <span>Submitted:</span>
                        <span className="text-white">{sample.submittedAt.split('T')[0]}</span>
                      </div>
                    )}
                    {sample.trackingNumber && (
                      <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                        <span className="flex items-center gap-1 text-[11px] text-amber-400">
                          <Truck className="w-3.5 h-3.5" />
                          <span>{sample.courierName || 'Courier'}:</span>
                        </span>
                        <span className="text-white font-bold text-[11px] truncate max-w-[140px]">
                          {sample.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Remarks & Buyer Feedback */}
                  {sample.buyerRemarks && (
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                      <span className="text-[10px] font-medium uppercase text-slate-500 font-bold block">
                        Buyer-Facing Spec:
                      </span>
                      <p className="line-clamp-2 mt-0.5">{sample.buyerRemarks}</p>
                    </div>
                  )}

                  {sample.internalRemarks && (
                    <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200">
                      <span className="text-[10px] font-medium uppercase text-amber-400 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Internal Note:</span>
                      </span>
                      <p className="line-clamp-2 mt-0.5">{sample.internalRemarks}</p>
                    </div>
                  )}

                  {sample.buyerFeedback && (
                    <div
                      className={`p-2.5 rounded-lg text-xs border ${
                        isApproved
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                          : isChangesRequested
                          ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                          : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                      }`}
                    >
                      <span className="text-[10px] font-medium uppercase font-bold block">
                        Buyer Decision Feedback:
                      </span>
                      <p className="line-clamp-2 mt-0.5">&quot;{sample.buyerFeedback}&quot;</p>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Actions */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveSampleDetail(sample)}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <span>Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {(sample.attachments?.length || 0) > 0 && (
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        <span>{sample.attachments?.length}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canManageSamples && (isInDev || sample.status === 'draft') && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSubmittingSample(sample);
                          setSubmitCourierData({
                            courierName: sample.courierName || 'DHL Express',
                            trackingNumber: sample.trackingNumber || '',
                          });
                        }}
                        className="text-[11px] px-2.5 py-1 gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Submit to Buyer</span>
                      </Button>
                    )}

                    {canManageSamples && (isChangesRequested || isRejected) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRevisingSample(sample);
                          setRevisionData({
                            revisionNotes: '',
                            targetDate: sample.targetDate || '',
                          });
                        }}
                        className="text-[11px] px-2.5 py-1 border-amber-400/40 text-amber-300 hover:bg-amber-400/10 gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Start v{sample.revisionNumber + 1}</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Sample Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="max-w-lg w-full p-6 bg-slate-900 border-slate-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-medium uppercase text-amber-400 font-bold">
                  New Garment Prototyping
                </span>
                <h3 className="font-serif font-bold text-lg text-white">Create Sample Request</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSample} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Sample Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={createFormData.sampleType}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, sampleType: e.target.value as SampleType })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  >
                    {SAMPLE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Target Delivery Date</label>
                  <input
                    type="date"
                    value={createFormData.targetDate}
                    onChange={(e) => setCreateFormData({ ...createFormData, targetDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Courier / Carrier</label>
                  <input
                    type="text"
                    placeholder="e.g. DHL Express, FedEx"
                    value={createFormData.courierName}
                    onChange={(e) => setCreateFormData({ ...createFormData, courierName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Airway Bill / Tracking #</label>
                  <input
                    type="text"
                    placeholder="e.g. DHL-9981-2244"
                    value={createFormData.trackingNumber}
                    onChange={(e) =>
                      setCreateFormData({ ...createFormData, trackingNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Buyer-Facing Description &amp; Technical Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 1st Fit sample in base size M. Fabric composition 100% Cotton Single Jersey 180 GSM."
                  value={createFormData.buyerRemarks}
                  onChange={(e) => setCreateFormData({ ...createFormData, buyerRemarks: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Internal Factory / Merchandiser Notes (Confidential)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Needle pitch adjusted for silicone wash trial."
                  value={createFormData.internalRemarks}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, internalRemarks: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isActionSubmitting}>
                  Save Sample Request
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Submit for Review Modal */}
      {submittingSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 bg-slate-900 border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-serif font-bold text-base text-white">
                Submit {submittingSample.sampleType} (v{submittingSample.revisionNumber})
              </h3>
              <button onClick={() => setSubmittingSample(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Provide physical dispatch tracking information so the buyer can track garment shipment for fitting.
            </p>

            <form onSubmit={handleSubmitForReview} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Courier Provider</label>
                <input
                  type="text"
                  value={submitCourierData.courierName}
                  onChange={(e) =>
                    setSubmitCourierData({ ...submitCourierData, courierName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Airway Bill / Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. DHL-8890-4122-BD"
                  value={submitCourierData.trackingNumber}
                  onChange={(e) =>
                    setSubmitCourierData({ ...submitCourierData, trackingNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setSubmittingSample(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isActionSubmitting}>
                  Submit to Buyer Portal
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Create Revision Modal */}
      {revisingSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 bg-slate-900 border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-xs font-medium uppercase text-amber-400 font-bold">
                  Start Next Round
                </span>
                <h3 className="font-serif font-bold text-base text-white">
                  Initiate Revision v{revisingSample.revisionNumber + 1} for {revisingSample.sampleType}
                </h3>
              </div>
              <button onClick={() => setRevisingSample(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateRevision} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Revision Notes &amp; Action Plan <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Adjusting chest width by +1.5cm and changing collar rib tension as requested by buyer."
                  value={revisionData.revisionNotes}
                  onChange={(e) => setRevisionData({ ...revisionData, revisionNotes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Target Completion Date</label>
                <input
                  type="date"
                  value={revisionData.targetDate}
                  onChange={(e) => setRevisionData({ ...revisionData, targetDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setRevisingSample(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isActionSubmitting}>
                  Initiate v{revisingSample.revisionNumber + 1}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Comprehensive Sample Detail Drawer / Modal */}
      {activeSampleDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 bg-slate-900 border-slate-800 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase text-amber-400 font-bold">
                    Revision v{activeSampleDetail.revisionNumber}
                  </span>
                  <Badge
                    variant={
                      activeSampleDetail.status === 'approved'
                        ? 'emerald'
                        : activeSampleDetail.status === 'submitted'
                        ? 'blue'
                        : activeSampleDetail.status === 'changes_requested'
                        ? 'amber'
                        : activeSampleDetail.status === 'rejected'
                        ? 'rose'
                        : 'slate'
                    }
                    size="sm"
                  >
                    {activeSampleDetail.status}
                  </Badge>
                </div>
                <h3 className="font-serif font-bold text-xl text-white">
                  {activeSampleDetail.sampleType} Workspace
                </h3>
              </div>
              <button
                onClick={() => setActiveSampleDetail(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Revision Timeline & History */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium uppercase text-slate-400 font-bold">
                Revision Decision History
              </h4>
              <div className="space-y-2">
                {(activeSampleDetail.history || []).map((hist, idx) => (
                  <div
                    key={hist.id || idx}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1 font-medium"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold">Revision #{hist.revisionNumber}</span>
                      <span className="text-slate-500 text-[10px]">
                        {hist.decidedAt ? hist.decidedAt.split('T')[0] : hist.submittedAt ? hist.submittedAt.split('T')[0] : hist.createdAt.split('T')[0]}
                      </span>
                    </div>
                    <div className="text-slate-300 font-sans">
                      {hist.decision ? (
                        <span>
                          Decision: <strong className="uppercase text-white">{hist.decision.replace('_', ' ')}</strong>
                        </span>
                      ) : (
                        <span>Status: {hist.status}</span>
                      )}
                    </div>
                    {hist.feedback && (
                      <p className="text-slate-400 font-sans italic bg-slate-900/60 p-2 rounded mt-1">
                        &quot;{hist.feedback}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-medium uppercase text-slate-400 font-bold">
                Photos &amp; Tech Spec Attachments
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(activeSampleDetail.attachments || []).map((att) => (
                  <div
                    key={att.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] font-medium">
                      <Badge
                        variant={att.visibility === 'buyer' ? 'emerald' : 'amber'}
                        size="sm"
                      >
                        {att.visibility === 'buyer' ? 'Buyer Visible' : 'Internal'}
                      </Badge>
                      <button
                        onClick={() => handleDeleteAttachment(activeSampleDetail.id, att.id)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="font-semibold text-white truncate">{att.fileName}</div>
                    {att.url && (
                      <img
                        src={att.url}
                        alt={att.caption || 'Sample visual'}
                        className="w-full h-24 object-cover rounded"
                      />
                    )}
                    {att.caption && <p className="text-slate-400 text-[11px] truncate">{att.caption}</p>}
                  </div>
                ))}
              </div>

              {/* Upload Attachment Form */}
              <form onSubmit={handleAddAttachment} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-medium font-bold text-slate-300 block">Add Attachment / Image</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <input
                    type="text"
                    placeholder="File Name (e.g. Fit_Front.jpg)"
                    value={attachmentFormData.fileName}
                    onChange={(e) =>
                      setAttachmentFormData({ ...attachmentFormData, fileName: e.target.value })
                    }
                    className="px-3 py-1.5 bg-slate-900 rounded border border-slate-700 text-white"
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={attachmentFormData.url}
                    onChange={(e) =>
                      setAttachmentFormData({ ...attachmentFormData, url: e.target.value })
                    }
                    className="px-3 py-1.5 bg-slate-900 rounded border border-slate-700 text-white"
                  />
                  <select
                    value={attachmentFormData.visibility}
                    onChange={(e) =>
                      setAttachmentFormData({
                        ...attachmentFormData,
                        visibility: e.target.value as 'buyer' | 'internal',
                      })
                    }
                    className="px-3 py-1.5 bg-slate-900 rounded border border-slate-700 text-white font-medium text-xs"
                  >
                    <option value="buyer">Buyer Visible</option>
                    <option value="internal">Internal Only</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="outline" size="sm" className="text-xs">
                    Attach to Sample
                  </Button>
                </div>
              </form>
            </div>

            {/* Comments Thread */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-medium uppercase text-slate-400 font-bold">
                Discussion &amp; Operational Messages
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(activeSampleDetail.comments || []).map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-3 rounded-lg text-xs space-y-1 ${
                      comm.isInternalOnly
                        ? 'bg-amber-950/20 border border-amber-500/20 text-amber-200'
                        : 'bg-slate-950 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
                      <span>
                        {comm.authorName} ({comm.authorRole})
                        {comm.isInternalOnly && <span className="text-amber-400 ml-1.5">[INTERNAL]</span>}
                      </span>
                      <span>{comm.createdAt.split('T')[0]}</span>
                    </div>
                    <p>{comm.comment}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a comment or instruction..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
                <label className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <input
                    type="checkbox"
                    checked={newCommentInternalOnly}
                    onChange={(e) => setNewCommentInternalOnly(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700"
                  />
                  <span>Internal</span>
                </label>
                <Button type="submit" variant="primary" size="sm" disabled={!newCommentText.trim()}>
                  Post
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
