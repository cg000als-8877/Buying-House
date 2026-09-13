'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { productsData } from '@/lib/data';
import { ProductCategory } from '@/types';
import { ArrowRight, Layers, Clock, ShieldCheck, Check } from 'lucide-react';

const categories: ('All' | ProductCategory)[] = ['All', 'Knitwear', 'Woven', 'Denim', 'Activewear', 'Outerwear'];

export function ProductShowcase() {
  const [activeCategory, setActiveCategory] = useState<'All' | ProductCategory>('All');

  const filteredProducts = activeCategory === 'All'
    ? productsData
    : productsData.filter((p) => p.category === activeCategory);

  return (
    <section className="py-24 bg-stone-950 text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2 font-display">
              Virtual Showroom &amp; Apparel Lines
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white">
              Manufactured with{' '}
              <span className="text-amber-400 font-extrabold">
                Master-Level Precision
              </span>
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-amber-400 hover:text-amber-300 transition-colors group font-display"
          >
            <span>View Full 2026 Lookbook &amp; Spec Sheets</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wider transition-all whitespace-nowrap font-display ${
                activeCategory === cat
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={product.id}
                className="group rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative h-72 w-full overflow-hidden bg-slate-950">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm px-3.5 py-1 rounded-full text-xs font-semibold text-emerald-400 border border-emerald-500/30 font-display">
                    {product.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm px-3.5 py-1 rounded-full text-xs font-semibold text-amber-300 border border-amber-500/30 font-display">
                    MOQ: {product.moq}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-xl text-white group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-2 font-sans">
                      {product.description}
                    </p>
                  </div>

                  {/* Spec highlights */}
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block text-xs">Fabrication</span>
                      <span className="text-slate-200 font-medium truncate block">{product.fabric}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Density / Weight</span>
                      <span className="text-slate-200 font-medium block">{product.gsm}</span>
                    </div>
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {product.features.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Action Link */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Lead Time: {product.leadTime}
                    </span>
                    <Link
                      href={`/rfq?item=${encodeURIComponent(product.name)}`}
                      className="text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <span>Inquire Sample</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
