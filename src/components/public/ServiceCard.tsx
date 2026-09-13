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
    <Card hoverEffect className="flex flex-col justify-between h-full bg-surface border-border">
      <div>
        <CardHeader>
          <div className="w-10 h-10 rounded-md bg-secondary border border-border flex items-center justify-center text-foreground mb-3">
            <IconComponent className="w-5 h-5 text-accent" />
          </div>
          <CardTitle className="text-base sm:text-lg">{service.title}</CardTitle>
          <CardDescription>{service.shortDescription}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Core Capabilities:
          </p>
          <ul className="space-y-1.5 text-xs text-foreground-secondary">
            {service.capabilities.slice(0, 3).map((cap, idx) => (
              <li key={idx} className="flex items-start">
                <span>{cap}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </div>

      <CardFooter className="pt-4 border-t border-border/60">
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
