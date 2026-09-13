import type { Metadata } from 'next';
import { CapabilitySection, CTASection, PortalCTA } from '@/components/public';

export const metadata: Metadata = {
  title: 'Sourcing & Production Capabilities | XYZ Buying House',
  description:
    'Explore XYZ Buying House technical capabilities in Bangladesh: CAD pattern grading, direct mill yarn sourcing, critical path telemetry, and certified on-site AQL inspection.',
};

export default function CapabilitiesPage() {
  return (
    <div className="space-y-16 lg:space-y-24 py-12 lg:py-16">
      {/* 1. Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-500 font-display">
          Technical Infrastructure
        </p>
        <h1 className="font-display font-bold text-foreground text-h1 tracking-tight max-w-3xl mx-auto">
          Operational & Technical Sourcing Capabilities.
        </h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          How our on-ground merchandising, quality control, and supply chain telemetry teams manage complex garment manufacturing in Bangladesh.
        </p>
      </section>

      {/* 2. Capability Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <CapabilitySection />
      </section>

      {/* 3. Telemetry & Buyer Portal Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PortalCTA />
      </section>

      {/* 4. Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="Leverage our technical apparel sourcing infrastructure."
          description="Send us your production requirements for a comprehensive review of mill availability, line allocation, and target schedules."
        />
      </section>
    </div>
  );
}
