import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-500 font-display">
              Apparel Sourcing &amp; Buying House Platform
            </p>

            <h1 className="font-display font-bold text-foreground text-display tracking-tight leading-[1.1]">
              Engineered Apparel Sourcing from Bangladesh.
            </h1>

            <p className="text-body-lg text-foreground-secondary leading-relaxed max-w-2xl">
              Direct, compliant garment manufacturing in Bangladesh with precision tech pack execution, AQL quality governance, and real-time buyer portal telemetry.
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

          {/* Hero Visual Media Showcase */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-border bg-surface shadow-elevated group">
              <img
                src="/images/knitwear.webp"
                alt="International Apparel Sourcing & Manufacturing Hub"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
              
              <div className="absolute top-3.5 right-3.5 backdrop-blur-md bg-slate-950/80 border border-amber-500/30 rounded-xl px-3.5 py-2 shadow-lg">
                <p className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">AQL 1.5 Quality</p>
                <p className="text-base font-bold text-white">99.4% Pass Rate</p>
              </div>

              <div className="absolute bottom-3.5 left-3.5 right-3.5 p-3.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/10 text-xs text-slate-200">
                <p className="font-semibold text-white">Atelier &amp; Manufacturing Hub</p>
                <p className="text-slate-400 text-xs">Direct mill accountability &amp; real-time milestone telemetry</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between text-xs sm:text-sm">
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">Order Transparency Standard</p>
                <p className="text-xs text-muted-foreground">Every purchase order tracked on our digital platform</p>
              </div>
              <Link href="/about" className="text-accent font-semibold hover:underline text-xs sm:text-sm flex items-center gap-1">
                Learn More <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
