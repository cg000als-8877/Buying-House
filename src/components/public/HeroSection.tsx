import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MediaPlaceholder } from './MediaPlaceholder';

export function HeroSection() {
  const trustPoints = [
    'Verified Partner Factory Framework',
    'AQL 1.5 / 2.5 Quality Assurance Architecture',
    'Secure Buyer Portal & Production Telemetry',
    'Transparent Sourcing & Cost Breakdown Models',
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-border/60">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/5 via-accent/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div>
              <Badge variant="brand" size="md" dot>
                Apparel Sourcing & Buying House Platform
              </Badge>
            </div>

            <h1 className="font-display font-bold text-foreground text-display tracking-tight leading-[1.1]">
              Engineered Apparel Sourcing from Bangladesh.
            </h1>

            <p className="text-body-lg text-foreground-secondary leading-relaxed max-w-2xl">
              XYZ Buying House connects international apparel brands, retailers, and private labels with compliant garment manufacturing facilities in Bangladesh. Precision tech pack execution, structured AQL quality governance, and dedicated buyer portal telemetry.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/contact">
                <Button variant="primary" size="lg" className="gap-2 text-sm shadow-medium">
                  Submit Sourcing RFQ
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/buyer/login">
                <Button variant="outline" size="lg" className="gap-2 text-sm">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  Buyer Portal Login
                </Button>
              </Link>
            </div>

            {/* Trust checkmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-border/80 text-xs text-foreground-secondary">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual Media Placeholder */}
          <div className="lg:col-span-5 space-y-3">
            <MediaPlaceholder
              aspectRatio="4/3"
              label="International Showroom & Production Hub"
              sublabel="High-resolution verified apparel imagery placeholder"
              className="shadow-elevated"
            />
            <div className="p-4 rounded-lg bg-surface border border-border flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">Order Transparency Standard</p>
                <p className="text-[11px] text-muted-foreground">Every purchase order tracked on our digital platform</p>
              </div>
              <Link href="/about" className="text-accent font-semibold hover:underline text-xs flex items-center gap-1">
                Learn More <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
