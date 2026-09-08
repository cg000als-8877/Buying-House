import type { Metadata } from 'next';
import Link from 'next/link';
import { CTASection, MediaPlaceholder } from '@/components/public';
import { PRODUCT_CATEGORIES_DATA } from '@/data/public/products';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Clock, Layers, Sparkles, Scissors, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Apparel Capabilities & Product Categories | XYZ Buying House',
  description:
    'Explore XYZ Buying House garment manufacturing capabilities across Circular Knitwear, Woven Tops & Bottoms, Denim, Technical Outerwear, and Performance Activewear.',
};

export default function ProductsPage() {
  return (
    <div className="space-y-16 lg:space-y-24 py-12 lg:py-16">
      {/* 1. Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div>
          <Badge variant="brand" size="sm" dot>
            Illustrative Manufacturing Scope
          </Badge>
        </div>
        <h1 className="font-display font-bold text-foreground text-h1 tracking-tight max-w-3xl mx-auto">
          Apparel Categories & Manufacturing Scope.
        </h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Illustrative garment manufacturing scope across circular knits, woven bottoms, denim, outerwear, and activewear. Production schedules and commercial MOQs confirmed upon tech pack review.
        </p>
      </section>

      {/* 2. Detailed Category Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {PRODUCT_CATEGORIES_DATA.map((category) => (
          <div
            key={category.id}
            id={category.id}
            className="p-6 sm:p-10 rounded-2xl border border-border bg-surface shadow-subtle grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-24"
          >
            {/* Visual Media Placeholder & Quick Stats */}
            <div className="lg:col-span-5 space-y-4">
              <MediaPlaceholder
                aspectRatio="16/9"
                label={`${category.name} Production`}
                sublabel="Category garment photography placeholder"
                className="shadow-subtle"
              />

              <div className="p-4 rounded-lg bg-surface-muted/40 border border-border/80 grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Lead Time Status</span>
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{category.leadTimeWeeks}</span>
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Order MOQ</span>
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{category.moqPlaceholder}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <h2 className="font-display font-bold text-foreground text-h3 tracking-tight">
                  {category.name}
                </h2>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {category.subtitle}
                </p>
                <p className="text-sm text-foreground-secondary leading-relaxed">
                  {category.description}
                </p>
              </div>

              {/* Technical breakdown grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="space-y-2 p-3.5 rounded-lg bg-surface-muted/30 border border-border/60">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-accent" />
                    Key Garments
                  </p>
                  <ul className="space-y-1 text-[11px] text-muted-foreground">
                    {category.keyGarments.map((g, idx) => (
                      <li key={idx} className="truncate">• {g}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 p-3.5 rounded-lg bg-surface-muted/30 border border-border/60">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-accent" />
                    Fabric Types
                  </p>
                  <ul className="space-y-1 text-[11px] text-muted-foreground">
                    {category.fabricTypes.slice(0, 4).map((f, idx) => (
                      <li key={idx} className="truncate">• {f}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 p-3.5 rounded-lg bg-surface-muted/30 border border-border/60">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    Special Finishes
                  </p>
                  <ul className="space-y-1 text-[11px] text-muted-foreground">
                    {category.specialFinishes.map((s, idx) => (
                      <li key={idx} className="truncate">• {s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link href="/contact">
                  <Button variant="primary" size="sm" className="gap-1.5">
                    Request RFQ for {category.name} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="Have a custom garment construction or blended fabric requirement?"
          description="Our textile engineers source and test custom yarn blends, GSM targets, and wash formulations."
        />
      </section>
    </div>
  );
}
