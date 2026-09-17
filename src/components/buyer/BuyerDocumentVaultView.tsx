'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  Search,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Download,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { BusinessDocument } from '@/types/document';
import { getDocumentsForBuyer, generateSecureDocumentAccess } from '@/lib/documents';
import { DOCUMENT_CATEGORIES } from '@/lib/validation/document.schema';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface BuyerDocumentVaultViewProps {
  initialOrderId?: string;
  orderNumber?: string;
}

export function BuyerDocumentVaultView({ initialOrderId }: BuyerDocumentVaultViewProps) {
  const { user } = useAuth();
  const buyerOrgId = user?.buyerOrganizationId || 'buyer-org-001';

  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [notice, setNotice] = useState<string | null>(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await getDocumentsForBuyer(buyerOrgId, {
        orderId: initialOrderId,
      });
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching buyer documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyerOrgId, initialOrderId]);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (categoryFilter !== 'ALL' && doc.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = doc.title.toLowerCase().includes(q);
        const fileMatch = doc.fileName.toLowerCase().includes(q);
        const orderMatch = (doc.orderNumber || '').toLowerCase().includes(q);
        if (!titleMatch && !fileMatch && !orderMatch) return false;
      }
      return true;
    });
  }, [documents, categoryFilter, searchQuery]);

  const handleDownload = async (docItem: BusinessDocument) => {
    if (!user) return;
    try {
      const access = await generateSecureDocumentAccess(docItem.id, {
        uid: user.uid,
        role: user.role,
        buyerOrganizationId: buyerOrgId,
      });

      window.open(access.downloadUrl, '_blank');
      setNotice(`Secure access token verified for ${access.fileName}. File download initiated.`);
      setTimeout(() => setNotice(null), 4000);
      await loadDocuments();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setNotice(error.message || 'Error generating download access token');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const techPackCount = documents.filter((d) => d.category === 'Tech Pack').length;
  const inspectionCount = documents.filter((d) => d.category === 'Inspection' || d.category === 'Quality').length;
  const certCount = documents.filter((d) => d.category === 'Certificate' || d.category === 'Approval').length;

  return (
    <div className="space-y-8">
      {/* Notice Banner */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <span className="text-xs font-medium uppercase text-primary font-bold">
            Verified Files &amp; Technical Assets
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
            {initialOrderId ? 'Order Specifications & Documentation Vault' : 'Buyer Document Vault'}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-muted/40 px-3 py-1.5 rounded-lg border border-border/60">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Tenant: <strong>{buyerOrgId}</strong></span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {!initialOrderId && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-card/90 border-border/80 space-y-1">
            <span className="text-xs font-medium uppercase text-muted-foreground font-semibold">Available Documents</span>
            <div className="text-2xl font-bold text-foreground font-medium">{documents.length}</div>
            <span className="text-[11px] text-muted-foreground">Active in your organization vault</span>
          </Card>

          <Card className="p-5 bg-card/90 border-border/80 space-y-1">
            <span className="text-xs font-medium uppercase text-muted-foreground font-semibold">Tech Packs &amp; Specs</span>
            <div className="text-2xl font-bold text-primary font-medium">{techPackCount}</div>
            <span className="text-[11px] text-primary/80">Approved garment technical packs</span>
          </Card>

          <Card className="p-5 bg-card/90 border-border/80 space-y-1">
            <span className="text-xs font-medium uppercase text-muted-foreground font-semibold">Quality &amp; Approvals</span>
            <div className="text-2xl font-bold text-emerald-400 font-medium">{inspectionCount + certCount}</div>
            <span className="text-[11px] text-emerald-400/80">Signed certificates &amp; lab-dip reports</span>
          </Card>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search document title, PO number, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-muted/40 rounded-lg border border-border text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-muted/40 rounded-lg border border-border text-foreground focus:outline-none focus:border-primary font-medium"
          >
            <option value="ALL">All Categories</option>
            {DOCUMENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid / Table */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          title="No Documents Available"
          description="There are currently no active documents or technical specs published for this selection."
        />
      ) : (
        <Card className="p-6 bg-card/90 border-border/80 space-y-4">
          <div className="divide-y divide-border/60">
            {filteredDocs.map((docItem) => (
              <div
                key={docItem.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-muted/30 px-3 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {docItem.title}
                      </h4>
                      <Badge variant="blue" size="sm">
                        {docItem.category}
                      </Badge>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
                        v{docItem.version}
                      </span>
                      {docItem.verified && (
                        <span title="Verified &amp; Signed Certificate">
                          <FileCheck className="w-4 h-4 text-emerald-400" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {docItem.fileName} | {docItem.fileSizeFormatted} | Uploaded {docItem.createdAt.split('T')[0]}
                    </p>
                    {docItem.orderNumber && (
                      <p className="text-[11px] font-medium text-primary">
                        Linked Purchase Order: {docItem.orderNumber}
                      </p>
                    )}
                    {docItem.description && (
                      <p className="text-xs text-muted-foreground/90 line-clamp-1">
                        {docItem.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownload(docItem)}
                    className="text-xs gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
