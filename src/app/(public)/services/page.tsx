import type { Metadata } from 'next';
import Link from 'next/link';
import { CTASection } from '@/components/public';
import { SERVICES_DATA } from '@/data/public/services';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, FileCheck, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Services | XYZ Buying House: Apparel Sourcing, Sampling & Production',
  description:
    'Comprehensive garment sourcing and buying house services in Bangladesh: vendor sourcing, tech pack development, Proto sampling, inline AQL quality control, compliance oversight, and export logistics.',
};

export default function ServicesPage() {
  return (
    <div className="space-y-16 lg:space-y-24 py-12 lg:py-16">
      {/* 1. Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-500 font-display">
          Full-Spectrum Sourcing Solutions
        </p>
        <h1 className="font-display font-bold text-foreground text-h1 tracking-tight max-w-3xl mx-auto">
          End-to-End Apparel Manufacturing Management.
        </h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          From initial costing and prototype development to on-site AQL quality audits and port export clearance.
        </p>
      </section>

      {/* 2. Detailed Service Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {SERVICES_DATA.map((service, idx) => (
          <div
            key={service.id}
            id={service.id}
            className="p-6 sm:p-10 rounded-2xl border border-border bg-surface shadow-subtle grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-24"
          >
            {/* Service Summary */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-md bg-secondary text-foreground font-mono font-bold text-xs flex items-center justify-center border border-border">
                  0{idx + 1}
                </span>
                <Badge variant="neutral" size="sm">
                  {service.id.toUpperCase()}
                </Badge>
              </div>

              <h2 className="font-display font-bold text-foreground text-h3 tracking-tight">
                {service.title}
              </h2>

              <p className="text-sm text-foreground-secondary leading-relaxed">
                {service.fullDescription}
              </p>

              <div className="pt-2">
                <Link href="/contact">
                  <Button variant="primary" size="sm" className="gap-1.5">
                    Inquire for this Service <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Capabilities & Deliverables Breakdown */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface-muted/40 p-6 rounded-xl border border-border/80">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  Core Capabilities
                </h4>
                <ul className="space-y-2 text-xs text-foreground-secondary">
                  {service.capabilities.map((cap, cIdx) => (
                    <li key={cIdx} className="flex items-start">
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-success" />
                  Standard Deliverables
                </h4>
                <ul className="space-y-2 text-xs text-foreground-secondary">
                  {service.deliverables.map((deliv, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                      <span>{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="Require customized sourcing coordination for your upcoming collection?"
          description="Send us your design specs, order quantities, and target ex-factory dates for an itemized review."
        />
      </section>
    </div>
  );
}
