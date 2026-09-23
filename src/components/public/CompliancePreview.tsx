import React from 'react';
import Link from 'next/link';
import { Scale, CheckCircle2, ArrowRight } from 'lucide-react';
import { COMPLIANCE_STANDARDS } from '@/data/public/compliance';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export function CompliancePreview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COMPLIANCE_STANDARDS.map((std, idx) => (
          <Card key={idx} hoverEffect className="bg-card border-border shadow-subtle">
            <CardHeader>
              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-accent mb-2">
                <Scale className="w-4 h-4" />
              </div>
              <p className="text-label text-muted-foreground">
                {std.category}
              </p>
              <CardTitle className="text-sm sm:text-base leading-snug">{std.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {std.description}
              </p>
              <ul className="space-y-1 text-[11px] text-muted-foreground">
                {std.governanceMeasures.slice(0, 2).map((m, mIdx) => (
                  <li key={mIdx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-2">
        <Link
          href="/compliance"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
        >
          Explore Ethical Governance & Factory Audit Protocols <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
