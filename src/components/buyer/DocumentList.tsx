import React from 'react';
import { FileText, Download, FileCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface OrderDocument {
  id: string;
  name: string;
  type: 'Tech Pack' | 'Lab-Dip Report' | 'Inspection Certificate' | 'Bill of Lading' | 'Commercial Invoice';
  fileSize: string;
  uploadDate: string;
  verified: boolean;
}

export interface DocumentListProps {
  documents: OrderDocument[];
}

export function DocumentList({ documents }: DocumentListProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs font-medium text-emerald-400 font-bold uppercase tracking-wider">
            Verified Vault
          </span>
          <h3 className="font-sans font-bold text-lg text-white">
            Order Documentation &amp; Test Certificates
          </h3>
        </div>
        <Badge variant="emerald" size="sm">
          SSL Encrypted
        </Badge>
      </div>

      <div className="divide-y divide-slate-800/80">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {doc.name}
                  </h4>
                  {doc.verified && (
                    <span title="Cryptographically Verified Audit Report">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {doc.type} | {doc.fileSize} | Uploaded {doc.uploadDate}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-400 hover:text-amber-300 hover:bg-slate-800"
                onClick={() => alert(`Downloading ${doc.name}...`)}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
