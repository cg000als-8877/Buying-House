import type { Metadata } from 'next';
import { SectionHeading, CTASection, MediaPlaceholder } from '@/components/public';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Target, Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About XYZ Buying House | Apparel Sourcing & Manufacturing Management',
  description:
    'Learn about XYZ Buying House — our mission, technical merchandising operations, ethical compliance standards, and digital production management in Bangladesh.',
};

export default function AboutPage() {
  const coreValues = [
    {
      title: 'Uncompromising Transparency',
      desc: 'Open-cost sheet breakdowns, direct mill accountability, and real-time production updates via our digital Buyer Portal.',
    },
    {
      title: 'Technical Precision',
      desc: 'Rigorous tech pack execution, accurate pattern engineering, and dedicated AQL quality controllers stationed on-site.',
    },
    {
      title: 'Ethical Supply Chain',
      desc: 'Zero tolerance for unauthorized subcontracting, child labor, or unsafe working environments.',
    },
    {
      title: 'Buyer-Centric Partnership',
      desc: 'Long-term relationship management treating customer collections with the precision of an internal technical team.',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 py-12 lg:py-16">
      {/* 1. Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div>
          <Badge variant="brand" size="sm" dot>
            Company Profile & Governance
          </Badge>
        </div>
        <h1 className="font-display font-bold text-foreground text-h1 tracking-tight max-w-3xl mx-auto">
          Bridging International Fashion Brands with Bangladesh Manufacturing.
        </h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          XYZ Buying House is a full-service apparel sourcing, merchandising, and quality governance partner operating from Dhaka, Bangladesh.
        </p>
      </section>

      {/* 2. Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card hoverEffect className="p-4 sm:p-6 bg-surface border-border space-y-3">
            <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-accent">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground tracking-tight">Our Mission</h3>
            <p className="text-body text-foreground-secondary leading-relaxed">
              To provide global apparel buyers with a seamless, risk-free manufacturing bridge into Bangladesh — combining competitive open-cost sourcing with rigorous on-site quality assurance, compliance auditing, and real-time digital telemetry.
            </p>
          </Card>

          <Card hoverEffect className="p-4 sm:p-6 bg-surface border-border space-y-3">
            <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-accent">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground tracking-tight">Our Vision</h3>
            <p className="text-body text-foreground-secondary leading-relaxed">
              To establish the gold standard for buying house operations in South Asia — where every order is governed with end-to-end data transparency, zero ethical compromise, and exceptional garment craftsmanship.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. Operations & Merchandising Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <SectionHeading
              badge="Operational Approach"
              title="A Systematic Buying House Methodology"
              description="We do not simply place purchase orders; we manage the entire manufacturing lifecycle from initial design feasibility to container dispatch."
              align="left"
            />
            <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
              <p>
                Operating as an extended technical department for international retailers and boutique brands, our dedicated merchandising teams oversee fabric development, lab dip approvals, fit grading, and inline quality control daily.
              </p>
              <p>
                By maintaining stationed QC staff inside partner manufacturing units, we catch and correct sewing, shade, and dimensional discrepancies before garments reach the finishing floor.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <MediaPlaceholder
              aspectRatio="4/3"
              label="Operational Merchandising & Pattern Engineering Hub"
              sublabel="Verified client team & facility photography placeholder"
            />
          </div>
        </div>
      </section>

      {/* 4. Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          badge="Guiding Principles"
          title="Core Values Driving Every Production Line"
          description="Principles that protect brand reputation, worker safety, and delivery commitments."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((val, idx) => (
            <Card key={idx} hoverEffect className="bg-surface border-border">
              <CardHeader>
                <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-accent mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <CardTitle className="text-base">{val.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {val.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="Discuss your brand’s apparel sourcing requirements with our team."
          description="Send us your upcoming season tech packs or schedule an initial technical consultation with our senior merchandisers."
        />
      </section>
    </div>
  );
}
