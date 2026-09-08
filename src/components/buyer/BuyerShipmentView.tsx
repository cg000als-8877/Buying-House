'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import {
  Shipment,
  PackingItem,
  ShipmentEvent,
  ShipmentDocumentChecklistItem,
  ShipmentStatus,
  ShipmentSummaryMetrics,
} from '@/types/shipment';
import {
  getShipmentsForBuyer,
  getPackingItemsForShipment,
  getShipmentEvents,
  getShipmentDocumentChecklist,
  getShipmentMetrics,
  confirmDelivery,
} from '@/lib/shipments';
import { useAuth } from '@/lib/auth/context';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Ship,
  Plane,
  CheckCircle2,
  FileText,
  Search,
  MapPin,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  PackageCheck,
  Check,
} from 'lucide-react';

interface BuyerShipmentViewProps {
  initialOrderId?: string;
  orderNumber?: string;
  buyerOrgId: string;
}

export function BuyerShipmentView({
  initialOrderId,
  orderNumber,
  buyerOrgId,
}: BuyerShipmentViewProps) {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [metrics, setMetrics] = useState<ShipmentSummaryMetrics | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // Drawer / Inspection state
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [events, setEvents] = useState<ShipmentEvent[]>([]);
  const [documents, setDocuments] = useState<ShipmentDocumentChecklistItem[]>([]);

  // Delivery confirmation modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [receivedQuantity, setReceivedQuantity] = useState<number>(0);
  const [conditionNotes, setConditionNotes] = useState('');
  const [discrepancyReported, setDiscrepancyReported] = useState(false);
  const [discrepancyDetails, setDiscrepancyDetails] = useState('');
  const [signatoryName, setSignatoryName] = useState(user?.displayName || '');
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [shipmentsData, metricsData] = await Promise.all([
        getShipmentsForBuyer(buyerOrgId, {
          status: statusFilter,
          search: searchQuery,
        }),
        getShipmentMetrics(buyerOrgId),
      ]);

      let filtered = shipmentsData;
      if (initialOrderId) {
        filtered = filtered.filter((s) => s.orderId === initialOrderId);
      }

      setShipments(filtered);
      setMetrics(metricsData);

      if (selectedShipment) {
        const fresh = filtered.find((s) => s.id === selectedShipment.id);
        if (fresh) {
          loadShipmentDetails(fresh);
        }
      }
    } catch (err) {
      console.error('Error loading buyer shipments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [buyerOrgId, statusFilter, searchQuery, initialOrderId, selectedShipment]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadShipmentDetails = async (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setReceivedQuantity(shipment.totalPieces);
    try {
      const [packs, evts, docs] = await Promise.all([
        getPackingItemsForShipment(shipment.id, buyerOrgId),
        getShipmentEvents(shipment.id, buyerOrgId),
        getShipmentDocumentChecklist(shipment.id, buyerOrgId),
      ]);
      setPackingItems(packs);
      setEvents(evts);
      setDocuments(docs);
    } catch (err) {
      console.error('Error loading shipment details:', err);
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !user) return;
    setConfirmError(null);

    startTransition(async () => {
      try {
        const updated = await confirmDelivery(
          selectedShipment.id,
          {
            receivedQuantity,
            conditionNotes,
            discrepancyReported,
            discrepancyDetails: discrepancyReported ? discrepancyDetails : '',
            buyerSignatureName: signatoryName,
          },
          buyerOrgId,
          { uid: user.uid, name: signatoryName }
        );

        setSelectedShipment(updated);
        setConfirmSuccess(true);
        setTimeout(() => {
          setConfirmSuccess(false);
          setConfirmModalOpen(false);
        }, 1500);
        await loadData();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setConfirmError(err.message);
        } else {
          setConfirmError('Failed to confirm delivery.');
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="sm">
              Logistics &amp; Cargo Tracking
            </Badge>
            {orderNumber && (
              <span className="text-xs font-mono text-muted-foreground">
                PO: <strong className="text-primary">{orderNumber}</strong>
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-1">
            Shipments &amp; Consignments
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track vessel departures, packing lists, commercial shipping titles, and confirm cargo delivery.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          className="gap-2 text-xs text-muted-foreground hover:text-foreground self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Tracking</span>
        </Button>
      </div>

      {/* KPI Cards Strip */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground">Total Shipments</span>
            <div className="text-xl font-bold font-mono text-foreground">{metrics.totalShipments}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-sky-400">In Transit</span>
            <div className="text-xl font-bold font-mono text-sky-400">{metrics.inTransitShipments}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-amber-400">Ready to Ship</span>
            <div className="text-xl font-bold font-mono text-amber-400">{metrics.readyToShipShipments}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-emerald-400">Delivered</span>
            <div className="text-xl font-bold font-mono text-emerald-400">{metrics.deliveredShipments}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground">Total CBM</span>
            <div className="text-lg font-bold font-mono text-foreground">{metrics.totalCBM} m³</div>
          </div>
          <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground">Total Garments</span>
            <div className="text-lg font-bold font-mono text-foreground">{metrics.totalPieces.toLocaleString()} pcs</div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <Card className="p-4 bg-card border-border/80">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search shipment number, PO #, carrier line, destination port..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-muted/40 rounded-lg border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | 'ALL')}
            className="w-full sm:w-auto px-3 py-2 text-xs bg-muted/40 rounded-lg border border-border text-foreground focus:outline-none focus:border-primary font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY_TO_SHIP">Ready To Ship</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="CUSTOMS_CLEARED">Customs Cleared</option>
            <option value="ARRIVED_AT_PORT">Arrived at Port</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </Card>

      {/* Shipments Listing */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : shipments.length === 0 ? (
        <Card className="p-12 text-center border-border/80">
          <EmptyState
            title="No Active Consignments"
            description="There are currently no active shipments logged under your buyer organization tenant."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {shipments.map((shipment) => (
            <Card
              key={shipment.id}
              className={`p-6 bg-card border-border/80 hover:border-primary/50 transition-all ${
                selectedShipment?.id === shipment.id ? 'border-primary shadow-lg ring-1 ring-primary/30' : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                      {shipment.shipmentNumber}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground font-semibold">
                      PO: <strong>{shipment.orderNumber}</strong>
                    </span>
                    <Badge
                      variant={
                        shipment.status === 'DELIVERED'
                          ? 'emerald'
                          : shipment.status === 'IN_TRANSIT'
                          ? 'blue'
                          : shipment.status === 'READY_TO_SHIP'
                          ? 'amber'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {shipment.status.replace(/_/g, ' ')}
                    </Badge>
                    {shipment.delayStatus === 'DELAYED' && (
                      <Badge variant="rose" size="sm">
                        Delayed
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 text-foreground font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {shipment.destinationCountry} — {shipment.destinationPort}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      {shipment.transportMode === 'AIR' ? (
                        <Plane className="w-3.5 h-3.5 text-sky-400" />
                      ) : (
                        <Ship className="w-3.5 h-3.5 text-teal-400" />
                      )}
                      {shipment.carrier} ({shipment.incoterm})
                    </span>
                    <span>•</span>
                    <span>Volume: <strong className="text-foreground">{shipment.totalCartons} ctns / {shipment.totalPieces.toLocaleString()} pcs</strong></span>
                    <span>•</span>
                    <span>Estimated Arrival: <strong className="text-amber-400 font-mono">{shipment.estimatedDeliveryDate}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {shipment.status !== 'DELIVERED' && !shipment.deliveryConfirmation?.confirmed && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        loadShipmentDetails(shipment);
                        setConfirmModalOpen(true);
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Confirm Delivery</span>
                    </Button>
                  )}

                  {shipment.deliveryConfirmation?.confirmed && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/60">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Receipt Confirmed</span>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadShipmentDetails(shipment)}
                    className="gap-1 text-xs text-primary border-primary/40 hover:bg-primary/10"
                  >
                    <span>Inspect Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Shipment Detailed Modal / Drawer */}
      {selectedShipment && (
        <Card className="p-6 bg-card border-primary/40 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <span className="text-xs font-mono text-primary font-bold">Consignment Telemetry Details</span>
              <h3 className="text-xl font-serif font-bold text-foreground">
                {selectedShipment.shipmentNumber} — Destination: {selectedShipment.destinationPort}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedShipment(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono">
            {/* Specs */}
            <Card className="p-4 bg-muted/30 border-border space-y-2.5">
              <h4 className="font-serif font-bold text-sm text-foreground pb-1 border-b border-border">
                Cargo &amp; Shipping Line
              </h4>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carrier:</span>
                <span className="text-foreground font-bold">{selectedShipment.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Freight Forwarder:</span>
                <span className="text-foreground">{selectedShipment.forwarder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vessel / Flight:</span>
                <span className="text-foreground">{selectedShipment.vesselFlightNumber || 'TBD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Container #:</span>
                <span className="text-primary font-bold">{selectedShipment.containerNumber || 'TBD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custom Seal #:</span>
                <span className="text-foreground">{selectedShipment.sealNumber || 'TBD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bill of Lading #:</span>
                <span className="text-emerald-400 font-bold">{selectedShipment.billOfLadingNumber || selectedShipment.airWaybillNumber || 'Pending'}</span>
              </div>
            </Card>

            {/* Metrics */}
            <Card className="p-4 bg-muted/30 border-border space-y-2.5">
              <h4 className="font-serif font-bold text-sm text-foreground pb-1 border-b border-border">
                Packing &amp; Weights
              </h4>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cartons:</span>
                <span className="text-foreground font-bold">{selectedShipment.totalCartons} ctns</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Garments:</span>
                <span className="text-foreground font-bold">{selectedShipment.totalPieces.toLocaleString()} pcs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Volume:</span>
                <span className="text-foreground">{selectedShipment.totalCBM} CBM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Weight:</span>
                <span className="text-foreground">{selectedShipment.totalGrossWeightKG.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Weight:</span>
                <span className="text-foreground">{selectedShipment.totalNetWeightKG.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Incoterm:</span>
                <span className="text-amber-400 font-bold">{selectedShipment.incoterm}</span>
              </div>
            </Card>

            {/* Delivery Status */}
            <Card className="p-4 bg-muted/30 border-border space-y-2.5">
              <h4 className="font-serif font-bold text-sm text-foreground pb-1 border-b border-border">
                Delivery Receipt Status
              </h4>
              {selectedShipment.deliveryConfirmation?.confirmed ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Receipt Confirmed by Consignee</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground space-y-1 pt-1">
                    <div>Signatory: <strong className="text-foreground">{selectedShipment.deliveryConfirmation.buyerSignatureName}</strong></div>
                    <div>Received: <strong className="text-foreground">{selectedShipment.deliveryConfirmation.receivedQuantity?.toLocaleString()} pcs</strong></div>
                    <div>Confirmed At: <span className="text-slate-300">{new Date(selectedShipment.deliveryConfirmation.confirmedAt || '').toLocaleString()}</span></div>
                    {selectedShipment.deliveryConfirmation.conditionNotes && (
                      <p className="italic bg-card p-2 rounded text-slate-300">
                        {selectedShipment.deliveryConfirmation.conditionNotes}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Cargo is currently in transit or arriving at port. Confirm delivery receipt once goods are unloaded at your warehouse.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setConfirmModalOpen(true)}
                    className="w-full justify-center gap-2 text-xs"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Confirm Delivery Receipt</span>
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Commercial Documents Checklist */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif font-bold text-sm text-foreground">
              Commercial Shipping Documents &amp; Certificates
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {documents.map((doc) => (
                <div key={doc.id} className="p-3.5 rounded-lg bg-muted/30 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">{doc.documentName}</div>
                      <span className="text-[10px] font-mono text-muted-foreground">{doc.documentType}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={doc.status === 'VERIFIED' ? 'emerald' : 'slate'} size="sm">
                      {doc.status}
                    </Badge>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Packing List Breakdown */}
          {packingItems.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h4 className="font-serif font-bold text-sm text-foreground">
                Packing List Breakdown ({packingItems.length} line items)
              </h4>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                    <tr>
                      <th className="p-2.5">Carton # Range</th>
                      <th className="p-2.5">Style &amp; SKU</th>
                      <th className="p-2.5">Color / Size</th>
                      <th className="p-2.5 text-right">Ctns</th>
                      <th className="p-2.5 text-right">Pcs/Ctn</th>
                      <th className="p-2.5 text-right">Total Pcs</th>
                      <th className="p-2.5 text-right">Gross Wt (kg)</th>
                      <th className="p-2.5 text-right">CBM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {packingItems.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-mono font-bold text-foreground">
                          {item.cartonNumberStart} - {item.cartonNumberEnd}
                        </td>
                        <td className="p-2.5">
                          <div className="font-medium text-foreground">{item.styleNumber}</div>
                          {item.barcode && <div className="text-[10px] text-muted-foreground font-mono">{item.barcode}</div>}
                        </td>
                        <td className="p-2.5 text-muted-foreground">
                          {item.color} / <span className="text-foreground font-semibold">
                            {Object.entries(item.sizeBreakdown || {}).map(([s, q]) => `${s}:${q}`).join(' ')}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-medium text-foreground">{item.totalCartons}</td>
                        <td className="p-2.5 text-right text-muted-foreground">{item.piecesPerCarton}</td>
                        <td className="p-2.5 text-right font-bold text-primary">{item.totalPieces.toLocaleString()}</td>
                        <td className="p-2.5 text-right text-foreground">{item.grossWeightKG}</td>
                        <td className="p-2.5 text-right text-muted-foreground">{item.totalCBM}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Chronological Milestone Timeline */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="font-serif font-bold text-sm text-foreground">
              Cargo Tracking Milestones
            </h4>
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
              {events.map((evt) => (
                <div key={evt.id} className="relative flex items-start gap-4 pl-1">
                  <div className="w-6 h-6 rounded-full bg-card border-2 border-primary flex items-center justify-center shrink-0 z-10">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground">{evt.title}</span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {new Date(evt.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{evt.description}</p>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono pt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{evt.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Delivery Confirmation Modal */}
      {confirmModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-card border-border p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-xs font-mono text-primary font-bold uppercase">Consignee Acknowledgment</span>
                <h4 className="font-serif font-bold text-lg text-foreground">
                  Confirm Delivery Receipt ({selectedShipment.shipmentNumber})
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {confirmError && (
              <div className="p-3 rounded bg-rose-950/60 border border-rose-800 text-xs text-rose-200">
                {confirmError}
              </div>
            )}

            {confirmSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-950/40 border border-emerald-800 rounded-xl text-emerald-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h5 className="font-serif font-bold text-base text-white">Delivery Confirmed Successfully</h5>
                <p className="text-xs text-emerald-200">
                  Consignment receipt and signature have been recorded in the platform audit registry.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmDelivery} className="space-y-4 text-xs">
                <div>
                  <label className="block text-foreground font-medium mb-1">
                    Verified Received Quantity (pcs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={receivedQuantity}
                    onChange={(e) => setReceivedQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded text-foreground font-mono"
                  />
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">
                    Manifested Cargo Volume: {selectedShipment.totalPieces.toLocaleString()} pcs
                  </span>
                </div>

                <div>
                  <label className="block text-foreground font-medium mb-1">
                    Authorized Signatory Name &amp; Title
                  </label>
                  <input
                    type="text"
                    required
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    placeholder="e.g. Lars van der Meer (Logistics Director)"
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-medium mb-1">
                    Condition Notes &amp; Packaging Quality
                  </label>
                  <textarea
                    rows={2}
                    value={conditionNotes}
                    onChange={(e) => setConditionNotes(e.target.value)}
                    placeholder="e.g. All cartons received intact with zero carton puncture or moisture damage."
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded text-foreground"
                  />
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="discrepancyCheck"
                      checked={discrepancyReported}
                      onChange={(e) => setDiscrepancyReported(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="discrepancyCheck" className="text-foreground font-semibold cursor-pointer">
                      Report Cargo Discrepancy or Damage
                    </label>
                  </div>

                  {discrepancyReported && (
                    <div className="pt-2">
                      <label className="block text-muted-foreground mb-1">
                        Discrepancy Details &amp; Affected Carton Numbers:
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={discrepancyDetails}
                        onChange={(e) => setDiscrepancyDetails(e.target.value)}
                        placeholder="Detail any carton shortages, damaged outer boxes, or incorrect size labeling..."
                        className="w-full px-2.5 py-1.5 bg-card border border-border rounded text-foreground"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmModalOpen(false)}
                    className="text-muted-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isPending}
                    className="text-xs gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Submit Delivery Acknowledgment</span>
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
