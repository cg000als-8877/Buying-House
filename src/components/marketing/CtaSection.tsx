import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CtaSection() {
  return (
    <section className="py-20 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-amber-950/40 border-y border-amber-500/20 pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400">
          Start Your Next Collection With Confidence
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
          Ready to Elevate Your Apparel Quality &amp; Profit Margins?
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Send us your tech pack or request physical fabric swatch books today. Receive itemized BOM pricing and lead time estimations within 24 hours.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/rfq">
            <Button variant="gold" size="lg" className="w-full sm:w-auto">
              <span>Request Instant Quote &amp; Samples</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/contact">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Book Virtual Showroom Tour</span>
            </Button>
          </Link>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span>24-Hour Quotation Turnaround</span>
          <span className="h-3 w-px bg-slate-700 hidden sm:inline-block" />
          <span>NDA Guaranteed Privacy</span>
          <span className="h-3 w-px bg-slate-700 hidden sm:inline-block" />
          <span>Free Fabric Swatches for Qualified Brands</span>
        </div>
      </div>
    </section>
  );
}
