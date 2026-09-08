'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, ShieldCheck, PhoneCall } from 'lucide-react';

const navLinks = [
  { name: 'Showroom', href: '/products' },
  { name: 'Capabilities', href: '/services' },
  { name: 'Compliance & Audits', href: '/compliance' },
  { name: 'Sustainability', href: '/sustainability' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/90 backdrop-blur-md shadow-lg border-b border-white/10 py-3.5'
          : 'bg-gradient-to-b from-slate-950/80 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="font-serif font-black text-slate-950 text-xl tracking-tighter">BH</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg md:text-xl tracking-wide text-white group-hover:text-amber-300 transition-colors">
                ATELIER &amp; CO.
              </span>
              <span className="text-[10px] tracking-widest uppercase text-emerald-400 font-medium">
                Global Apparel Sourcing
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-amber-400 relative py-1 ${
                    isActive ? 'text-amber-400 font-semibold' : 'text-slate-200'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors px-3 py-2 rounded-full border border-slate-700 hover:border-emerald-500/40 bg-slate-900/60"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Hotline</span>
            </Link>

            <Link
              href="/rfq"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:scale-105"
            >
              <span>Request Quote / Samples</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="lg:hidden p-2 text-slate-300 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-200 hover:text-amber-400 py-1"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <Link
              href="/rfq"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors"
            >
              Request Quote / Samples
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
