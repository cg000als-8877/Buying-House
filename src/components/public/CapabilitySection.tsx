import React from 'react';
import { SOURCING_CAPABILITIES } from '@/data/public/capabilities';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2 } from 'lucide-react';

export function CapabilitySection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {SOURCING_CAPABILITIES.map((cap, idx) => (
        <Card key={idx} hoverEffect className="bg-surface border-border">
          <CardHeader>
            <div className="mb-1">
              <Badge variant="neutral" size="sm">
                {cap.category}
              </Badge>
            </div>
            <CardTitle className="text-base sm:text-lg">{cap.title}</CardTitle>
            <CardDescription>{cap.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Technical Execution:
            </p>
            <ul className="space-y-2 text-xs text-foreground-secondary">
              {cap.technicalHighlights.map((hl, hIdx) => (
                <li key={hIdx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
