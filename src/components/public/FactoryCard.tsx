import { MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FactoryPartner, FACTORY_NETWORK_PROFILES } from '@/data/public/factories';
import { MediaPlaceholder } from './MediaPlaceholder';

export function FactoryCard({ factory }: { factory: FactoryPartner }) {
  return (
    <Card hoverEffect className="flex flex-col justify-between bg-surface border-border overflow-hidden">
      <div>
        <MediaPlaceholder
          aspectRatio="16/9"
          label={factory.name}
          sublabel="Facility profile & machinery photography pending verification"
          className="rounded-b-none border-t-0 border-x-0"
        />

        <CardHeader>
          <div className="flex items-center justify-between gap-2 mb-1">
            <Badge variant="neutral" size="sm">
              {factory.category}
            </Badge>
            <span className="text-[11px] font-mono text-muted-foreground">
              Verification Pending
            </span>
          </div>
          <CardTitle className="text-base sm:text-lg">{factory.name}</CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{factory.location}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <p className="font-semibold uppercase tracking-wider text-[11px] text-muted-foreground">
              Core Manufacturing Capabilities:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {factory.specialization.map((spec, sIdx) => (
                <span
                  key={sIdx}
                  className="px-2 py-0.5 rounded bg-surface-muted text-foreground-secondary border border-border/60 text-[11px]"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <p className="font-semibold uppercase tracking-wider text-[11px] text-muted-foreground">
              Capacity & Audit Status:
            </p>
            <div className="p-2.5 rounded bg-surface-muted/40 border border-border/60 text-[11px] text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span>Production Capacity:</span>
                <span className="font-medium text-foreground">{factory.monthlyCapacityPlaceholder}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Certifications:</span>
                <span className="font-medium text-foreground italic">{factory.certificationsPlaceholder}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-3 border-t border-border/60 bg-surface-muted/30">
        <p className="text-[11px] text-muted-foreground italic leading-tight">
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
