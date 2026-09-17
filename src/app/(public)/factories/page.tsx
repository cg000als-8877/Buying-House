import type { Metadata } from 'next';
import { SectionHeading, FactoryGrid, CTASection } from '@/components/public';
import { Alert } from '@/components/ui/Alert';

export const metadata: Metadata = {
  title: 'Factory Network & Manufacturing Hubs | XYZ Buying House',
  description:
    'Overview of XYZ Buying House garment manufacturing network framework in Bangladesh. Factory profiles, capabilities, certifications, and capacity allocations published upon verification.',
};

export default function FactoriesPage() {
  return (
    <div className="space-y-16 lg:space-y-24 py-12 lg:py-16">
      {/* 1. Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-500 font-sans">
          Manufacturing Network
        </p>
        <h1 className="font-sans font-bold text-foreground text-h1 tracking-tight max-w-3xl mx-auto">
          Verified Factory Network & Production Allocation.
        </h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Factory profiles, capabilities, certifications and production information will be published following verification.
        </p>
      </section>

      {/* 2. Verification Protocol Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Alert variant="info" title="Factory Information Governance Notice">
          In adherence to commercial confidentiality and client protection standards, detailed factory legal entity names, addresses, audit reports, and machinery profiles are provided directly to authorized buyers following tech pack evaluation and mutual NDA.
        </Alert>
      </section>

      {/* 3. Factory Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          badge="Manufacturing Categories"
          title="Manufacturing Capabilities by Product Category"
          description="Facility allocations are configured based on machinery setup, stitch density requirements, and technical product scope."
        />
        <FactoryGrid />
      </section>

      {/* 4. Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="Schedule a factory audit or request line allocation."
          description="Contact our operations directors for factory audit dossiers, technical machinery lists, or in-person factory visit scheduling."
        />
      </section>
    </div>
  );
}
