import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  badge?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
}

export function SectionHeading({
  badge,
  title,
  description,
  align = 'center',
  as = 'h2',
  className,
  ...props
}: SectionHeadingProps) {
  const HeadingTag = as;

  return (
    <div
      className={cn(
        'space-y-3 max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
      {...props}
    >
      {badge && (
        <div>
          <Badge variant="brand" size="sm" dot>
            {badge}
          </Badge>
        </div>
      )}
      <HeadingTag
        className={cn(
          'font-display font-bold text-foreground tracking-tight text-h2 leading-tight'
        )}
      >
        {title}
      </HeadingTag>
      {description && (
        <p className="text-body text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
