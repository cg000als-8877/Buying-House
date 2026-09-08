'use client';

import React from 'react';
import Link from 'next/link';
import { certificationsData } from '@/lib/data';
import { ShieldCheck, FileCheck, ArrowRight, Award } from 'lucide-react';

export function ComplianceSection() {
  return (
    <section className="py-24 bg-stone-900/60 border-t border-slate-800 text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Compromise Ethics &amp; Safety</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Fully Certified, Audited &amp; Globally Compliant
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              International fashion retailers trust us because our factory ecosystem is continually audited under stringent international social, environmental, and technical benchmarks.
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Downloadable audit certificates &amp; test reports for every batch</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <span>100% Non-toxic certified dyes compliant with EU REACH &amp; US CPSIA</span>
              </div>
            </div>

            <div>
              <Link
                href="/compliance"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300"
              >
                <span>Access Our Compliance Certificate Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificationsData.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{cert.logo}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {cert.validity}
                  </span>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-base text-white">{cert.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{cert.description}</p>
                </div>

                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                  Issuer: {cert.issuer}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
