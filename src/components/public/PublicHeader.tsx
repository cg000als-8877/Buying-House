'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShieldCheck, ArrowRight } from 'lucide-react';
import { MAIN_NAV_ITEMS } from '@/data/public/navigation';
import { Button } from '@/components/ui/Button';
import { MobileNavigation } from './MobileNavigation';

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const desktopLinks = MAIN_NAV_ITEMS.filter((item) =>
    ['Home', 'About', 'Services', 'Products', 'Quality', 'Compliance', 'Factories', 'Contact'].includes(item.name)
  );

  return (
    <>
      <header className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo / Company Title */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-sans font-bold text-base sm:text-lg text-foreground tracking-tight select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            <span className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-wider shadow-subtle">
              XYZ
            </span>
            <div className="flex flex-col">
              <span className="leading-tight text-sm sm:text-base font-bold text-foreground">XYZ Buying House</span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                Apparel Sourcing Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-medium">
            {desktopLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-secondary text-foreground font-semibold shadow-subtle'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link href="/buyer/login">
              <Button variant="outline" size="sm" className="gap-1.5 font-semibold text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                Buyer Portal
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="gold" size="sm" className="gap-1.5 text-xs font-semibold uppercase tracking-wider">
                Submit RFQ
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/buyer/login" className="sm:hidden">
              <Button variant="outline" size="xs">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open mobile navigation menu"
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Accessible Mobile Navigation Drawer */}
      <MobileNavigation isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
