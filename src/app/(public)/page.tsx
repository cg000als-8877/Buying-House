import type { Metadata } from 'next';
import {
  HeroSection,
  SectionHeading,
  ServiceGrid,
  ProductCategoryGrid,
  ProcessTimeline,
  PortalCTA,
  QualityPreview,
  CompliancePreview,
  CTASection,
} from '@/components/public';

export const metadata: Metadata = {
  title: 'XYZ Buying House | Bangladesh Apparel Sourcing & Manufacturing Management',
  description:
    'Premier Bangladesh apparel buying house managing vendor sourcing, proto sampling, AQL quality control, ethical compliance, and digital order telemetry for global fashion brands.',
  openGraph: {
    title: 'XYZ Buying House | Apparel Sourcing Platform',
    description:
      'Reliable apparel sourcing, ethical manufacturing management, and order telemetry from Bangladesh.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Trust & Capability Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-xl border border-border bg-surface grid grid-cols-1 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="space-y-1 sm:border-r sm:border-border sm:pr-4">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
              01. Technical Sourcing
            </p>
            <h4 className="font-semibold text-sm text-foreground">Direct Sourcing Feasibility</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Transparent cost breakdowns and local/imported mill sourcing analysis.
            </p>
          </div>

          <div className="space-y-1 sm:border-r sm:border-border sm:pr-4">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
              02. AQL Governance
            </p>
            <h4 className="font-semibold text-sm text-foreground">Quality Control Framework</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Structured multi-stage inspection protocols from raw fabric to pre-shipment FRI.
            </p>
          </div>

          <div className="space-y-1 sm:border-r sm:border-border sm:pr-4">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
              03. Digital Telemetry
            </p>
            <h4 className="font-semibold text-sm text-foreground">Buyer Portal Architecture</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Designed for live order tracking, sample approvals, and digital document access.
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-mono font-semibold uppercase tracking-wider text-accent">
              04. Social Compliance
            </p>
            <h4 className="font-semibold text-sm text-foreground">Ethical Supply Chain</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Strict compliance evaluation, worker safety standards, and zero unauthorized subcontracting.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Services Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          badge="End-to-End Solutions"
          title="Complete Garment Sourcing & Production Services"
          description="From initial tech pack interpretation and proto sampling to bulk line management, quality audits, and export logistics."
        />
        <ServiceGrid limit={6} />
      </section>

      {/* 4. Product Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          badge="Manufacturing Scope"
          title="Apparel Categories & Technical Capabilities"
          description="Specialized production facilities covering circular knits, woven bottoms, casual shirting, washed denim, and outerwear."
        />
        <ProductCategoryGrid limit={3} />
      </section>

      {/* 5. Production Telemetry & Buyer Portal Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PortalCTA />
      </section>

      {/* 6. Quality Assurance Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          badge="Quality Assurance"
          title="Multi-Stage AQL Quality Governance"
          description="Independent quality control protocols stationed at factory lines to inspect raw materials, inline sewing assembly, and final packaged cartons."
        />
        <QualityPreview />
      </section>

      {/* 7. Process / How We Work */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          badge="Operational Methodology"
          title="From Tech Pack to Port Dispatch"
          description="A structured, milestone-driven critical path guaranteeing on-time ex-factory schedules and specification adherence."
        />
        <ProcessTimeline />
      </section>

      {/* 8. Compliance & Sustainability Previews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          badge="Governance & Ethics"
          title="Ethical Compliance & Responsible Sourcing"
          description="Audited labor standards, building structural safety, and eco-certified material options for forward-thinking apparel brands."
        />
        <CompliancePreview />
      </section>

      {/* 9. Final Conversion CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          badge="Initiate Sourcing Dialogue"
          title="Partner with a reliable, transparent buying house in Bangladesh."
          description="Submit your tech pack or collection concept today. Our technical merchandising team will provide feasibility analysis, price estimations, and sampling schedules."
          primaryCtaText="Submit Sourcing RFQ"
          primaryCtaHref="/contact"
          secondaryCtaText="Explore All Services"
          secondaryCtaHref="/services"
        />
      </section>
    </div>
  );
}
