import type { Metadata } from 'next';
import { SectionHeading, CTASection } from '@/components/public';
import { SUSTAINABILITY_GOALS } from '@/data/public/sustainability';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Leaf, Check } from 'lucide-react';

import { Alert } from '@/components/ui/Alert';

export const metadata: Metadata = {
  title: 'Responsible Sourcing & Sustainability Framework | XYZ Buying House',
  description:
    'Responsible apparel sourcing framework in Bangladesh: organic and recycled material options, reduced-water laundering pathways, energy conservation, and packaging circularity.',
};

export default function SustainabilityPage() {
  return (
    <div className="space-y-16 lg:space-y-24 py-12 lg:py-16">
      {/* 1. Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-500 font-sans">
          Responsible Sourcing Framework
        </p>
        <h1 className="font-sans font-bold text-foreground text-h1 tracking-tight max-w-3xl mx-auto">
          Responsible Sourcing & Low-Impact Manufacturing Framework.
        </h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          We are preparing this section for verified information about materials, production processes and environmental initiatives across our supply network.
        </p>
      </section>

      {/* 2. Structured Information Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Alert variant="info" title="Responsible Sourcing Governance">
          The initiatives below represent our proposed operational roadmap and technical capability scope for eco-conscious production. Verified mill certificates, transaction certificates (TC), and factory-level environmental metrics will be published upon formal client confirmation.
        </Alert>
      </section>

      {/* 3. Sustainability Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          badge="Actionable Framework"
          title="Four Pillars of Eco-Conscious Garment Production"
          description="Prospective pathways for material, water, energy, and waste reduction."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SUSTAINABILITY_GOALS.map((goal, idx) => (
            <Card key={idx} hoverEffect className="bg-surface border-border p-2 sm:p-4">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="neutral" size="sm">
                    {goal.focusArea}
                  </Badge>
                  <Leaf className="w-4 h-4 text-accent" />
                </div>
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Practical Initiatives:
                </p>
                <ul className="space-y-2 text-xs text-foreground-secondary">
                  {goal.initiatives.map((init, iIdx) => (
                    <li key={iIdx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span>{init}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="Develop a sustainable garment collection."
          description="Inquire about GOTS-certified organic cotton mill availability, recycled polyfill options, and low-liquor ratio washing lines."
        />
      </section>
    </div>
  );
}
