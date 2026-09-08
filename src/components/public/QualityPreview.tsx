import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { QUALITY_PILLARS } from '@/data/public/quality';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function QualityPreview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {QUALITY_PILLARS.map((pillar, idx) => (
          <Card key={idx} hoverEffect className="flex flex-col justify-between bg-surface border-border">
            <div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="neutral" size="sm">
                    {pillar.stage}
                  </Badge>
                  <ShieldCheck className="w-4 h-4 text-accent" />
                </div>
                <CardTitle className="text-base">{pillar.title}</CardTitle>
                <CardDescription className="text-xs font-mono text-accent">
                  {pillar.standard}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  {pillar.description}
                </p>
                <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                  {pillar.checkpoints.slice(0, 2).map((cp, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-success shrink-0 mt-0.5" />
                      <span>{cp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center pt-2">
        <Link
          href="/quality"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
        >
          Review Full Quality Manual & Lab Test Parameters <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
