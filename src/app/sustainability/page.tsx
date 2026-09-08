import React from 'react';
import Link from 'next/link';
import { Sparkles, Leaf, Droplets, Sun, Recycle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            <Leaf className="w-3.5 h-3.5" />
            <span>Circular &amp; Regenerative Fashion</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Sustainable Apparel for the Future
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Helping forward-thinking fashion houses minimize their environmental footprint through organic fibres, closed-loop water treatment, solar-powered production, and zero-waste cutting.
          </p>
        </div>

        {/* 4 Green Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">GOTS Organic Cotton</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Grown without synthetic pesticides or GM seeds, utilizing 91% less water than conventional cotton farming.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">Effluent Treatment (ETP)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Biological water treatment plants recycle up to 85% of industrial wash water back into factory cooling and wash cycles.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">Rooftop Solar Energy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Partner facilities generate over 4.2 MW of clean solar energy directly on-site, slashing Scope 1 &amp; 2 carbon emissions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
              <Recycle className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">GRS Recycled Poly &amp; Nylon</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Certified post-consumer recycled plastic bottles (rPET) turned into high-performance activewear and puffer jacket fabrics.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl font-serif font-bold text-white">
              Launch Your Next Sustainable Collection
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              We provide digital traceability tags and certification documentation with every eco-order.
            </p>
          </div>
          <Link
            href="/rfq"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shrink-0 shadow-lg"
          >
            <span>Request Eco-Fabric Swatches</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
