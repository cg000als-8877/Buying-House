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
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-400 font-display">
              Zero-Compromise Ethics &amp; Safety
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight">
              Fully Certified, Audited &amp;{' '}
              <span className="text-emerald-400 font-extrabold">
                Globally Compliant
              </span>
            </h2>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-sans">
              International fashion retailers trust us because our factory ecosystem is continually audited under stringent international social, environmental, and technical benchmarks.
            </p>

            <div className="space-y-3.5 text-sm text-slate-300 font-sans">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Downloadable audit certificates &amp; test reports for every batch</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <span>100% Non-toxic certified dyes compliant with EU REACH &amp; US CPSIA</span>
              </div>
            </div>

            <div>
              <Link
                href="/compliance"
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 font-display"
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
                className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3.5 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{cert.logo}</span>
                  <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700 font-display">
                    {cert.validity}
                  </span>
                </div>

                <div>
                  <h4 className="font-display font-bold text-lg text-white">{cert.name}</h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1.5 line-clamp-2 font-sans">{cert.description}</p>
                </div>

                <div className="text-xs text-slate-400 pt-2.5 border-t border-slate-900">
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
