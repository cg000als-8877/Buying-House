import React from 'react';
import { Factory, ShieldCheck, Users, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export interface FactoryCardProps {
  name: string;
  location: string;
  specialty: string;
  capacity: string;
  workers: number;
  certifications: string[];
  image: string;
}

export function FactoryCard({
  name,
  location,
  specialty,
  capacity,
  workers,
  certifications,
  image,
}: FactoryCardProps) {
  return (
    <Card hoverEffect className="overflow-hidden p-0 flex flex-col">
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="amber" size="sm">
            {specialty}
          </Badge>
        </div>
      </div>

      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <h4 className="font-display font-bold text-lg text-white">{name}</h4>
          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1 font-sans">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{location}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 font-sans">
          <div>
            <span className="text-slate-400 block">Capacity</span>
            <span className="text-slate-100 font-medium">{capacity}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Workforce</span>
            <span className="text-slate-100 font-medium">{workers}+ Staff</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 pt-1 font-display">
          {certifications.map((c) => (
            <span key={c} className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-semibold">
              {c}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
