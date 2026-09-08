'use client';

import React from 'react';
import Link from 'next/link';
import { servicesData } from '@/lib/data';
import { Layers, Ruler, Factory, ShieldCheck, Truck, Sparkles, ArrowRight } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Layers: <Layers className="w-6 h-6 text-amber-400" />,
  Ruler: <Ruler className="w-6 h-6 text-emerald-400" />,
  Factory: <Factory className="w-6 h-6 text-amber-400" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
  Truck: <Truck className="w-6 h-6 text-amber-400" />,
  Sparkles: <Sparkles className="w-6 h-6 text-emerald-400" />,
};

export function ServicesOverview() {
  return (
    <section className="py-24 bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="text-amber-400 text-xs font-bold uppercase tracking-widest">
            End-to-End Supply Chain Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
            Integrated Solutions from Fibre to Finished Hanger
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Eliminate sourcing friction with our dedicated merchandising units, in-house QA inspectors, master pattern makers, and worldwide logistics network.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service) => (
            <div
              key={service.id}
              className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:border-amber-500/50 transition-all">
                  {iconMap[service.icon] || <Sparkles className="w-6 h-6 text-amber-400" />}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                    {service.metrics}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {service.fullDesc}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between">
                <Link
                  href={`/services#${service.id}`}
                  className="text-xs font-semibold text-slate-300 group-hover:text-amber-400 flex items-center gap-1.5 transition-colors"
                >
                  <span>Explore Process Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
