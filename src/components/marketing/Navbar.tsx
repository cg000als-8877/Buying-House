'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, ArrowRight, PhoneCall, UserCheck, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const navLinks = [
  { name: 'Showroom', href: '/products' },
  { name: 'Capabilities', href: '/services' },
  { name: 'Compliance', href: '/compliance' },
  { name: 'Sustainability', href: '/sustainability' },
  { name: 'Buyer Portal', href: '/buyer' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 20);
  });

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
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="font-bold text-slate-950 text-xl tracking-tight">BH</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg md:text-xl tracking-wide text-white group-hover:text-amber-300 transition-colors">
                ATELIER &amp; CO.
              </span>
              <span className="text-[10px] tracking-widest uppercase text-emerald-400 font-semibold">
                Global Apparel Sourcing
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-medium transition-colors hover:text-amber-400 relative py-1 uppercase tracking-wider ${
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

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/admin"
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </Link>

            <Link
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors px-3 py-2 rounded-full border border-slate-700 bg-slate-900/60"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hotline</span>
            </Link>

            <Link href="/rfq">
              <Button variant="gold" size="sm">
                <span>Submit Sourcing RFQ</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="xl:hidden p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-200 hover:text-amber-400 py-1 uppercase tracking-wider"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-amber-400 py-1 uppercase tracking-wider"
            >
              Admin Dashboard
            </Link>
          </div>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <Link href="/rfq" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="gold" size="md" className="w-full">
                Submit Sourcing RFQ
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
