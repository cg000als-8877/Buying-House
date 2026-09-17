'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { OrderMilestone } from '@/types/order';

interface OrderStatusTimelineProps {
  milestones: OrderMilestone[];
  orderNumber?: string;
  className?: string;
}

export function OrderStatusTimeline({
  milestones,
  orderNumber,
  className = '',
}: OrderStatusTimelineProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
        <div>
          <span className="text-xs text-primary font-medium font-bold uppercase tracking-wider">
            Order Production Lifecycle
          </span>
          <h3 className="text-lg font-serif font-bold text-foreground">
            Milestone Tracking {orderNumber && <span className="text-xs font-medium text-muted-foreground font-normal">({orderNumber})</span>}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="sm" dot>
            Live Stage Monitored
          </Badge>
          <span className="text-xs text-muted-foreground">Standard 7-Stage Track</span>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
        {milestones.map((milestone, idx) => {
          const isCompleted = milestone.status === 'completed';
          const isInProgress = milestone.status === 'in_progress';

          return (
            <motion.div
              key={milestone.stage}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="relative space-y-1.5"
            >
              {/* Dot / Status Icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                    : isInProgress
                    ? 'bg-amber-950/80 border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-muted/60 border-border text-muted-foreground/50'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : isInProgress ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Circle className="w-2.5 h-2.5" />
                )}
              </div>

              {/* Content Card */}
              <div
                className={`p-4 rounded-xl border transition-colors ${
                  isInProgress
                    ? 'bg-card/90 border-amber-500/40 shadow-sm'
                    : isCompleted
                    ? 'bg-card/60 border-border/80'
                    : 'bg-card/30 border-border/40 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm sm:text-base text-foreground">
                      {milestone.label}
                    </h4>
                  </div>
                  <Badge
                    variant={isCompleted ? 'emerald' : isInProgress ? 'amber' : 'slate'}
                    size="sm"
                    dot={isInProgress}
                  >
                    {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  {milestone.description}
                </p>

                {milestone.date && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 mt-2 border-t border-border/40">
                    <Clock className="w-3 h-3 text-primary" />
                    <span>Logged Date: <strong className="text-foreground">{milestone.date}</strong></span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
