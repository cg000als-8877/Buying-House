'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Factory } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center bg-slate-950 overflow-hidden pt-20">
      {/* Ambient background glow & luxury texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,107,100,0.25),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,163,67,0.12),transparent_40%)]" />
      <div 
        className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]" 
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-widest shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Full-Spectrum Apparel Sourcing &amp; Manufacturing</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white leading-[1.15] tracking-tight">
              Where Fashion Vision Meets{' '}
              <span className="text-gold-gradient font-normal italic">
                Flawless Execution.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              We empower premier international fashion brands, private labels, and retailers with end-to-end garment manufacturing, certified sustainable fabrics, and AQL 1.5 precision quality control.
            </p>

            {/* Key Trust Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>OEKO-TEX &amp; GOTS Certified</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>30-45 Days Fast Lead Times</span>
              </div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Low MOQ Friendly (300 pcs)</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/rfq"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-xl shadow-amber-500/25 transition-all hover:scale-105"
              >
                <span>Request Quotation &amp; Samples</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-sm font-semibold text-slate-200 hover:text-white border border-slate-700 hover:border-slate-500 bg-slate-900/60 backdrop-blur-sm transition-all hover:bg-slate-800/80"
              >
                <span>Explore Digital Showroom</span>
              </Link>
            </div>

            {/* Verification sub-line */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>100% Guaranteed Pre-Shipment Inspection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Factory className="w-4 h-4 text-emerald-400" />
                <span>Direct Factory Tier-1 Pricing</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Showcase Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Frame Glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/30 to-emerald-500/30 blur-xl opacity-70" />
              
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
                {/* Main Garment Image */}
                <div className="relative h-96 sm:h-[460px] w-full overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
                    alt="High fashion apparel manufacturing"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Floating Metric Badge */}
                  <div className="absolute top-4 right-4 backdrop-blur-md bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 shadow-lg">
                    <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">AQL 1.5 Quality</p>
                    <p className="text-lg font-bold text-white">99.4% Pass Rate</p>
                  </div>

                  {/* Floating Bottom Card */}
                  <div className="absolute bottom-4 left-4 right-4 backdrop-blur-md bg-slate-950/85 border border-white/10 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        Spring / Summer 2026 Ready
                      </span>
                      <span className="text-xs text-slate-300">MOQ: 300 Pcs</span>
                    </div>
                    <h3 className="text-white font-serif font-bold text-base">
                      Premium Organic Heavyweight Series
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      Custom lab-dip dye, silicon garment wash, custom labels &amp; sustainable packaging.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
