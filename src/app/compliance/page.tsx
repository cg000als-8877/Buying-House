import React from 'react';
import Link from 'next/link';
import { certificationsData } from '@/lib/data';
import { ShieldCheck, FileCheck, Download, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ethical Standards &amp; Audit Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            International Compliance &amp; Certificate Vault
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            We operate with complete transparency. Every factory in our manufacturing network adheres to strict global labor safety, environmental management, and zero chemical hazard standards.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">Social &amp; Labor Ethics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict enforcement of fair living wages, maximum working hours, safe working environments, equal opportunities, and zero child/forced labor.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">Chemical &amp; Ecological Safety</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              100% compliant with EU REACH, US CPSIA, and ZDHC (Zero Discharge of Hazardous Chemicals). Only non-toxic, eco-certified dyes and finishes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-white">Continuous Third-Party Audits</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quarterly unannounced audits performed by certified international inspection bodies (SGS, Bureau Veritas, Intertek).
            </p>
          </div>
        </div>

        {/* Certificate Cards */}
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-white">
            Active Certifications &amp; Accreditations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificationsData.map((cert) => (
              <div
                key={cert.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{cert.logo}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      {cert.validity}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">{cert.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {cert.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 truncate max-w-[160px]">{cert.issuer}</span>
                  <Link
                    href="/rfq"
                    className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300"
                  >
                    <span>Request Copy</span>
                    <Download className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
