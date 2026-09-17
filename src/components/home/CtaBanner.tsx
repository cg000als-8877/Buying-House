'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, MessageSquare, PhoneCall } from 'lucide-react';

export function CtaBanner() {
  return (
    <section className="py-20 bg-slate-950 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-amber-950/40 border-y border-amber-500/20" />
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400">
          Start Your Next Collection With Confidence
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
          Ready to Elevate Your{' '}
          <span className="text-amber-400 font-bold">
            Apparel Quality
          </span>{' '}
          &amp; Profit Margins?
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Send us your tech pack or request physical fabric swatch books today. Receive itemized BOM pricing and lead time estimations within 24 hours.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/rfq"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-sm sm:text-base font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-xl shadow-amber-500/25 transition-all hover:scale-105"
          >
            <span>Request Instant Quote &amp; Samples</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-sm sm:text-base font-semibold text-slate-200 hover:text-white border border-slate-700 hover:border-slate-500 bg-slate-900/80 transition-all hover:bg-slate-800"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Book Virtual Showroom Tour</span>
          </Link>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-slate-300">
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
