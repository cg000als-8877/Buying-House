'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Factory } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const visualCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP: Complex Marketing staged timeline animation as per rules
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(badgeRef.current, { y: -20, opacity: 0, duration: 0.6 })
        .from(headlineRef.current, { y: 40, opacity: 0, duration: 0.9 }, '-=0.3')
        .from(subtextRef.current, { y: 25, opacity: 0, duration: 0.7 }, '-=0.4')
        .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.6 }, '-=0.3')
        .from(visualCardRef.current, { scale: 0.92, opacity: 0, duration: 1, ease: 'expo.out' }, '-=0.8');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[92vh] flex items-center justify-center bg-slate-950 overflow-hidden pt-20">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,107,100,0.25),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,163,67,0.12),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <p ref={badgeRef} className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-400">
              Full-Spectrum Apparel Sourcing &amp; Manufacturing
            </p>

            <h1 ref={headlineRef} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.15] tracking-tight">
              Where Fashion Vision Meets{' '}
              <span className="text-gold-gradient font-bold">
                Flawless Execution.
              </span>
            </h1>

            <p ref={subtextRef} className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              We empower premier international fashion brands, private labels, and retailers with end-to-end garment manufacturing, certified sustainable fabrics, and AQL 1.5 precision quality control.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm text-slate-300">
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

            <div ref={ctaRef} className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/rfq">
                <Button variant="gold" size="lg" className="w-full sm:w-auto">
                  <span>Request Quotation &amp; Samples</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              
              <Link href="/products">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <span>Explore Digital Showroom</span>
                </Button>
              </Link>
            </div>

            <div className="pt-2 flex items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-slate-400 font-sans">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>100% Pre-Shipment Inspection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Factory className="w-4 h-4 text-emerald-400" />
                <span>Direct Tier-1 Mill Pricing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Stage */}
          <div ref={visualCardRef} className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/30 to-emerald-500/30 blur-xl opacity-70" />
              
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl">
                <div className="relative h-96 sm:h-[460px] w-full overflow-hidden group">
                  <img
                    src="/images/fashion-atelier.webp"
                    alt="High fashion apparel manufacturing"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute top-4 right-4 backdrop-blur-md bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 shadow-lg">
                    <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider font-sans">AQL 1.5 Quality</p>
                    <p className="text-lg font-bold text-white font-sans">99.4% Pass Rate</p>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 backdrop-blur-md bg-slate-950/85 border border-white/10 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-sans">
                        Spring / Summer 2026 Ready
                      </span>
                      <span className="text-xs text-slate-300 font-sans">MOQ: 300 Pcs</span>
                    </div>
                    <h3 className="text-white font-sans font-bold text-base">
                      Premium Organic Heavyweight Series
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-1 font-sans">
                      Custom lab-dip dye, silicon garment wash, custom labels &amp; sustainable packaging.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
