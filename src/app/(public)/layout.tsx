import React from 'react';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <PublicHeader />
        <main className="flex-grow">{children}</main>
        <PublicFooter />
      </div>
    </SmoothScroll>
  );
}
