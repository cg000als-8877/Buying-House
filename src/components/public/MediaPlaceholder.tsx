import React from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MediaPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectRatio?: '16/9' | '4/3' | '1/1' | '21/9' | '3/4';
  label?: string;
  sublabel?: string;
  icon?: 'camera' | 'image';
}

export function MediaPlaceholder({
  aspectRatio = '16/9',
  label = 'Approved Factory / Garment Media',
  sublabel = 'Awaiting verified client photography',
  icon = 'image',
  className,
  ...props
}: MediaPlaceholderProps) {
  const aspectClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '21/9': 'aspect-[21/9]',
    '3/4': 'aspect-[3/4]',
  };

  return (
    <div
      role="img"
      aria-label={`${label} - ${sublabel}`}
      className={cn(
        'relative w-full rounded-lg border border-dashed border-border bg-surface-muted/50 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden group transition-colors duration-fast hover:border-border-strong',
        aspectClasses[aspectRatio],
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-surface border border-border text-muted-foreground mb-3 group-hover:text-accent group-hover:border-accent/40 transition-colors">
        {icon === 'camera' ? <Camera className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
      </div>
      <p className="text-xs sm:text-sm font-semibold text-foreground tracking-tight max-w-xs">
        {label}
      </p>
      <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
        {sublabel}
      </p>
    </div>
  );
}
