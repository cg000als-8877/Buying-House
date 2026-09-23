import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Scissors,
  Activity,
  ShieldCheck,
  Scale,
  Truck,
  ArrowRight,
  LucideIcon,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { SourcingService, SERVICES_DATA } from '@/data/public/services';

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Scissors,
  Activity,
  ShieldCheck,
  Scale,
  Truck,
};

export function ServiceCard({ service }: { service: SourcingService }) {
  const IconComponent = iconMap[service.iconName] || Building2;

  return (
    <Card hoverEffect className="flex flex-col justify-between h-full bg-card border-border shadow-subtle group">
      <div>
        <CardHeader>
          <div className="w-10 h-10 rounded-md bg-secondary border border-border flex items-center justify-center text-accent mb-3 group-hover:border-accent/40 transition-colors">
            <IconComponent className="w-5 h-5 text-accent" />
          </div>
          <CardTitle className="text-base sm:text-lg group-hover:text-accent transition-colors">{service.title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{service.shortDescription}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-label text-muted-foreground">
            Core Capabilities:
          </p>
          <ul className="space-y-1.5 text-xs text-foreground-secondary">
            {service.capabilities.slice(0, 3).map((cap, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <span>{cap}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </div>

      <CardFooter className="pt-3.5 border-t border-border">
        <Link
          href={`/services#${service.id}`}
          className="text-xs font-semibold text-foreground hover:text-accent flex items-center gap-1.5 transition-colors"
        >
          Detailed Workflow <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}

export function ServiceGrid({ limit }: { limit?: number }) {
  const services = limit ? SERVICES_DATA.slice(0, limit) : SERVICES_DATA;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
