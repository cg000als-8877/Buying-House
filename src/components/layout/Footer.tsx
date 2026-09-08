import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Globe, ShieldCheck, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-serif font-black text-xl">
                BH
              </div>
              <span className="font-serif font-bold text-xl text-white tracking-wide">
                ATELIER &amp; CO.
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Premier apparel buying house, connecting international fashion brands and retailers with certified, high-standard garment manufacturing ecosystems.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                OEKO-TEX &amp; GOTS Certified Hub
              </span>
            </div>
          </div>

          {/* Sourcing Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Apparel Lines</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products?cat=Knitwear" className="hover:text-amber-400 transition-colors">Premium Knitwear</Link></li>
              <li><Link href="/products?cat=Woven" className="hover:text-amber-400 transition-colors">Woven Shirts &amp; Pants</Link></li>
              <li><Link href="/products?cat=Denim" className="hover:text-amber-400 transition-colors">Eco-Wash Denim</Link></li>
              <li><Link href="/products?cat=Activewear" className="hover:text-amber-400 transition-colors">Performance Activewear</Link></li>
              <li><Link href="/products?cat=Outerwear" className="hover:text-amber-400 transition-colors">Down &amp; Tech Outerwear</Link></li>
              <li><Link href="/products?cat=Sustainable" className="hover:text-amber-400 transition-colors">Sustainable &amp; Recycled</Link></li>
            </ul>
          </div>

          {/* Capabilities */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services#sourcing" className="hover:text-amber-400 transition-colors">Fabric &amp; Trim Sourcing</Link></li>
              <li><Link href="/services#techpack" className="hover:text-amber-400 transition-colors">3D CAD &amp; Tech-Packs</Link></li>
              <li><Link href="/services#quality" className="hover:text-amber-400 transition-colors">AQL 1.5 / 2.5 Inspection</Link></li>
              <li><Link href="/compliance" className="hover:text-amber-400 transition-colors">Factory Audit Vault</Link></li>
              <li><Link href="/services#logistics" className="hover:text-amber-400 transition-colors">DDP/FOB Global Shipping</Link></li>
              <li><Link href="/rfq" className="hover:text-amber-400 transition-colors">Request Sample Tech-Pack</Link></li>
            </ul>
          </div>

          {/* Global Operations & Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Global Offices</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Headquarters: Gulshan-2, Dhaka 1212</span>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Liaison: Frankfurt, London &amp; New York</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:inquiry@atelierbuyinghouse.com" className="hover:text-white transition-colors">
                  inquiry@atelierbuyinghouse.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+880 (2) 987-6543 / +1 (800) 555-TEXT</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Atelier &amp; Co. Global Sourcing Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/compliance" className="hover:text-white transition-colors">Code of Conduct</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Trade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
