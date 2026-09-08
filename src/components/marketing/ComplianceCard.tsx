import React from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Certification } from '@/types';

export interface ComplianceCardProps {
  cert: Certification;
}

export function ComplianceCard({ cert }: ComplianceCardProps) {
  return (
    <Card hoverEffect className="p-6 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-3xl">{cert.logo}</span>
          <Badge variant="emerald" size="sm">
            {cert.validity}
          </Badge>
        </div>

        <div>
          <h3 className="font-serif font-bold text-lg text-white">{cert.name}</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {cert.description}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-500 truncate max-w-[160px]">{cert.issuer}</span>
        <Link
          href="/rfq"
          className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <span>Request Copy</span>
          <Download className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
