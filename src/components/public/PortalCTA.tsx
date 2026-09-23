import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Activity, FileCheck, Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PortalCTA() {
  const telemetryFeatures = [
    {
      icon: Activity,
      title: 'Daily Line Output Tracking',
      desc: 'Real-time sewing and finishing achievement percentages against planned ex-factory schedules.',
    },
    {
      icon: ShieldCheck,
      title: 'Inline & Final AQL Reports',
      desc: 'Digital QC inspection dossiers with high-resolution defect mapping before container loading.',
    },
    {
      icon: FileCheck,
      title: 'Document & Sample Vault',
      desc: 'Centralized access to approved tech packs, lab dip test results, shipping invoices, and bills of lading.',
    },
    {
      icon: Bell,
      title: 'Automated Milestone Alerts',
      desc: 'Instant notifications on critical path shifts, sample approvals, and vessel dispatch confirmation.',
    },
  ];

  return (
    <section className="p-8 sm:p-12 rounded-xl border border-border bg-surface shadow-subtle space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Copy */}
        <div className="lg:col-span-7 space-y-4">
          <p className="text-label text-accent font-semibold tracking-widest uppercase">
            Platform Telemetry
          </p>
          <h3 className="font-sans font-bold text-foreground text-h2 tracking-tight">
            Buyer Portal & Production Visibility
          </h3>
          <p className="text-body text-muted-foreground leading-relaxed">
            Authorized buyers will be able to monitor approved production updates, milestones and documentation through the secure portal.
          </p>

          <div className="pt-2">
            <Link href="/buyer/login">
              <Button variant="primary" size="md" className="gap-2 font-semibold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-accent" />
                Sign In to Buyer Portal
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Feature Grid */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {telemetryFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-lg bg-surface-muted/50 border border-border space-y-2 hover:border-accent/40 transition-colors"
              >
                <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center text-accent">
                  <Icon className="w-4 h-4" />
                </div>
                <h5 className="font-semibold text-xs text-foreground tracking-tight">
                  {feat.title}
                </h5>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
