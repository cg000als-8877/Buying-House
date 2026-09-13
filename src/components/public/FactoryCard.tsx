import { MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FactoryPartner, FACTORY_NETWORK_PROFILES } from '@/data/public/factories';
import { MediaPlaceholder } from './MediaPlaceholder';

export function FactoryCard({ factory }: { factory: FactoryPartner }) {
  return (
    <Card hoverEffect className="flex flex-col justify-between bg-surface border-border overflow-hidden group">
      <div>
        {factory.image ? (
          <div className="relative aspect-video w-full overflow-hidden bg-surface-muted">
            <img
              src={factory.image}
              alt={factory.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />
          </div>
        ) : (
          <MediaPlaceholder
            aspectRatio="16/9"
            label={factory.name}
            sublabel="Facility profile & machinery photography"
            className="rounded-b-none border-t-0 border-x-0"
          />
        )}

        <CardHeader>
          <div className="flex items-center justify-between gap-2 mb-1">
            <Badge variant="neutral" size="sm" className="text-xs font-display">
              {factory.category}
            </Badge>
            <span className="text-xs font-mono text-emerald-400 font-medium">
              Verified Partner
            </span>
          </div>
          <CardTitle className="text-lg sm:text-xl font-display font-bold group-hover:text-accent transition-colors">
            {factory.name}
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground pt-0.5 font-sans">
            <MapPin className="w-4 h-4 text-accent shrink-0" />
            <span>{factory.location}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-2">
            <p className="font-semibold uppercase tracking-wider text-xs text-muted-foreground">
              Core Manufacturing Capabilities:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {factory.specialization.map((spec, sIdx) => (
                <span
                  key={sIdx}
                  className="px-2.5 py-1 rounded-md bg-surface-muted text-foreground-secondary border border-border/60 text-xs"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60">
            <p className="font-semibold uppercase tracking-wider text-xs text-muted-foreground">
              Capacity & Audit Status:
            </p>
            <div className="p-3 rounded-lg bg-surface-muted/40 border border-border/60 text-xs sm:text-sm text-muted-foreground space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Production Capacity:</span>
                <span className="font-medium text-foreground">{factory.monthlyCapacityPlaceholder}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Certifications:</span>
                <span className="font-medium text-emerald-400">{factory.certificationsPlaceholder}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-3.5 border-t border-border/60 bg-surface-muted/30">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {factory.notes}
        </p>
      </CardFooter>
    </Card>
  );
}

export function FactoryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {FACTORY_NETWORK_PROFILES.map((fac) => (
        <FactoryCard key={fac.id} factory={fac} />
      ))}
    </div>
  );
}
