import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  badge?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
}

function renderFormattedTitle(title: string) {
  if (!title.includes('*') && !title.includes('_')) {
    return title;
  }
  const parts = title.split(/(\*[^*]+\*|_[^_]+_)/g);
  return parts.map((part, index) => {
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length > 2) ||
      (part.startsWith('_') && part.endsWith('_') && part.length > 2)
    ) {
      return (
        <span key={index} className="italic font-normal text-amber-400">
          {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
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
        'space-y-4 max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
      {...props}
    >
      {badge && (
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-500 font-display">
          {badge}
        </p>
      )}
      <HeadingTag
        className={cn(
          'font-display font-bold text-foreground tracking-tight text-h2 leading-tight'
        )}
      >
        {renderFormattedTitle(title)}
      </HeadingTag>
      {description && (
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-sans">
          {description}
        </p>
      )}
    </div>
  );
}
