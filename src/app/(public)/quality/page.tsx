import type { Metadata } from 'next';
import { SectionHeading, CTASection } from '@/components/public';
import { QUALITY_PILLARS, LAB_TESTING_PARAMETERS } from '@/data/public/quality';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Quality Assurance & AQL Standards | XYZ Buying House',
  description:
    'XYZ Buying House quality management framework in Bangladesh: 4-Point fabric inspection, inline defect mapping, AQL 1.5/2.5 statistical audits, and comprehensive lab testing protocols.',
};

export default function QualityPage() {
  return (
    <div className="space-y-16 lg:space-y-24 py-12 lg:py-16">
      {/* 1. Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div>
          <Badge variant="brand" size="sm" dot>
            Quality Assurance Framework
          </Badge>
        </div>
        <h1 className="font-display font-bold text-foreground text-h1 tracking-tight max-w-3xl mx-auto">
          AQL Quality Assurance & Multi-Stage Inspection Framework.
        </h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Our quality management framework is designed around international ISO 2859-1 / ANSI/ASQ Z1.4 statistical standards across incoming fabric, inline assembly, and pre-shipment inspections.
        </p>
      </section>

      {/* 2. Quality Pillars Deep Dive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionHeading
          badge="4-Stage Quality Framework"
          title="From Raw Fabric Rolls to Carton Loading"
          description="Every stage of production is governed by strict inspection protocols before progression to the next line station."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {QUALITY_PILLARS.map((pillar, idx) => (
            <Card key={idx} hoverEffect className="bg-surface border-border p-2 sm:p-4">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="brand" size="sm">
                    {pillar.stage}
                  </Badge>
                  <span className="text-xs font-mono text-accent">{pillar.standard}</span>
                </div>
                <CardTitle className="text-lg">{pillar.title}</CardTitle>
                <CardDescription>{pillar.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Verification Checkpoints:
                </p>
                <ul className="space-y-2 text-xs text-foreground-secondary">
                  {pillar.checkpoints.map((cp, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span>{cp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Physical & Chemical Lab Testing Standards Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeading
          badge="Laboratory Protocols"
          title="Physical, Chemical & Color Fastness Parameters"
          description="Standard textile lab tests performed on bulk fabric dye lots and accessory batches."
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Parameter</TableHead>
              <TableHead>International Test Method</TableHead>
              <TableHead>Standard Acceptance Tolerance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {LAB_TESTING_PARAMETERS.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-semibold text-foreground">{row.test}</TableCell>
                <TableCell className="font-mono text-xs">{row.method}</TableCell>
                <TableCell className="text-accent font-medium">{row.tolerance}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* 4. Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="Request a sample AQL inspection report or quality manual."
          description="Our quality directors can walk you through our defect classification criteria, needle detection logs, and digital QC reporting."
        />
      </section>
    </div>
  );
}
