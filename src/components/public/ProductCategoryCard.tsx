import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProductCategory, PRODUCT_CATEGORIES_DATA } from '@/data/public/products';
import { MediaPlaceholder } from './MediaPlaceholder';

export function ProductCategoryCard({ category }: { category: ProductCategory }) {
  return (
    <Card hoverEffect className="flex flex-col justify-between h-full bg-surface border-border overflow-hidden group">
      <div>
        {category.image ? (
          <div className="relative aspect-video w-full overflow-hidden bg-surface-muted">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          </div>
        ) : (
          <MediaPlaceholder
            aspectRatio="16/9"
            label={category.name}
            sublabel="Garment category showcase"
            className="rounded-b-none border-t-0 border-x-0"
          />
        )}

        <CardHeader>
          <div className="flex items-center justify-between gap-2 mb-1">
            <Badge variant="neutral" size="sm" className="text-xs font-display">
              {category.leadTimeWeeks}
            </Badge>
          </div>
          <CardTitle className="text-lg sm:text-xl font-display font-bold group-hover:text-accent transition-colors">
            {category.name}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground font-sans">{category.subtitle}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
            {category.description}
          </p>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Garments Produced:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {category.keyGarments.slice(0, 3).map((item, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-md bg-surface-muted text-foreground-secondary border border-border/60"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-4 border-t border-border/60 justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-4 h-4 text-accent" />
          <span>MOQ: {category.moqPlaceholder}</span>
        </div>
        <Link
          href={`/products#${category.id}`}
          className="text-xs sm:text-sm font-semibold text-foreground hover:text-accent flex items-center gap-1 transition-colors"
        >
          Specs <ArrowRight className="w-4 h-4" />
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
