import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProductCategory, PRODUCT_CATEGORIES_DATA } from '@/data/public/products';
import { MediaPlaceholder } from './MediaPlaceholder';

export function ProductCategoryCard({ category }: { category: ProductCategory }) {
  return (
    <Card hoverEffect className="flex flex-col justify-between h-full bg-surface border-border overflow-hidden">
      <div>
        <MediaPlaceholder
          aspectRatio="16/9"
          label={category.name}
          sublabel="Garment category showcase"
          className="rounded-b-none border-t-0 border-x-0"
        />

        <CardHeader>
          <div className="flex items-center justify-between gap-2 mb-1">
            <Badge variant="neutral" size="sm">
              {category.leadTimeWeeks}
            </Badge>
          </div>
          <CardTitle className="text-base sm:text-lg">{category.name}</CardTitle>
          <CardDescription>{category.subtitle}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-xs text-foreground-secondary leading-relaxed">
            {category.description}
          </p>

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Garments Produced:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {category.keyGarments.slice(0, 3).map((item, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded bg-surface-muted text-foreground-secondary border border-border/60"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-4 border-t border-border/60 justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="w-3.5 h-3.5 text-accent" />
          <span>MOQ: {category.moqPlaceholder}</span>
        </div>
        <Link
          href={`/products#${category.id}`}
          className="text-xs font-semibold text-foreground hover:text-accent flex items-center gap-1 transition-colors"
        >
          Specs <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}

export function ProductCategoryGrid({ limit }: { limit?: number }) {
  const categories = limit
    ? PRODUCT_CATEGORIES_DATA.slice(0, limit)
    : PRODUCT_CATEGORIES_DATA;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat) => (
        <ProductCategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  );
}
