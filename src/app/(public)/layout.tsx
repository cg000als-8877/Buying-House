'use client';

import React from 'react';
import Link from 'next/link';
import { SmoothScroll } from '@/components/providers/SmoothScroll';

const publicNav = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Products', href: '/products' },
  { name: 'Capabilities', href: '/capabilities' },
  { name: 'Quality', href: '/quality' },
  { name: 'Compliance', href: '/compliance' },
  { name: 'Sustainability', href: '/sustainability' },
  { name: 'Factories', href: '/factories' },
  { name: 'Insights', href: '/insights' },
  { name: 'Contact', href: '/contact' },
  { name: 'Buyer Login', href: '/buyer/login' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="font-bold text-lg text-foreground tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              XYZ
            </span>
            <span>XYZ Buying House</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-xs">
            {publicNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="min-h-[70vh]">{children}</main>
      <footer className="border-t border-border bg-surface py-8 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} XYZ Buying House Platform. Foundation Shell.</p>
        </div>
      </footer>
    </SmoothScroll>
  );
}
