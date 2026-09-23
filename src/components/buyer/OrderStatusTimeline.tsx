'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
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
          <span className="text-label text-accent">
            Order Production Lifecycle
          </span>
          <h3 className="text-lg font-sans font-bold text-foreground">
            Milestone Tracking {orderNumber && <span className="text-xs font-normal text-muted-foreground">({orderNumber})</span>}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">
            Live Stage Monitored
          </Badge>
          <span className="text-xs text-muted-foreground">Standard 7-Stage Track</span>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
        {milestones.map((milestone, idx) => {
          const isCompleted = milestone.status === 'completed';
          const isInProgress = milestone.status === 'in_progress';

          return (
            <motion.div
              key={milestone.stage}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="relative space-y-1.5"
            >
              {/* Status Badge Step */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-md flex items-center justify-center border transition-all ${
                  isCompleted
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : isInProgress
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                    : 'bg-secondary border-border text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                ) : isInProgress ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Content Card */}
              <div
                className={`p-4 rounded-lg border transition-colors ${
                  isInProgress
                    ? 'bg-card border-accent/40 shadow-subtle'
                    : isCompleted
                    ? 'bg-card/90 border-border'
                    : 'bg-card/50 border-border/60 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-semibold text-sm sm:text-base text-foreground">
                    {milestone.label}
                  </h4>
                  <Badge
                    variant={isCompleted ? 'success' : isInProgress ? 'warning' : 'neutral'}
                    size="sm"
                  >
                    {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  {milestone.description}
                </p>

                {milestone.date && (
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3 text-accent" />
                    <span>Target Date: <strong className="text-foreground">{milestone.date}</strong></span>
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
