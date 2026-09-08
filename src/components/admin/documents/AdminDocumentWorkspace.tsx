'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  Upload,
  Download,
  History,
  Archive,
  RotateCcw,
  Trash2,
  Edit,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  CheckCircle2,
  X,
  FileCheck,
  FilePlus,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink,
  FolderLock,
  Building2,
  Package,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { hasPermission } from '@/lib/auth/permissions';
import { UserRole } from '@/types/auth';
import {
  BusinessDocument,
  DocumentCategory,
  DocumentVisibility,
  DocumentStatus,
} from '@/types/document';
import {
  getDocuments,
  createDocument,
  createDocumentRevision,
  updateDocumentMetadata,
  archiveDocument,
  restoreDocument,
  deleteDocument,
  generateSecureDocumentAccess,
  formatBytes,
} from '@/lib/documents';
import { DOCUMENT_CATEGORIES, ALLOWED_MIME_TYPES } from '@/lib/validation/document.schema';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

interface AdminDocumentWorkspaceProps {
  initialOrderId?: string;
  orderNumber?: string;
}

export function AdminDocumentWorkspace({ initialOrderId, orderNumber }: AdminDocumentWorkspaceProps) {
  const { user } = useAuth();
  const canWrite = hasPermission(user?.role, 'documents.write');
  const canArchive = hasPermission(user?.role, 'documents.archive');
  const canDelete = hasPermission(user?.role, 'documents.delete');
  const canViewRestricted = hasPermission(user?.role, 'documents.restricted');

  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [buyerOrgFilter, setBuyerOrgFilter] = useState<string>('ALL');

  // Modals & Drawers
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [revisingDoc, setRevisingDoc] = useState<BusinessDocument | null>(null);
  const [historyDoc, setHistoryDoc] = useState<BusinessDocument | null>(null);
  const [editingDoc, setEditingDoc] = useState<BusinessDocument | null>(null);
  const [archivingDoc, setArchivingDoc] = useState<BusinessDocument | null>(null);

  // Form States
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    category: 'Tech Pack' as DocumentCategory,
    visibility: 'buyer' as DocumentVisibility,
    status: 'active' as DocumentStatus,
    buyerOrganizationId: 'buyer-org-001',
    orderId: initialOrderId || '',
    orderNumber: orderNumber || '',
    description: '',
    fileName: '',
    fileSize: 2097152, // 2MB default
    mimeType: 'application/pdf' as AllowedMimeType,
  });

  const [revisionFormData, setRevisionFormData] = useState({
    fileName: '',
    fileSize: 2097152,
    mimeType: 'application/pdf' as AllowedMimeType,
    changeNote: '',
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    category: 'Tech Pack' as DocumentCategory,
    visibility: 'buyer' as DocumentVisibility,
    description: '',
  });

  const [archiveReason, setArchiveReason] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load documents
  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await getDocuments(undefined, user ? { uid: user.uid, role: user.role } : undefined);
      setDocuments(data);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Derived filtered list
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (initialOrderId && doc.orderId !== initialOrderId) return false;
      if (categoryFilter !== 'ALL' && doc.category !== categoryFilter) return false;
      if (visibilityFilter !== 'ALL' && doc.visibility !== visibilityFilter) return false;
      if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;
      if (buyerOrgFilter !== 'ALL' && doc.buyerOrganizationId !== buyerOrgFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = doc.title.toLowerCase().includes(q);
        const fileMatch = doc.fileName.toLowerCase().includes(q);
        const orderMatch = (doc.orderNumber || '').toLowerCase().includes(q);
        const descMatch = (doc.description || '').toLowerCase().includes(q);
        if (!titleMatch && !fileMatch && !orderMatch && !descMatch) return false;
      }
      return true;
    });
  }, [documents, initialOrderId, categoryFilter, visibilityFilter, statusFilter, buyerOrgFilter, searchQuery]);

  // Summary Metrics
  const totalCount = documents.length;
  const activeCount = documents.filter((d) => d.status === 'active').length;
  const buyerVisibleCount = documents.filter((d) => d.visibility === 'buyer' && d.status === 'active').length;
  const archivedCount = documents.filter((d) => d.status === 'archived').length;
  const totalBytes = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);

  // Handlers
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const fileNameToUse = uploadFormData.fileName.trim() || `${uploadFormData.title.replace(/\s+/g, '_')}.pdf`;
      await createDocument(
        {
          title: uploadFormData.title.trim(),
          category: uploadFormData.category,
          visibility: uploadFormData.visibility,
          status: uploadFormData.status,
          buyerOrganizationId: uploadFormData.buyerOrganizationId.trim(),
          orderId: uploadFormData.orderId.trim() || undefined,
          orderNumber: uploadFormData.orderNumber.trim() || undefined,
          description: uploadFormData.description.trim() || undefined,
          fileName: fileNameToUse,
          fileSize: uploadFormData.fileSize,
          mimeType: uploadFormData.mimeType,
        },
        { uid: user.uid, role: user.role, displayName: user.displayName }
      );

      setIsUploadModalOpen(false);
      setNotice(`Document "${uploadFormData.title}" successfully uploaded to vault.`);
      setTimeout(() => setNotice(null), 4000);
      setUploadFormData({
        title: '',
        category: 'Tech Pack',
        visibility: 'buyer',
        status: 'active',
        buyerOrganizationId: 'buyer-org-001',
        orderId: initialOrderId || '',
        orderNumber: orderNumber || '',
        description: '',
        fileName: '',
        fileSize: 2097152,
        mimeType: 'application/pdf',
      });
      await loadDocuments();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFormError(error.message || 'Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisingDoc || !user) return;
    if (revisionFormData.changeNote.trim().length < 3) {
      setFormError('Please provide a change note explaining this revision (at least 3 characters).');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    try {
      const nextVer = revisingDoc.version + 1;
      const fileNameToUse = revisionFormData.fileName.trim() || `${revisingDoc.title.replace(/\s+/g, '_')}_v${nextVer}.pdf`;

      await createDocumentRevision(
        {
          documentId: revisingDoc.id,
          fileName: fileNameToUse,
          fileSize: revisionFormData.fileSize,
          mimeType: revisionFormData.mimeType,
          changeNote: revisionFormData.changeNote.trim(),
        },
        { uid: user.uid, role: user.role, displayName: user.displayName }
      );

      setNotice(`Revision v${nextVer} registered for "${revisingDoc.title}".`);
      setTimeout(() => setNotice(null), 4000);
      setRevisingDoc(null);
      setRevisionFormData({
        fileName: '',
        fileSize: 2097152,
        mimeType: 'application/pdf',
        changeNote: '',
      });
      await loadDocuments();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFormError(error.message || 'Failed to upload revision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !user) return;
    setIsSubmitting(true);

    try {
      await updateDocumentMetadata(
        editingDoc.id,
        {
          title: editFormData.title.trim(),
          category: editFormData.category,
          visibility: editFormData.visibility,
          description: editFormData.description.trim(),
        },
        { uid: user.uid, role: user.role }
      );

      setNotice(`Metadata updated for "${editFormData.title}".`);
      setTimeout(() => setNotice(null), 4000);
      setEditingDoc(null);
      await loadDocuments();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setFormError(error.message || 'Failed to update metadata');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archivingDoc || !user) return;
    setIsSubmitting(true);

    try {
      await archiveDocument(archivingDoc.id, archiveReason.trim(), { uid: user.uid, role: user.role });
      setNotice(`Document "${archivingDoc.title}" moved to archive.`);
      setTimeout(() => setNotice(null), 4000);
      setArchivingDoc(null);
      setArchiveReason('');
      await loadDocuments();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setNotice(error.message || 'Failed to archive document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async (docToRestore: BusinessDocument) => {
    if (!user) return;
    try {
      await restoreDocument(docToRestore.id, { uid: user.uid, role: user.role });
      setNotice(`Document "${docToRestore.title}" restored to active vault.`);
      setTimeout(() => setNotice(null), 4000);
      await loadDocuments();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setNotice(error.message || 'Failed to restore document');
    }
  };

  const handleDelete = async (docToDelete: BusinessDocument) => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${docToDelete.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDocument(docToDelete.id, { uid: user.uid, role: user.role });
      setNotice(`Document "${docToDelete.title}" permanently deleted.`);
      setTimeout(() => setNotice(null), 4000);
      await loadDocuments();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setNotice(error.message || 'Failed to delete document');
    }
  };

  const handleDownload = async (docItem: BusinessDocument) => {
    if (!user) return;
    try {
      const access = await generateSecureDocumentAccess(docItem.id, {
        uid: user.uid,
        role: user.role,
        buyerOrganizationId: user.buyerOrganizationId || undefined,
      });

      // Simulated secure download
      window.open(access.downloadUrl, '_blank');
      setNotice(`Access granted for ${access.fileName}. Secure audit log emitted.`);
      setTimeout(() => setNotice(null), 4000);
      await loadDocuments();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setNotice(error.message || 'Error generating access token');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notice Banner */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-amber-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase text-amber-400 font-bold">
            Document Repository &amp; Storage
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            {initialOrderId ? 'Order Document Vault' : 'Enterprise Document Vault'}
          </h2>
        </div>

        {canWrite && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="gap-1.5 text-xs font-semibold self-start sm:self-auto"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </Button>
        )}
      </div>

      {/* Dashboard KPI Summary Cards */}
      {!initialOrderId && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">Total Documents</span>
            <div className="text-xl font-bold text-white font-mono">{totalCount}</div>
            <span className="text-[10px] text-slate-500 font-mono">In repository</span>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">Active in Vault</span>
            <div className="text-xl font-bold text-emerald-400 font-mono">{activeCount}</div>
            <span className="text-[10px] text-emerald-500/80 font-mono">Current records</span>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">Buyer Visible</span>
            <div className="text-xl font-bold text-blue-400 font-mono">{buyerVisibleCount}</div>
            <span className="text-[10px] text-blue-400/80 font-mono">Portal accessible</span>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">Archived</span>
            <div className="text-xl font-bold text-amber-400 font-mono">{archivedCount}</div>
            <span className="text-[10px] text-amber-500/80 font-mono">Historical records</span>
          </Card>

          <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-1 col-span-2 lg:col-span-1">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">Total Storage</span>
            <div className="text-xl font-bold text-white font-mono">{formatBytes(totalBytes)}</div>
            <span className="text-[10px] text-slate-500 font-mono">Encrypted volume</span>
          </Card>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative sm:col-span-2 lg:col-span-2">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search document title, filename, or PO #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-mono"
          >
            <option value="ALL">All Categories</option>
            {DOCUMENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-mono"
          >
            <option value="ALL">All Visibilities</option>
            <option value="buyer">Buyer Visible</option>
            <option value="internal">Internal Only</option>
            {canViewRestricted && <option value="restricted">Restricted Governance</option>}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active Vault</option>
            <option value="archived">Archived Records</option>
          </select>
        </div>
      </div>

      {/* Document Directory Table */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          title="No Documents Found"
          description="There are currently no document files matching your active search query or filter selection."
        />
      ) : (
        <Card className="overflow-hidden bg-slate-900/90 border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 font-mono text-[11px] text-slate-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Document Title &amp; File</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Organization / PO</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredDocs.map((docItem) => {
                  const isArchived = docItem.status === 'archived';
                  const isBuyerVis = docItem.visibility === 'buyer';
                  const isRestricted = docItem.visibility === 'restricted';

                  return (
                    <tr
                      key={docItem.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isArchived ? 'opacity-60 bg-slate-950/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-semibold text-white block hover:text-amber-400 transition-colors">
                              {docItem.title}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                              <span>{docItem.fileName}</span>
                              <span>•</span>
                              <span>{docItem.fileSizeFormatted}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="blue" size="sm">
                          {docItem.category}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <span className="text-amber-400 font-bold block">{docItem.buyerOrganizationId}</span>
                          {docItem.orderNumber && (
                            <span className="text-slate-400 block">PO: {docItem.orderNumber}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => setHistoryDoc(docItem)}
                          className="font-mono text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20"
                          title="View revision history"
                        >
                          <span>v{docItem.version}</span>
                          {(docItem.history?.length || 0) > 0 && (
                            <span className="text-[10px] text-slate-400">
                              (+{docItem.history?.length})
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant={isBuyerVis ? 'emerald' : isRestricted ? 'rose' : 'amber'}
                          size="sm"
                        >
                          {docItem.visibility}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={isArchived ? 'slate' : 'emerald'} size="sm">
                          {docItem.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5 text-[11px] font-mono text-slate-400">
                          <span className="block text-slate-300">{docItem.createdAt.split('T')[0]}</span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[100px]">
                            {docItem.uploaderName || docItem.uploadedBy}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Secure Download */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(docItem)}
                            className="text-amber-400 hover:text-amber-300 hover:bg-slate-800 p-1.5 h-7"
                            title="Download document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>

                          {/* Upload Revision */}
                          {canWrite && !isArchived && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRevisingDoc(docItem);
                                setRevisionFormData({
                                  fileName: '',
                                  fileSize: 2097152,
                                  mimeType: 'application/pdf',
                                  changeNote: '',
                                });
                              }}
                              className="text-blue-400 hover:text-blue-300 hover:bg-slate-800 p-1.5 h-7"
                              title="Upload new version"
                            >
                              <FilePlus className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {/* Edit Metadata */}
                          {canWrite && !isArchived && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingDoc(docItem);
                                setEditFormData({
                                  title: docItem.title,
                                  category: docItem.category,
                                  visibility: docItem.visibility,
                                  description: docItem.description || '',
                                });
                              }}
                              className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 h-7"
                              title="Edit metadata"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {/* Archive / Restore */}
                          {canArchive && (
                            isArchived ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRestore(docItem)}
                                className="text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 p-1.5 h-7"
                                title="Restore document"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setArchivingDoc(docItem);
                                  setArchiveReason('');
                                }}
                                className="text-amber-400 hover:text-amber-300 hover:bg-slate-800 p-1.5 h-7"
                                title="Archive document"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </Button>
                            )
                          )}

                          {/* Delete (Super Admin / Admin only) */}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(docItem)}
                              className="text-slate-500 hover:text-rose-400 hover:bg-slate-800 p-1.5 h-7"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <Card className="max-w-xl w-full p-6 bg-slate-900 border-slate-800 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                  File Ingestion Vault
                </span>
                <h3 className="font-serif font-bold text-lg text-white">Upload New Business Document</h3>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Document Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Approved Tech Pack v2.1 — Organic Crewneck"
                  value={uploadFormData.title}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={uploadFormData.category}
                    onChange={(e) =>
                      setUploadFormData({ ...uploadFormData, category: e.target.value as DocumentCategory })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-mono"
                  >
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Visibility Scope <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={uploadFormData.visibility}
                    onChange={(e) =>
                      setUploadFormData({ ...uploadFormData, visibility: e.target.value as DocumentVisibility })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-mono"
                  >
                    <option value="buyer">Buyer Visible (Portal Sync)</option>
                    <option value="internal">Internal Only (Staff Eyes)</option>
                    {canViewRestricted && <option value="restricted">Restricted Governance</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Buyer Organization Tenant <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. buyer-org-001"
                    value={uploadFormData.buyerOrganizationId}
                    onChange={(e) =>
                      setUploadFormData({ ...uploadFormData, buyerOrganizationId: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Linked Purchase Order ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. TEST-ORDER-001"
                    value={uploadFormData.orderId}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, orderId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">File Attachment (Simulated / Local)</label>
                <div className="p-4 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/60 text-center space-y-2">
                  <Upload className="w-6 h-6 text-amber-400 mx-auto" />
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-amber-400">Click to attach file</span> or drag &amp; drop
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    PDF, DOCX, XLSX, CSV, PNG, JPG (Max 50MB)
                  </p>
                  <input
                    type="text"
                    placeholder="File name (e.g. STY-KNIT-880_Specs.pdf)"
                    value={uploadFormData.fileName}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, fileName: e.target.value })}
                    className="w-full max-w-sm mx-auto px-3 py-1.5 text-xs bg-slate-900 rounded border border-slate-800 text-white font-mono text-center focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description &amp; Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional metadata, inspection dates, or version notes..."
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  Save &amp; Ingest Document
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Upload Revision Modal */}
      {revisingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 bg-slate-900 border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                  Next Version: v{revisingDoc.version + 1}
                </span>
                <h3 className="font-serif font-bold text-base text-white">Upload Document Revision</h3>
              </div>
              <button onClick={() => setRevisingDoc(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Updating: <strong className="text-white">{revisingDoc.title}</strong>. Previous version v{revisingDoc.version} will be preserved in immutable history.
            </p>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleRevisionSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Revision Change Note <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Updated chest tolerance specs per buyer comment."
                  value={revisionFormData.changeNote}
                  onChange={(e) => setRevisionFormData({ ...revisionFormData, changeNote: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Updated File Name</label>
                <input
                  type="text"
                  placeholder={`e.g. ${revisingDoc.fileName.replace(/\.pdf$/, '')}_v${revisingDoc.version + 1}.pdf`}
                  value={revisionFormData.fileName}
                  onChange={(e) => setRevisionFormData({ ...revisionFormData, fileName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setRevisingDoc(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  Register Version v{revisingDoc.version + 1}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Revision History Drawer / Modal */}
      {historyDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <Card className="max-w-xl w-full p-6 bg-slate-900 border-slate-800 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                  Immutable Audit Chain
                </span>
                <h3 className="font-serif font-bold text-lg text-white">
                  Version History: {historyDoc.title}
                </h3>
              </div>
              <button onClick={() => setHistoryDoc(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Active Version */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Version v{historyDoc.version} (Current Active)</span>
                </span>
                <Badge variant="emerald" size="sm">
                  Latest
                </Badge>
              </div>
              <div className="text-xs font-mono text-slate-300 flex justify-between">
                <span>{historyDoc.fileName}</span>
                <span>{historyDoc.fileSizeFormatted}</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Uploaded {historyDoc.updatedAt.split('T')[0]} by {historyDoc.uploaderName || historyDoc.uploadedBy}
              </p>
            </div>

            {/* Historical Predecessors */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono uppercase text-slate-400 font-bold">
                Archived Previous Versions
              </h4>

              {(historyDoc.history?.length || 0) === 0 ? (
                <p className="text-xs text-slate-500 italic">No previous versions on record (initial v1 file).</p>
              ) : (
                <div className="space-y-2">
                  {historyDoc.history?.map((hist) => (
                    <div
                      key={hist.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-slate-300">Version v{hist.version}</span>
                        <span className="text-slate-500">{hist.createdAt.split('T')[0]}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                        <span>{hist.fileName}</span>
                        <span>{hist.fileSizeFormatted}</span>
                      </div>
                      {hist.changeNote && (
                        <p className="text-amber-300/80 bg-slate-900/60 p-2 rounded text-[11px] font-mono">
                          Note: {hist.changeNote}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setHistoryDoc(null)}>
                Close History
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 bg-slate-900 border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-serif font-bold text-base text-white">Edit Document Metadata</h3>
              <button onClick={() => setEditingDoc(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Document Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, category: e.target.value as DocumentCategory })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-mono"
                  >
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Visibility</label>
                  <select
                    value={editFormData.visibility}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, visibility: e.target.value as DocumentVisibility })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-mono"
                  >
                    <option value="buyer">Buyer Visible</option>
                    <option value="internal">Internal Only</option>
                    {canViewRestricted && <option value="restricted">Restricted Governance</option>}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingDoc(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Archive Modal */}
      {archivingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 bg-slate-900 border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-serif font-bold text-base text-white">Archive Document</h3>
              <button onClick={() => setArchivingDoc(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Archiving <strong className="text-white">{archivingDoc.title}</strong> will remove it from active circulation and hide it from buyer portals while preserving complete revision history and audit logs.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Reason for Archiving</label>
              <textarea
                rows={2}
                placeholder="e.g. Superseded by newer tech pack version v2.0."
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-800 text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button type="button" variant="ghost" size="sm" onClick={() => setArchivingDoc(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleArchiveConfirm}
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-500 text-white"
              >
                Confirm Archive
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
