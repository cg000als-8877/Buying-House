'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { productsData } from '@/lib/data';
import { ProductCategory, Product } from '@/types';
import { Search, Filter, ArrowRight, ShieldCheck, Check, Sparkles, X } from 'lucide-react';

const categories: ('All' | ProductCategory)[] = ['All', 'Knitwear', 'Woven', 'Denim', 'Activewear', 'Outerwear'];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  const filtered = productsData.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fabric.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Showroom &amp; Technical Lookbook</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Apparel Sourcing &amp; Fabric Catalog
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Browse our core manufactured product lines. Every garment can be customized to your precise tech pack, fabric composition, wash treatment, and private branding specifications.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search fabrics, styles, GSM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col"
            >
              {/* Product Photo */}
              <div className="relative h-72 w-full overflow-hidden bg-slate-950">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                  {product.category}
                </div>
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-semibold text-amber-300 border border-amber-500/30">
                  MOQ: {product.moq}
                </div>
              </div>

              {/* Information */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">Fabric</span>
                    <span className="text-slate-200 font-medium truncate block">{product.fabric}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Weight</span>
                    <span className="text-slate-200 font-medium block">{product.gsm}</span>
                  </div>
                </div>

                {/* Certifications badges */}
                <div className="flex flex-wrap gap-1.5">
                  {product.certifications.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setActiveModalProduct(product)}
                    className="text-xs font-semibold text-slate-300 hover:text-white underline underline-offset-4"
                  >
                    Tech Specs
                  </button>

                  <Link
                    href={`/rfq?item=${encodeURIComponent(product.name)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all"
                  >
                    <span>Request Sample</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Quick Tech Spec Modal */}
        {activeModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative shadow-2xl">
              <button
                onClick={() => setActiveModalProduct(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <img
                  src={activeModalProduct.image}
                  alt={activeModalProduct.name}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    {activeModalProduct.category}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white">
                    {activeModalProduct.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Fabric Composition:</span>
                  <span className="text-white font-semibold">{activeModalProduct.fabric}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Weight / Density:</span>
                  <span className="text-white font-semibold">{activeModalProduct.gsm}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Standard Production Lead Time:</span>
                  <span className="text-white font-semibold">{activeModalProduct.leadTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Minimum Order Quantity (MOQ):</span>
                  <span className="text-white font-semibold">{activeModalProduct.moq}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Technical Highlights:</span>
                <div className="grid grid-cols-2 gap-2">
                  {activeModalProduct.features.map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Link
                  href={`/rfq?item=${encodeURIComponent(activeModalProduct.name)}`}
                  onClick={() => setActiveModalProduct(null)}
                  className="w-full text-center py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors"
                >
                  Request Sample &amp; Tech Pack
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
