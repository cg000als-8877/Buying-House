import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import { FOOTER_SECTIONS } from '@/data/public/navigation';

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background-secondary text-foreground text-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Mission Overview */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 font-sans font-bold text-base text-foreground">
              <span className="w-7 h-7 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-wider">
                XYZ
              </span>
              <span>XYZ Buying House</span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-sm">
              An apparel sourcing and manufacturing management platform operating in Bangladesh. Connecting international fashion brands, retailers, and importers with compliant, high-efficiency manufacturing facilities.
            </p>
            <div className="space-y-2 pt-2 text-xs text-foreground-secondary">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="font-mono text-[11px]">[Headquarters Address — Client Input Required]</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="font-mono text-[11px]">[Business Email — Client Input Required]</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="font-mono text-[11px]">[Phone Number — Client Input Required]</span>
              </div>
            </div>
          </div>

          {/* Sourcing Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Services
            </h4>
            <ul className="space-y-2">
              {FOOTER_SECTIONS.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Apparel Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Products
            </h4>
            <ul className="space-y-2">
              {FOOTER_SECTIONS.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Governance & Buyer Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Client Gateway
            </h4>
            <div className="p-3 rounded-lg border border-border bg-surface space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Buyer Portal</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Access order telemetry, daily inline QC reports, and shipping documents.
              </p>
              <Link
                href="/buyer/login"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline pt-1"
              >
                Sign In to Portal <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <ul className="space-y-1.5 pt-2">
              {FOOTER_SECTIONS.governance.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-[11px]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground text-[11px]">
          <p>© {currentYear} XYZ Buying House Platform. All rights reserved.</p>
          <p className="text-center sm:text-right">
            International B2B Garment Manufacturing & Buying House Management
          </p>
        </div>
      </div>
    </footer>
  );
}
