import React from 'react';
import { Hero } from '@/components/home/Hero';
import { StatsBanner } from '@/components/home/StatsBanner';
import { ProductShowcase } from '@/components/home/ProductShowcase';
import { ServicesOverview } from '@/components/home/ServicesOverview';
import { ComplianceSection } from '@/components/home/ComplianceSection';
import { ProcessFlow } from '@/components/home/ProcessFlow';
import { Testimonials } from '@/components/home/Testimonials';
import { CtaBanner } from '@/components/home/CtaBanner';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <StatsBanner />
      <ProductShowcase />
      <ServicesOverview />
      <ProcessFlow />
      <ComplianceSection />
      <Testimonials />
      <CtaBanner />
    </div>
  );
}
