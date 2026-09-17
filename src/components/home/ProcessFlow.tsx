'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Cpu, Palette, Scissors, ShieldAlert, Ship } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Tech-Pack & Consultation',
    desc: 'Share your sketches, moodboards, or tech-packs. We analyze construction, BOM costings, and target price points within 24 hours.',
    icon: <FileText className="w-5 h-5 text-amber-400" />
  },
  {
    step: '02',
    title: 'Rapid Prototyping & Lab Dips',
    desc: 'We develop initial proto-samples and 100% accurate Pantone/spectral lab-dips delivered directly to your studio in 5-7 days.',
    icon: <Cpu className="w-5 h-5 text-emerald-400" />
  },
  {
    step: '03',
    title: 'Pre-Production Approval',
    desc: 'Gold seal sample approval covering graded fit, stitch tension, custom trims, barcodes, care labels, and packaging mockups.',
    icon: <Palette className="w-5 h-5 text-amber-400" />
  },
  {
    step: '04',
    title: 'Bulk Automated Production',
    desc: 'Automated CAD cutting, precision sewing assembly, and specialized garment wash treatments under strictly controlled conditions.',
    icon: <Scissors className="w-5 h-5 text-emerald-400" />
  },
  {
    step: '05',
    title: 'AQL 1.5 Quality Inspection',
    desc: '4-stage inline inspection, metal detection, needle detection, pull tests, and final random pre-shipment audit reports.',
    icon: <ShieldAlert className="w-5 h-5 text-amber-400" />
  },
  {
    step: '06',
    title: 'Customs Clearance & Global Delivery',
    desc: 'Complete export documentation, customs duty management, air/sea freight booking, and delivery directly to your fulfillment hub.',
    icon: <Ship className="w-5 h-5 text-emerald-400" />
  }
];

export function ProcessFlow() {
  return (
    <section className="py-24 bg-slate-950 text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-widest">
            Streamlined Sourcing Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            How We Bring Your{' '}
            <span className="text-emerald-400 font-bold">
              Apparel Line
            </span>{' '}
            to Life
          </h2>
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed">
            Transparent milestones, rigorous quality checks, and real-time updates from initial sketch to final delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-7 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 relative flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="font-bold text-3xl text-slate-700 group-hover:text-amber-400/60 transition-colors">
                    {item.step}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <h3 className="font-bold text-lg sm:text-xl text-white group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
