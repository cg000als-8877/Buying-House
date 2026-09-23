'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, ShieldCheck, Truck, Scissors, Layers, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface Milestone {
  id: string;
  title: string;
  department: string;
  targetDate: string;
  actualDate?: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  notes?: string;
}

export interface ProductionTimelineProps {
  orderNumber: string;
  styleName: string;
  milestones: Milestone[];
}

export function ProductionTimeline({ orderNumber, styleName, milestones }: ProductionTimelineProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs text-amber-400 font-medium font-bold">LIVE PRODUCTION PIPELINE</span>
          <h3 className="text-xl font-sans font-bold text-white">
            {styleName} <span className="text-sm font-medium text-slate-400">({orderNumber})</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="sm">
            QA Monitored
          </Badge>
          <span className="text-xs text-slate-400">AQL 1.5 Protocol</span>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {milestones.map((step, idx) => {
          const isDone = step.status === 'Completed';
          const isInProgress = step.status === 'In Progress';

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="relative space-y-2"
            >
              {/* icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all ${
                  isDone
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                    : isInProgress
                    ? 'bg-amber-950 border-amber-400 text-amber-400 animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-600'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : (
                  <Circle className="w-2.5 h-2.5" />
                )}
              </div>

              {/* Card info */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-sans font-bold text-sm sm:text-base text-white">
                      {step.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">| {step.department}</span>
                  </div>
                  <Badge
                    variant={isDone ? 'emerald' : isInProgress ? 'amber' : 'slate'}
                    size="sm"
                  >
                    {step.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Target: {step.targetDate}</span>
                  {step.actualDate && <span className="text-emerald-400">Completed: {step.actualDate}</span>}
                </div>

                {step.notes && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mt-2">
                    💬 <strong className="text-amber-300">Merchandiser Note:</strong> {step.notes}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
