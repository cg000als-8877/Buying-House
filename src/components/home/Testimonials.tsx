'use client';

import React from 'react';
import { clientTestimonials } from '@/lib/data';
import { Star, Quote } from 'lucide-react';

export function Testimonials() {
  return (
    <section className="py-24 bg-stone-950 text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
            Trusted by Global Fashion Houses
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            What International{' '}
            <span className="text-amber-400 font-bold">
              Brand Directors
            </span>{' '}
            Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {clientTestimonials.map((item) => (
            <div
              key={item.id}
              className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6 relative"
            >
              <Quote className="w-8 h-8 text-amber-500/20 absolute top-6 right-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                <img
                  src={item.avatar}
                  alt={item.clientName}
                  className="w-11 h-11 rounded-full object-cover border border-amber-500/30"
                />
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white font-sans">{item.clientName}</h4>
                  <p className="text-xs sm:text-sm text-slate-400 font-sans">{item.role}</p>
                  <p className="text-xs text-emerald-400 font-semibold font-sans">{item.brand}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
