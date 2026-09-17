import React from 'react';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface CTASectionProps {
  badge?: string;
  title?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export function CTASection({
  badge = 'Initiate Sourcing Dialogue',
  title = 'Ready to manufacture your apparel collection in Bangladesh?',
  description = 'Connect with our technical merchandising team today for open-cost analysis, proto sampling turnaround, and compliant factory allocation.',
  primaryCtaText = 'Submit Sourcing RFQ',
  primaryCtaHref = '/contact',
  secondaryCtaText = 'Explore Services',
  secondaryCtaHref = '/services',
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden p-8 sm:p-14 rounded-2xl border border-border bg-gradient-to-b from-surface via-surface to-background-secondary text-center space-y-6 shadow-medium">
      <div className="max-w-2xl mx-auto space-y-4">
        {badge && (
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-500 font-sans">
            {badge}
          </p>
        )}

        <h2 className="font-sans font-bold text-foreground text-h2 tracking-tight leading-tight">
          {title}
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans">
          {description}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href={primaryCtaHref}>
            <Button variant="primary" size="lg" className="gap-2">
              <Mail className="w-4 h-4" />
              {primaryCtaText}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href={secondaryCtaHref}>
            <Button variant="outline" size="lg">
              {secondaryCtaText}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
