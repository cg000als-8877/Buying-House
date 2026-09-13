import type { Metadata } from 'next';
import { SectionHeading, CTASection } from '@/components/public';
import { COMPLIANCE_STANDARDS } from '@/data/public/compliance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Scale, CheckCircle2, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Social Compliance & Ethical Governance | XYZ Buying House',
  description:
    'XYZ Buying House compliance oversight in Bangladesh: ethical labor standards, building/fire safety integrity, environmental management, and zero unauthorized subcontracting.',
};

export default function CompliancePage() {
  return (
    <div className="space-y-16 lg:space-y-24 py-12 lg:py-16">
      {/* 1. Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-500 font-display">
          Ethical Governance
        </p>
        <h1 className="font-display font-bold text-foreground text-h1 tracking-tight max-w-3xl mx-auto">
          Social Compliance & Ethical Sourcing Governance.
        </h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Rigorous factory auditing, labor welfare monitoring, and structural safety verification ensuring your brand meets global ethical standards in Bangladesh.
        </p>
      </section>

      {/* 2. Compliance Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          badge="Audit Criteria"
          title="Four Pillars of Ethical Factory Partnership"
          description="Every manufacturing partner facility in our network is continuously evaluated against national and international labor laws."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {COMPLIANCE_STANDARDS.map((std, idx) => (
            <Card key={idx} hoverEffect className="bg-surface border-border p-2 sm:p-4">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="neutral" size="sm">
                    {std.category}
                  </Badge>
                  <Scale className="w-4 h-4 text-accent" />
                </div>
                <CardTitle className="text-lg">{std.title}</CardTitle>
                <CardDescription>{std.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Governance & Audit Controls:
                </p>
                <ul className="space-y-2 text-xs text-foreground-secondary">
                  {std.governanceMeasures.map((measure, mIdx) => (
                    <li key={mIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span>{measure}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Certifications & Audit Credentials Structure */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <SectionHeading
          badge="Audit Credentials"
          title="Certifications & Compliance"
          description="Applicable certifications and audit credentials will be listed here following verification."
        />

        <div className="p-6 sm:p-8 rounded-xl border border-dashed border-border bg-surface-muted/30 text-center space-y-2">
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            Third-Party Verification & Factory Audit Dossiers
          </p>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
            International audit certificates (e.g. BSCI, SEDEX, WRAP, OEKO-TEX, GOTS, ISO) and specific factory compliance scores are cataloged in our system and verified directly for allocated production lines upon client onboarding.
          </p>
        </div>
      </section>

      {/* 4. Subcontracting Policy Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-xl border border-accent/30 bg-accent/5 space-y-3">
          <div className="flex items-center gap-2 text-accent font-semibold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Zero Unauthorized Subcontracting Policy</span>
          </div>
          <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
            Unauthorized factory transfer introduces severe compliance and quality risks. Our operational framework enforces strict line-level tracking. Every purchase order is mapped to dedicated manufacturing floors with transparent supply chain custody.
          </p>
        </div>
      </section>

      {/* 4. Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="Review our factory compliance dossiers and audit framework."
          description="We provide international buyers with transparent compliance summaries for all allocated manufacturing lines."
        />
      </section>
    </div>
  );
}
