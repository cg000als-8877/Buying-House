'use client';

import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Annual Export Capacity', value: '30M+', sub: 'Pieces produced per year' },
  { label: 'Global Retailer Partners', value: '120+', sub: 'Across US, EU & APAC' },
  { label: 'Audited Partner Mills', value: '45+', sub: 'GOTS, BSCI & SEDEX Verified' },
  { label: 'Sample Turnaround', value: '5-7', sub: 'Days from Tech Pack to Prototypes' },
  { label: 'Quality Assurance Score', value: '99.4%', sub: 'AQL 1.5 strict inspection rate' },
];

export function StatsBanner() {
  return (
    <section className="bg-slate-900 border-y border-slate-800/80 py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="space-y-1 relative"
            >
              <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                <span className="text-amber-400">{stat.value}</span>
              </div>
              <div className="text-sm sm:text-base font-semibold text-slate-100 uppercase tracking-wide pt-1 font-display">
                {stat.label}
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-sans">
                {stat.sub}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
