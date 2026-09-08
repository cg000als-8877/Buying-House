import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export interface TestimonialCardProps {
  quote: string;
  clientName: string;
  role: string;
  brand: string;
  avatar: string;
}

export function TestimonialCard({ quote, clientName, role, brand, avatar }: TestimonialCardProps) {
  return (
    <Card hoverEffect className="p-8 flex flex-col justify-between space-y-6 relative">
      <Quote className="w-8 h-8 text-amber-500/20 absolute top-6 right-6 pointer-events-none" />

      <div className="space-y-4">
        <div className="flex items-center gap-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>

        <p className="text-sm text-slate-300 leading-relaxed italic">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
        <img
          src={avatar}
          alt={clientName}
          className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
        />
        <div>
          <h4 className="text-sm font-bold text-white">{clientName}</h4>
          <p className="text-xs text-slate-400">{role}</p>
          <p className="text-[11px] text-emerald-400 font-medium">{brand}</p>
        </div>
      </div>
    </Card>
  );
}
