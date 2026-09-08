import React from 'react';
import Link from 'next/link';
import { ArrowRight, Layers, Ruler, Factory, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export interface ServiceCardProps {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  icon: string;
  metrics: string;
}

const iconMap: Record<string, React.ReactNode> = {
  Layers: <Layers className="w-6 h-6 text-amber-400" />,
  Ruler: <Ruler className="w-6 h-6 text-emerald-400" />,
  Factory: <Factory className="w-6 h-6 text-amber-400" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
  Truck: <Truck className="w-6 h-6 text-amber-400" />,
  Sparkles: <Sparkles className="w-6 h-6 text-emerald-400" />,
};

export function ServiceCard({ id, title, fullDesc, icon, metrics }: ServiceCardProps) {
  return (
    <Card hoverEffect className="flex flex-col justify-between group p-8">
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:border-amber-500/50 transition-all duration-300">
          {iconMap[icon] || <Sparkles className="w-6 h-6 text-amber-400" />}
        </div>

        <div className="space-y-2">
          <Badge variant="emerald" size="sm">
            {metrics}
          </Badge>
          <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {fullDesc}
          </p>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between">
        <Link
          href={`/services#${id}`}
          className="text-xs font-semibold text-slate-300 group-hover:text-amber-400 flex items-center gap-1.5 transition-colors"
        >
          <span>Explore Capabilities</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}
