'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  Layers,
  Calendar,
  Camera,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Order } from '@/types/order';
import {
  ProductionSummary,
  ProductionUpdate,
  ProductionPhoto,
} from '@/types/production';
import {
  getProductionSummary,
  getPublishedProductionUpdatesForBuyer,
  getProductionPhotos,
} from '@/lib/production';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface BuyerProductionViewProps {
  order: Order;
  buyerOrgId: string;
}

export function BuyerProductionView({ order, buyerOrgId }: BuyerProductionViewProps) {
  const [summary, setSummary] = useState<ProductionSummary | null>(null);
  const [publishedLogs, setPublishedLogs] = useState<ProductionUpdate[]>([]);
  const [photos, setPhotos] = useState<ProductionPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [sumData, logsData, photosData] = await Promise.all([
          getProductionSummary(order.id, order.quantity, order.exFactoryDate),
          getPublishedProductionUpdatesForBuyer(order.id, buyerOrgId),
          getProductionPhotos(order.id),
        ]);

        if (isMounted) {
          setSummary(sumData);
          setPublishedLogs(logsData);
          setPhotos(photosData);
        }
      } catch (err) {
        console.error('Error loading buyer production view:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [order.id, order.quantity, order.exFactoryDate, buyerOrgId]);

  // Chart data (Only published updates)
  const chartData = useMemo(() => {
    const sorted = [...publishedLogs].sort(
      (a, b) => new Date(a.productionDate || a.date || 0).getTime() - new Date(b.productionDate || b.date || 0).getTime()
    );

    return sorted.map((log) => ({
      date: log.productionDate || log.date,
      stage: log.stageName,
      planned: log.plannedQuantity,
      actual: log.actualQuantity,
      cumulative: log.cumulativeQuantity,
    }));
  }, [publishedLogs]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Production Telemetry KPIs */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/90 border-border/80 space-y-1">
            <span className="text-[11px] font-mono uppercase text-muted-foreground font-semibold block">
              Order Target
            </span>
            <div className="text-xl font-bold text-foreground font-mono">
              {summary.orderQuantity.toLocaleString()} <span className="text-xs text-muted-foreground">pcs</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Contracted purchase volume</span>
          </Card>

          <Card className="p-4 bg-card/90 border-border/80 space-y-1">
            <span className="text-[11px] font-mono uppercase text-muted-foreground font-semibold block">
              Cumulative Produced
            </span>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {summary.completedQuantity.toLocaleString()} <span className="text-xs text-muted-foreground">pcs</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Verified factory output</span>
          </Card>

          <Card className="p-4 bg-card/90 border-border/80 space-y-1">
            <span className="text-[11px] font-mono uppercase text-muted-foreground font-semibold block">
              Remaining Units
            </span>
            <div className="text-xl font-bold text-primary font-mono">
              {summary.remainingQuantity.toLocaleString()} <span className="text-xs text-muted-foreground">pcs</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Balance in assembly</span>
          </Card>

          <Card className="p-4 bg-card/90 border-border/80 space-y-1">
            <span className="text-[11px] font-mono uppercase text-muted-foreground font-semibold block">
              Manufacturing Stage
            </span>
            <div className="pt-1">
              <Badge variant="blue" size="md">
                {summary.currentStageName}
              </Badge>
            </div>
            <span className="text-[10px] text-muted-foreground block pt-0.5">
              Overall: {summary.completionPercentage}% Complete
            </span>
          </Card>
        </div>
      )}

      {/* Visual Pipeline Progression */}
      <Card className="p-6 bg-card/80 border-border/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
          <div>
            <span className="text-xs font-mono uppercase text-primary font-bold">
              Production Workflow
            </span>
            <h3 className="font-serif font-bold text-lg text-foreground">
              Garment Manufacturing Pipeline
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Floor Reporting</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-2">
          {summary?.stages.map((stage) => {
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress';
            const isDelayed = stage.status === 'delayed';

            return (
              <div
                key={stage.stageId}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : isInProgress
                    ? 'bg-primary/10 border-primary/40 text-primary shadow-sm'
                    : isDelayed
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    : 'bg-muted/40 border-border/60 text-muted-foreground opacity-80'
                }`}
              >
                <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-border/60">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                    Step {stage.sequence}
                  </span>
                  <Badge
                    variant={isCompleted ? 'emerald' : isInProgress ? 'amber' : isDelayed ? 'rose' : 'slate'}
                    size="sm"
                  >
                    {isCompleted ? 'Done' : isInProgress ? 'Active' : isDelayed ? 'Behind' : 'Scheduled'}
                  </Badge>
                </div>

                <h4 className="font-semibold text-xs text-foreground pt-2 truncate" title={stage.stageName}>
                  {stage.stageName}
                </h4>

                <div className="pt-2 space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Produced:</span>
                    <span className="text-foreground font-bold">{stage.cumulativeQuantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Progress:</span>
                    <span className="text-primary font-bold">{stage.achievementPercent}%</span>
                  </div>
                </div>

                {stage.lastUpdateDate && (
                  <div className="mt-2 pt-1.5 border-t border-border/60 text-[10px] font-mono text-muted-foreground truncate">
                    Updated: {stage.lastUpdateDate}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Production Output Graph */}
      {chartData.length > 0 && (
        <Card className="p-6 bg-card/80 border-border/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <span className="text-xs font-mono uppercase text-primary font-bold">
                Output Progress
              </span>
              <h3 className="font-serif font-bold text-lg text-foreground">
                Daily Manufacturing Output
              </h3>
            </div>
            <span className="text-xs font-mono text-muted-foreground">Pieces (pcs)</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="planned" name="Daily Target" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual Produced" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Published Daily Production Logs History */}
      <Card className="p-6 bg-card/80 border-border/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
          <div>
            <span className="text-xs font-mono uppercase text-primary font-bold">
              Verified Log Stream
            </span>
            <h3 className="font-serif font-bold text-lg text-foreground">
              Daily Production Reporting History
            </h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {publishedLogs.length} Verified Entries
          </span>
        </div>

        {publishedLogs.length === 0 ? (
          <EmptyState
            title="No published production logs yet"
            description="Daily production updates will appear here once the factory floor reports are verified and published by your merchandiser."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-mono text-[11px] uppercase">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3 text-right">Target (pcs)</th>
                  <th className="py-3 px-3 text-right">Produced (pcs)</th>
                  <th className="py-3 px-3 text-right">Achievement</th>
                  <th className="py-3 px-3 text-right">Cumulative</th>
                  <th className="py-3 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono">
                {publishedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3 text-foreground font-semibold whitespace-nowrap">
                      {log.productionDate || log.date}
                    </td>
                    <td className="py-3 px-3 font-sans text-foreground">{log.stageName}</td>
                    <td className="py-3 px-3 text-right text-muted-foreground">
                      {log.plannedQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-foreground font-bold">
                      {log.actualQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-primary font-bold">
                      {log.achievementPercent}%
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground">
                      {log.cumulativeQuantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-sans text-muted-foreground max-w-xs truncate">
                      {log.remarks || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Production Inspection Photos */}
      <Card className="p-6 bg-card/80 border-border/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <span className="text-xs font-mono uppercase text-primary font-bold">
              Factory Floor Documentation
            </span>
            <h3 className="font-serif font-bold text-lg text-foreground">
              Production &amp; Inspection Snapshots
            </h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground">{photos.length} Photos</span>
        </div>

        {photos.length === 0 ? (
          <EmptyState
            title="No production photos uploaded yet"
            description="Verified snapshots from the garment floor and inline QC stations will be displayed here."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-xl overflow-hidden bg-muted/40 border border-border/80 space-y-2"
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={photo.url || photo.storagePath}
                    alt={photo.caption || 'Production photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2.5 space-y-1 text-xs">
                  <p className="text-foreground line-clamp-2">{photo.caption || 'Inspection photo'}</p>
                  <span className="text-[10px] font-mono text-muted-foreground block pt-0.5">
                    {photo.createdAt?.split('T')[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
