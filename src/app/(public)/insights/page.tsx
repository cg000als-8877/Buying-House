import type { Metadata } from 'next';
import Link from 'next/link';
import { CTASection } from '@/components/public';
import { INSIGHTS_ARTICLES } from '@/data/public/insights';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Apparel Sourcing Insights & Technical Guides | XYZ Buying House',
  description:
    'Technical apparel sourcing insights, AQL quality standards breakdown, Bangladesh manufacturing lead-time guides, and garment tech pack preparation tips.',
};

export default function InsightsPage() {
  return (
    <div className="space-y-16 lg:space-y-24 py-12 lg:py-16">
      {/* 1. Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-500 font-sans">
          Industry Knowledge
        </p>
        <h1 className="font-sans font-bold text-foreground text-h1 tracking-tight max-w-3xl mx-auto">
          Apparel Sourcing Insights & Technical Guides.
        </h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          In-depth technical briefs on garment engineering, factory cost structures, AQL quality thresholds, and supply chain management in Bangladesh.
        </p>
      </section>

      {/* 2. Insights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {INSIGHTS_ARTICLES.map((article) => (
            <Card key={article.slug} hoverEffect className="flex flex-col justify-between bg-surface border-border">
              <div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="neutral" size="sm">
                      {article.category}
                    </Badge>
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl leading-snug">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                    {article.summary}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {article.topics.map((topic, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] px-2 py-0.5 rounded bg-surface-muted text-muted-foreground border border-border/60"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-4 border-t border-border/60 justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  <span>{article.date}</span>
                </div>
                <Link
                  href="/contact"
                  className="text-xs font-semibold text-foreground hover:text-accent flex items-center gap-1 transition-colors"
                >
                  Discuss Topic <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CTASection
          title="Have specific technical questions about manufacturing in Bangladesh?"
          description="Schedule a technical discussion with our merchandising and quality engineering leaders."
        />
      </section>
    </div>
  );
}
