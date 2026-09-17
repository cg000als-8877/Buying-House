'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Truck,
  Paperclip,
  MessageSquare,
  ExternalLink,
  History,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { Sample } from '@/types/sample';
import { Order } from '@/types/order';
import {
  getSamplesForBuyer,
  recordBuyerSampleDecision,
  addSampleComment,
} from '@/lib/samples';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface BuyerSampleApprovalViewProps {
  order: Order;
  buyerOrgId: string;
}

export function BuyerSampleApprovalView({ order, buyerOrgId }: BuyerSampleApprovalViewProps) {
  const { user } = useAuth();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

  // Decision Modal State
  const [decisionModalSample, setDecisionModalSample] = useState<Sample | null>(null);
  const [decisionType, setDecisionType] = useState<'approved' | 'changes_requested' | 'rejected'>('approved');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Comment Form State inside Detail Modal
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Notice
  const [notice, setNotice] = useState<string | null>(null);

  const loadSamples = async () => {
    setIsLoading(true);
    try {
      const data = await getSamplesForBuyer(order.id, buyerOrgId);
      setSamples(data);
      if (selectedSample) {
        const refreshed = data.find((s) => s.id === selectedSample.id);
        if (refreshed) setSelectedSample(refreshed);
      }
    } catch (err) {
      console.error('Error fetching buyer samples:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSamples();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id, buyerOrgId]);

  const handleOpenDecisionModal = (sample: Sample, type: 'approved' | 'changes_requested' | 'rejected') => {
    setDecisionModalSample(sample);
    setDecisionType(type);
    setFeedbackNotes('');
    setDecisionError(null);
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionModalSample || !user) return;

    if (
      (decisionType === 'changes_requested' || decisionType === 'rejected') &&
      feedbackNotes.trim().length < 5
    ) {
      setDecisionError('Please provide detailed feedback (at least 5 characters) explaining required modifications.');
      return;
    }

    setIsSubmittingDecision(true);
    setDecisionError(null);

    try {
      await recordBuyerSampleDecision(
        decisionModalSample.id,
        {
          sampleId: decisionModalSample.id,
          decision: decisionType,
          feedback: feedbackNotes.trim(),
        },
        {
          uid: user.uid,
          role: user.role,
          buyerOrganizationId: buyerOrgId,
          displayName: user.displayName,
        }
      );

      const decisionText =
        decisionType === 'approved'
          ? 'approved'
          : decisionType === 'changes_requested'
          ? 'marked for revision'
          : 'rejected';

      setNotice(`Sample ${decisionModalSample.sampleType} (v${decisionModalSample.revisionNumber}) was successfully ${decisionText}.`);
      setTimeout(() => setNotice(null), 5000);
      setDecisionModalSample(null);
      await loadSamples();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setDecisionError(error.message || 'Failed to record decision');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSample || !user || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await addSampleComment(
        selectedSample.id,
        newComment.trim(),
        false,
        { uid: user.uid, role: user.role, displayName: user.displayName }
      );
      setNewComment('');
      await loadSamples();
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const pendingReviewSamples = samples.filter((s) => s.status === 'submitted');

  return (
    <div className="space-y-8">
      {notice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {pendingReviewSamples.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>Action Required: {pendingReviewSamples.length} Sample(s) Awaiting Your Review</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Physical garments have been dispatched for fitting and material evaluation. Please inspect the courier tracking and review sample specs to approve or request adjustments.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <span className="text-xs font-medium uppercase text-primary font-bold">
            Fit, Proto &amp; Pre-Production Approvals
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
            Garment Sample Development
          </h2>
        </div>
      </div>

      {samples.length === 0 ? (
        <EmptyState
          title="No Samples Scheduled"
          description="There are currently no active prototype or pre-production sample submissions recorded for this purchase order."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {samples.map((sample) => {
            const isSubmitted = sample.status === 'submitted';
            const isApproved = sample.status === 'approved';
            const isChangesRequested = sample.status === 'changes_requested';
            const isRejected = sample.status === 'rejected';

            return (
              <Card
                key={sample.id}
                className={`p-6 bg-card/90 border-border/80 space-y-5 hover:border-primary/40 transition-all flex flex-col justify-between ${
                  isApproved
                    ? 'border-emerald-500/30'
                    : isSubmitted
                    ? 'border-blue-500/40 ring-1 ring-blue-500/20'
                    : isChangesRequested
                    ? 'border-amber-500/40'
                    : isRejected
                    ? 'border-rose-500/30'
                    : ''
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-border/60">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-primary uppercase font-bold tracking-wider">
                          Revision v{sample.revisionNumber}
                        </span>
                        {(sample.history?.length || 0) > 0 && (
                          <span className="text-[10px] font-medium text-muted-foreground">
                            ({sample.history?.length} previous round{(sample.history?.length || 0) > 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-lg text-foreground mt-0.5">
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
                      {isSubmitted
                        ? 'Awaiting Review'
                        : isChangesRequested
                        ? 'Changes Req.'
                        : sample.status === 'in_development'
                        ? 'In Development'
                        : sample.status}
                    </Badge>
                  </div>

                  {sample.trackingNumber && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                          <Truck className="w-3.5 h-3.5 text-primary" />
                          <span>{sample.courierName || 'Airway Bill'}:</span>
                        </span>
                        <span className="font-medium font-bold text-primary truncate max-w-[150px]">
                          {sample.trackingNumber}
                        </span>
                      </div>
                      {sample.submittedAt && (
                        <div className="text-[11px] text-muted-foreground font-medium text-right">
                          Dispatched: {sample.submittedAt.split('T')[0]}
                        </div>
                      )}
                    </div>
                  )}

                  {sample.buyerRemarks && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <span className="text-[10px] font-medium uppercase text-foreground/70 font-semibold block">
                        Specification Notes:
                      </span>
                      <p className="line-clamp-2 leading-relaxed">{sample.buyerRemarks}</p>
                    </div>
                  )}

                  {sample.buyerFeedback && (
                    <div
                      className={`p-3 rounded-xl text-xs border ${
                        isApproved
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                          : isChangesRequested
                          ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                          : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <span className="text-[10px] font-medium uppercase font-bold block mb-1">
                        Your Feedback ({sample.decidedAt?.split('T')[0]}):
                      </span>
                      <p className="line-clamp-2 italic">&quot;{sample.buyerFeedback}&quot;</p>
                    </div>
                  )}

                  {(sample.attachments?.length || 0) > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                      <Paperclip className="w-3.5 h-3.5 text-primary" />
                      <span>{sample.attachments?.length} Attached Spec Document/Photo</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedSample(sample)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>View Full History &amp; Specs</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isSubmitted && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenDecisionModal(sample, 'approved')}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDecisionModal(sample, 'changes_requested')}
                        className="text-xs border-amber-500/50 text-amber-400 hover:bg-amber-500/10 gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Req Changes</span>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {decisionModalSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="max-w-lg w-full p-6 bg-card border-border space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-xs font-medium uppercase text-primary font-bold">
                  Buyer Quality Verification
                </span>
                <h3 className="font-serif font-bold text-lg text-foreground">
                  Record Decision: {decisionModalSample.sampleType} (v{decisionModalSample.revisionNumber})
                </h3>
              </div>
              <button
                onClick={() => setDecisionModalSample(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {decisionError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {decisionError}
              </div>
            )}

            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecisionType('approved')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    decisionType === 'approved'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-border text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Approve Sample</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType('changes_requested')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    decisionType === 'changes_requested'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                      : 'border-border text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <span>Request Changes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType('rejected')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    decisionType === 'rejected'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-500'
                      : 'border-border text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span>Reject Sample</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Comments &amp; Technical Alterations{' '}
                  {decisionType !== 'approved' && <span className="text-rose-400">* (Required)</span>}
                </label>
                <textarea
                  rows={4}
                  required={decisionType !== 'approved'}
                  placeholder={
                    decisionType === 'approved'
                      ? 'e.g. Sample fits perfectly to specs. Approved to proceed to next stage.'
                      : 'e.g. Chest circumference is +2cm over tolerance. Please taper sides and resubmit v2.'
                  }
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-muted/40 rounded-xl border border-border text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDecisionModalSample(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingDecision}
                  className={
                    decisionType === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : decisionType === 'changes_requested'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }
                >
                  Confirm &amp; Record Decision
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {selectedSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <Card className="max-w-2xl w-full p-6 bg-card border-border space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-xs font-medium uppercase text-primary font-bold">
                  Revision v{selectedSample.revisionNumber}
                </span>
                <h3 className="font-serif font-bold text-xl text-foreground">
                  {selectedSample.sampleType} Specifications
                </h3>
              </div>
              <button
                onClick={() => setSelectedSample(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-muted-foreground block text-[11px]">Courier / AWB Tracking:</span>
                <span className="font-medium font-bold text-foreground">
                  {selectedSample.courierName || 'Carrier'}: {selectedSample.trackingNumber || 'Pending'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-muted-foreground block text-[11px]">Submission Date:</span>
                <span className="font-medium text-foreground">
                  {selectedSample.submittedAt?.split('T')[0] || 'In Preparation'}
                </span>
              </div>
            </div>

            {(selectedSample.attachments?.length || 0) > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase font-bold text-foreground flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-primary" />
                  <span>Verified Sample Attachments &amp; Photos</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSample.attachments?.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-2"
                    >
                      <div className="truncate text-xs">
                        <div className="font-semibold text-foreground truncate">{att.fileName}</div>
                        <div className="text-[10px] text-muted-foreground font-medium">{att.fileSize}</div>
                      </div>
                      {att.url && (
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(selectedSample.history?.length || 0) > 0 && (
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs font-medium uppercase font-bold text-foreground flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>Previous Revision Rounds</span>
                </h4>
                <div className="space-y-2">
                  {selectedSample.history?.map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium font-bold text-primary">Revision v{rev.revisionNumber}</span>
                        <Badge
                          variant={
                            rev.status === 'approved'
                              ? 'emerald'
                              : rev.status === 'changes_requested'
                              ? 'amber'
                              : 'rose'
                          }
                          size="sm"
                        >
                          {rev.status}
                        </Badge>
                      </div>
                      {rev.buyerFeedback && (
                        <p className="text-muted-foreground italic">&quot;{rev.buyerFeedback}&quot;</p>
                      )}
                      {rev.revisionNotes && (
                        <p className="text-[11px] text-foreground font-medium">Note: {rev.revisionNotes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-3 border-t border-border">
              <h4 className="text-xs font-medium uppercase font-bold text-foreground flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                <span>Technical Discussion Thread</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(selectedSample.comments?.length || 0) === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No comments recorded yet.</p>
                ) : (
                  selectedSample.comments?.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium">
                        <span className="font-bold text-foreground">{comment.authorName}</span>
                        <span>{comment.createdAt.split('T')[0]}</span>
                      </div>
                      <p className="text-foreground/90">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Ask a technical question about this sample..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-muted/40 rounded-xl border border-border text-foreground focus:outline-none focus:border-primary"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="text-xs"
                >
                  Send
                </Button>
              </form>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setSelectedSample(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
