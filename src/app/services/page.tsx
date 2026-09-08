import React from 'react';
import Link from 'next/link';
import { servicesData } from '@/lib/data';
import { ArrowRight, ShieldCheck, CheckCircle2, Factory, Cpu, Ruler, Sparkles } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manufacturing Capabilities &amp; Infrastructure</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Full-Cycle Sourcing &amp; Apparel Engineering
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            From preliminary yarn selection and 3D CAD virtual fitting to automated cutting lines and strict AQL 1.5 final inspections, we manage every layer of your garment production.
          </p>
        </div>

        {/* Detailed Service Sections */}
        <div className="space-y-16">
          {servicesData.map((service, index) => (
            <div
              key={service.id}
              id={service.id}
              className={`p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800/40">
                  {service.metrics}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {service.title}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {service.fullDesc}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-time digital production milestones &amp; daily tracking reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>In-house testing laboratories for color fastness, shrinkage, and pull strength</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/rfq"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 group"
                  >
                    <span>Request Service Consultation</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-950/80 rounded-2xl p-6 border border-slate-800 space-y-4 text-xs">
                <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] text-amber-400">
                  Technical Specifications
                </h4>
                <div className="space-y-2.5 text-slate-300">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Sample Turnaround:</span>
                    <span className="text-white font-medium">5-7 Days</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Bulk Production Lead Time:</span>
                    <span className="text-white font-medium">30-45 Days</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Inspection Standard:</span>
                    <span className="text-white font-medium">AQL 1.5 Major / 2.5 Minor</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Shipping Incoterms:</span>
                    <span className="text-white font-medium">FOB, CIF, DDP Available</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-slate-900 border border-slate-800 rounded-3xl p-10 space-y-6">
          <h3 className="text-2xl font-serif font-bold text-white">
            Have Custom Fabrication or Sourcing Requirements?
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Our textile technologists can develop custom weaves, knits, jacquards, and proprietary garment dyes tailored to your brand identity.
          </p>
          <Link
            href="/rfq"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-lg"
          >
            <span>Submit Custom Project Specs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
