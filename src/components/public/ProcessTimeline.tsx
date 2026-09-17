import React from 'react';
import { WORKFLOW_STAGES } from '@/data/public/process';
import { Badge } from '@/components/ui/Badge';
import { Clock, CheckCircle2 } from 'lucide-react';

export function ProcessTimeline() {
  return (
    <div className="relative space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {WORKFLOW_STAGES.slice(0, 4).map((stage) => (
          <div
            key={stage.step}
            className="p-5 rounded-lg border border-border bg-surface flex flex-col justify-between space-y-4 hover:border-border-strong transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-md bg-secondary text-foreground font-medium font-bold text-sm flex items-center justify-center border border-border">
                  0{stage.step}
                </span>
                <Badge variant="neutral" size="sm">
                  <Clock className="w-3 h-3 mr-1 text-accent" />
                  {stage.timelineEstimate}
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-foreground tracking-tight">
                  {stage.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Key Milestone Deliverable:
              </p>
              <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                <span className="truncate">{stage.keyOutputs[0]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {WORKFLOW_STAGES.slice(4, 7).map((stage) => (
          <div
            key={stage.step}
            className="p-5 rounded-lg border border-border bg-surface flex flex-col justify-between space-y-4 hover:border-border-strong transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-md bg-secondary text-foreground font-medium font-bold text-sm flex items-center justify-center border border-border">
                  0{stage.step}
                </span>
                <Badge variant="neutral" size="sm">
                  <Clock className="w-3 h-3 mr-1 text-accent" />
                  {stage.timelineEstimate}
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-foreground tracking-tight">
                  {stage.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {stage.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Key Milestone Deliverable:
              </p>
              <div className="flex items-center gap-1.5 text-xs text-foreground-secondary">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                <span className="truncate">{stage.keyOutputs[0]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
