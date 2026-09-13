'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Factory
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ShowcaseSlide {
  id: string;
  title: string;
  label: string;
  image: string;
  tag: string;
  highlight: string;
  description: string;
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'atelier',
    label: 'Atelier & Sampling',
    title: 'Pattern Engineering & Proto Development',
    image: '/images/fashion-atelier.webp',
    tag: 'Rapid Turnaround',
    highlight: '24-48h BOM & Fit Validation',
    description: 'Precision CAD grading, initial fit proto samples, and lab-dip matching before bulk fabric approval.',
  },
  {
    id: 'factory',
    label: 'Production Lines',
    title: 'Compliant High-Capacity Manufacturing',
    image: '/images/factory-floor.webp',
    tag: 'Tier-1 Partner Ecosystem',
    highlight: '300+ Audited Sewing Lines',
    description: 'Direct factory line allocation across circular knits, woven bottoms, and wash-intensive outerwear.',
  },
  {
    id: 'quality',
    label: 'AQL 1.5 Lab',
    title: 'Structured Multi-Stage Inspection Governance',
    image: '/images/quality-inspection.webp',
    tag: 'Quality Standard',
    highlight: '99.4% First-Pass Yield',
    description: 'Stationed QC teams executing 4-Point fabric audits, inline DPI checks, and final pre-shipment FRI.',
  },
  {
    id: 'knitwear',
    label: 'Organic Collections',
    title: 'Sustainable Sourcing & Raw Materials',
    image: '/images/knitwear.webp',
    tag: 'Certified Sustainable',
    highlight: 'GOTS & OEKO-TEX Ready',
    description: 'Low-impact reactive dyes, BCI cotton, recycled poly blends, and plastic-free eco packaging.',
  },
];

const HERO_STATS = [
  {
    value: '50M+',
    label: 'Annual Capacity',
    sub: 'Apparel Units Exported',
  },
  {
    value: 'AQL 1.5',
    label: 'Inspection Protocol',
    sub: 'Pre-Shipment FRI Standard',
  },
  {
    value: '24-48h',
    label: 'Rapid Quotation',
    sub: 'Itemized Open Cost Sheet',
  },
  {
    value: '100%',
    label: 'Audit Transparency',
    sub: 'Digital Buyer Telemetry',
  },
];

export function HeroSection() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeSlide = SHOWCASE_SLIDES[activeSlideIndex];

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-8 pb-14 sm:pt-12 sm:pb-20 border-b border-slate-800/80">
      {/* Ambient background lighting & grid texture */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[450px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12 sm:space-y-16">
        
        {/* Main Hero Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & High-Converting CTAs */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-left">
            
            {/* Clean Category Eyebrow */}
            <p className="text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-amber-400">
              Bangladesh Apparel Sourcing Platform
            </p>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-[52px] text-white tracking-tight leading-[1.12]">
              Engineered Apparel Sourcing from{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Bangladesh.
              </span>
            </h1>

            {/* Subtext (strictly <= 20 words for instant viewport fit) */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-xl font-normal">
              Direct factory access in Bangladesh with precision tech pack execution, AQL 1.5 quality control, and live buyer portal telemetry.
            </p>

            {/* Action CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button 
                  variant="gold" 
                  size="lg" 
                  className="w-full sm:w-auto justify-center gap-2.5 font-bold shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] transition-all text-sm uppercase tracking-wider"
                >
                  <span>Submit Sourcing RFQ</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              
              <Link href="/buyer/login" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto justify-center gap-2 text-sm text-slate-200 border-slate-700 hover:border-amber-400/50 hover:bg-slate-900/80 bg-slate-900/40 backdrop-blur-sm transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Buyer Portal Login</span>
                </Button>
              </Link>
            </div>

            {/* Key Trust Signals */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400 font-sans border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Subcontracting Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>OEKO-TEX &amp; GOTS Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Itemized FOB Cost Sheets</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Multi-Panel Cinematic Showcase */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Interactive Showcase Tabs / Category Switchers */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md overflow-x-auto scrollbar-none">
              {SHOWCASE_SLIDES.map((slide, idx) => {
                const isActive = idx === activeSlideIndex;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-display font-semibold transition-all whitespace-nowrap cursor-pointer select-none flex-1 text-center ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {slide.label}
                  </button>
                );
              })}
            </div>

            {/* Main Visual Display Card */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl group">
              
              {/* Dynamic Image Container */}
              <div className="relative aspect-[16/11] sm:aspect-[16/10] w-full overflow-hidden bg-slate-950">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeSlide.id}
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                </AnimatePresence>
                
                {/* Gradient scrim for high readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Floating Top-Right Stat Badge */}
                <div className="absolute top-3.5 right-3.5 backdrop-blur-md bg-slate-950/85 border border-amber-400/30 rounded-xl px-3 sm:px-4 py-2 shadow-xl">
                  <p className="text-[10px] sm:text-[11px] uppercase font-display font-bold text-amber-400 tracking-wider">
                    {activeSlide.tag}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-white font-sans">
                    {activeSlide.highlight}
                  </p>
                </div>

                {/* Floating Top-Left Status Marker */}
                <div className="absolute top-3.5 left-3.5 backdrop-blur-md bg-slate-950/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-[11px] font-mono text-emerald-400 shadow-md">
                  <span>On-Site Factory Telemetry</span>
                </div>

                {/* Floating Bottom Information Bar */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-950/90 backdrop-blur-md border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-display font-bold text-white tracking-tight">
                      {activeSlide.title}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden sm:inline-block">
                      Stage {activeSlideIndex + 1}/4
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 font-sans">
                    {activeSlide.description}
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Sourcing SLA Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300 font-sans">
                  Target sampling turnaround: <strong className="text-white">7-10 days</strong> from tech pack sign-off
                </span>
              </div>
              <Link 
                href="/products" 
                className="text-amber-400 font-semibold hover:text-amber-300 flex items-center gap-1 transition-colors shrink-0 ml-2"
              >
                <span>Showroom</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>

        {/* Bottom Trust & Metric Grid (Instant Institutional Credibility) */}
        <div className="pt-6 sm:pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {HERO_STATS.map((stat, i) => (
            <div key={i} className="space-y-1 text-left">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-amber-400 tracking-tight">
                {stat.value}
              </p>
              <h4 className="text-xs sm:text-sm font-display font-bold text-white uppercase tracking-wide">
                {stat.label}
              </h4>
              <p className="text-xs text-slate-400 font-sans">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
