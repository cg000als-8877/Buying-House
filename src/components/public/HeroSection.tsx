'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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
    <section className="relative overflow-hidden bg-surface-muted/30 border-b border-border pt-8 pb-12 sm:pt-12 sm:pb-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-14">
        
        {/* Main Hero Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Value Proposition & High-Converting CTAs */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left">
            
            {/* Clean Category Eyebrow */}
            <p className="text-label text-accent font-semibold tracking-widest uppercase">
              Bangladesh Apparel Sourcing Platform
            </p>

            {/* Main Headline */}
            <h1 className="font-sans font-bold text-3xl sm:text-4xl lg:text-[46px] text-foreground tracking-tight leading-[1.15]">
              Engineered Apparel Sourcing from{' '}
              <span className="text-accent">
                Bangladesh.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-body text-muted-foreground leading-relaxed max-w-xl">
              Direct factory access in Bangladesh with precision tech pack execution, AQL 1.5 quality control, and live buyer portal telemetry.
            </p>

            {/* Action CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button 
                  variant="gold" 
                  size="md" 
                  className="w-full sm:w-auto justify-center gap-2 font-semibold text-xs uppercase tracking-wider"
                >
                  <span>Submit Sourcing RFQ</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              
              <Link href="/buyer/login" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="md" 
                  className="w-full sm:w-auto justify-center gap-2 text-xs font-semibold"
                >
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>Buyer Portal Login</span>
                </Button>
              </Link>
            </div>

            {/* Key Trust Signals */}
            <div className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-muted-foreground border-t border-border">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                <span>Zero Subcontracting Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                <span>OEKO-TEX &amp; GOTS Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                <span>Itemized FOB Cost Sheets</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Multi-Panel Cinematic Showcase */}
          <div className="lg:col-span-6 space-y-3.5">
            
            {/* Interactive Showcase Tabs / Category Switchers */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border overflow-x-auto">
              {SHOWCASE_SLIDES.map((slide, idx) => {
                const isActive = idx === activeSlideIndex;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer select-none flex-1 text-center ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-subtle'
                        : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted'
                    }`}
                  >
                    {slide.label}
                  </button>
                );
              })}
            </div>

            {/* Main Visual Display Card */}
            <div className="relative rounded-xl overflow-hidden border border-border bg-surface shadow-subtle group">
              
              {/* Dynamic Image Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeSlide.id}
                    src={activeSlide.image}
                    alt={activeSlide.title}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.99 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  />
                </AnimatePresence>
                
                {/* Subtle scrim for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                {/* Floating Top-Right Stat Badge */}
                <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-md border border-border rounded-md px-2.5 py-1.5 shadow-subtle">
                  <p className="text-[10px] uppercase font-semibold text-accent tracking-wider">
                    {activeSlide.tag}
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {activeSlide.highlight}
                  </p>
                </div>

                {/* Floating Bottom Information Bar */}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-surface/95 backdrop-blur-md border border-border space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
                      {activeSlide.title}
                    </h3>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest hidden sm:inline-block">
                      Stage {activeSlideIndex + 1}/4
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {activeSlide.description}
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Sourcing SLA Banner */}
            <div className="p-3 rounded-lg bg-surface border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="text-muted-foreground">
                  Target sampling turnaround: <strong className="text-foreground font-semibold">7-10 days</strong> from tech pack sign-off
                </span>
              </div>
              <Link 
                href="/products" 
                className="text-accent font-semibold hover:underline flex items-center gap-1 transition-colors shrink-0 ml-2"
              >
                <span>Showroom</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

          </div>

        </div>

        {/* Bottom Trust & Metric Grid */}
        <div className="pt-6 sm:pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-6">
          {HERO_STATS.map((stat, i) => (
            <div key={i} className="space-y-0.5 text-left">
              <p className="text-2xl sm:text-3xl font-bold text-accent tracking-tight">
                {stat.value}
              </p>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                {stat.label}
              </h4>
              <p className="text-xs text-muted-foreground">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
