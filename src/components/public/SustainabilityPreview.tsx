import React from 'react';
import Link from 'next/link';
import { Leaf, ArrowRight, Check } from 'lucide-react';
import { SUSTAINABILITY_GOALS } from '@/data/public/sustainability';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export function SustainabilityPreview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUSTAINABILITY_GOALS.map((goal, idx) => (
          <Card key={idx} hoverEffect className="bg-card border-border shadow-subtle">
            <CardHeader>
              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-accent mb-2">
                <Leaf className="w-4 h-4" />
              </div>
              <p className="text-label text-muted-foreground">
                {goal.focusArea}
              </p>
              <CardTitle className="text-sm sm:text-base leading-snug">{goal.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-foreground-secondary leading-relaxed">
                {goal.description}
              </p>
              <ul className="space-y-1 text-[11px] text-muted-foreground">
                {goal.initiatives.slice(0, 2).map((init, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{init}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-2">
        <Link
          href="/sustainability"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
        >
          Discover Responsible Sourcing Framework <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
