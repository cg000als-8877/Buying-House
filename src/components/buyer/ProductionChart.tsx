import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export interface CategoryBreakdown {
  category: string;
  pieces: number;
  color: string;
  percentage: number;
}

export interface ProductionChartProps {
  title?: string;
  totalPieces: number;
  data: CategoryBreakdown[];
}

export function ProductionChart({
  title = 'Active Order Volume by Apparel Category',
  totalPieces,
  data,
}: ProductionChartProps) {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-medium text-amber-400 font-bold uppercase tracking-wider">
            Volume Allocation
          </span>
          <h3 className="font-serif font-bold text-lg text-white">{title}</h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Live Units</span>
          <span className="text-xl font-bold text-white font-medium">{totalPieces.toLocaleString()} pcs</span>
        </div>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
        {data.map((item) => (
          <div
            key={item.category}
            className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:opacity-90"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.color,
            }}
            title={`${item.category}: ${item.pieces.toLocaleString()} pcs (${item.percentage}%)`}
          />
        ))}
      </div>

      {/* Breakdown Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        {data.map((item) => (
          <div key={item.category} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-300 font-medium truncate">{item.category}</span>
            </div>
            <div className="text-sm font-bold text-white font-medium">
              {item.pieces.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
