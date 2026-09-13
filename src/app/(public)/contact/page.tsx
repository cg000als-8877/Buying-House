import type { Metadata } from 'next';
import { InquiryForm } from '@/components/public';
import { Card } from '@/components/ui/Card';
import { Mail, MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact & Sourcing RFQ Submission | XYZ Buying House',
  description:
    'Submit your apparel sourcing inquiry or tech pack to XYZ Buying House in Bangladesh. Receive itemized FOB costing, mill feasibility, and sampling schedules within 24-48 hours.',
};

export default function ContactPage() {
  return (
    <div className="space-y-16 lg:space-y-24 py-12 lg:py-16">
      {/* 1. Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-500 font-display">
          Business Inquiries &amp; RFQ
        </p>
        <h1 className="font-display font-bold text-foreground text-h1 tracking-tight max-w-3xl mx-auto">
          Initiate a Sourcing Inquiry with XYZ Buying House.
        </h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Submit your tech pack, target quantities, and delivery milestones. Our merchandising team will conduct feasibility and cost-sheet analysis.
        </p>
      </section>

      {/* 2. Main Form & Contact Info Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 rounded-2xl border border-border bg-surface shadow-subtle space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground tracking-tight">
                Request for Quotation (RFQ)
              </h3>
              <p className="text-xs text-muted-foreground">
                All fields marked with an asterisk (*) are required for technical feasibility review.
              </p>
            </div>

            <InquiryForm />
          </div>

          {/* Contact Details & Office Placeholder Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-surface border-border p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="font-bold text-base text-foreground tracking-tight">
                  Direct Merchandising Office
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  For formal communications, supplier credentials verification, or physical sample dispatch:
                </p>
              </div>

              <div className="space-y-4 text-xs text-foreground-secondary">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-accent shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">Operational Headquarters</p>
                    <p className="text-muted-foreground leading-relaxed font-mono text-[11px]">
                      [Company Registered Address: Client Input Required]
                    </p>
                    <p className="text-muted-foreground text-[11px]">Dhaka, Bangladesh</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-accent shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">Business Inquiries</p>
                    <p className="text-muted-foreground font-mono text-[11px]">[Business Email: Client Input Required]</p>
                    <p className="text-muted-foreground font-mono text-[11px]">[Merchandising Email: Client Input Required]</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-accent shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">Direct Telecommunications</p>
                    <p className="text-muted-foreground font-mono text-[11px]">[Phone Number: Client Input Required]</p>
                    <p className="text-muted-foreground font-mono text-[11px]">[WhatsApp Business: Client Input Required]</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-accent shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">Standard Operating Hours</p>
                    <p className="text-muted-foreground">Sunday - Thursday: 09:00 - 18:00 (GMT+6)</p>
                    <p className="text-muted-foreground text-[11px] italic">Emergency Merchandising Hotline available for active orders</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Non-Disclosure Assurance */}
            <div className="p-5 rounded-xl border border-border bg-surface-muted/40 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Commercial Non-Disclosure Policy</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                XYZ Buying House adheres to strict non-disclosure obligations. Your brand designs, tech packs, BOM specs, and pricing structures will never be shared outside authorized factory management.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
