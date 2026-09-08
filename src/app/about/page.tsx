import React from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, Award, Users, Factory, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Hero */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Heritage &amp; Global Footprint</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Bridging High-Fashion Design with World-Class Manufacturing
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Founded with a vision to eliminate supply chain opacity, Atelier &amp; Co. has grown into a trusted global garment sourcing partner for over 120+ international apparel brands, department stores, and independent designers across Europe, North America, and Australia.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Direct Sourcing Without the Bureaucracy
            </h2>
            <p>
              Traditional garment manufacturing often suffers from miscommunication, hidden markups, and delayed sample iterations. We built Atelier &amp; Co. to function as a seamless in-house extension of your design studio.
            </p>
            <p>
              With our central merchandising hub in Dhaka and liaison showrooms in London and New York, we provide direct access to verified spinning mills, automated sewing units, and certified wash plants—delivering competitive FOB/DDP pricing without sacrificing quality or ethical standards.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-2xl font-serif font-bold text-amber-400">15+</span>
                <p className="text-xs text-slate-400 mt-1">Years of Export Excellence</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-2xl font-serif font-bold text-emerald-400">30M+</span>
                <p className="text-xs text-slate-400 mt-1">Garments Shipped Annually</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80"
              alt="Fashion design and textile workshop"
              className="w-full h-[440px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10">
              <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Quality Assurance First</p>
              <p className="text-sm text-white font-medium">Independent QC teams stationed at every production line.</p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <Award className="w-8 h-8 text-amber-400" />
            <h3 className="font-serif font-bold text-lg text-white">Uncompromising Quality</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every production batch undergoes 4-stage inline inspection, spectrophotometer color matching, and dimensional stability tests.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <Users className="w-8 h-8 text-emerald-400" />
            <h3 className="font-serif font-bold text-lg text-white">Ethical Transparency</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We uphold fair living wages, worker safety, and environmental stewardship as non-negotiable foundations of every partnership.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <Globe className="w-8 h-8 text-cyan-400" />
            <h3 className="font-serif font-bold text-lg text-white">Global Agility</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              From 300-piece boutique capsules to 500,000-piece seasonal rollouts, our supply chain flexes to match your growth.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Meet Our Sourcing Specialists
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Schedule a virtual showroom tour or request our master fabric swatch box delivered to your design office.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-lg"
          >
            <span>Schedule a Consultation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
