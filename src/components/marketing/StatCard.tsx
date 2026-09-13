import React from 'react';

export interface StatCardProps {
  value: string;
  label: string;
  sub: string;
}

export function StatCard({ value, label, sub }: StatCardProps) {
  return (
    <div className="space-y-1 relative text-center">
      <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
        <span className="text-amber-400">{value}</span>
      </div>
      <div className="text-xs sm:text-sm font-semibold text-slate-200 uppercase tracking-wide font-display">
        {label}
      </div>
      <div className="text-xs sm:text-sm text-slate-400 font-sans">
        {sub}
      </div>
    </div>
  );
}
