'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Shipment,
  PackingItem,
  ShipmentEvent,
  ShipmentDocumentChecklistItem,
  ShipmentStatus,
  ShipmentReadiness,
  ShipmentSummaryMetrics,
  TransportMode,
} from '@/types/shipment';
import {
  getShipmentsForAdmin,
  getPackingItemsForShipment,
  getShipmentEvents,
  getShipmentDocumentChecklist,
  getShipmentReadiness,
  getShipmentMetrics,
  updateShipmentStatus,
  createPackingItem,
  recordShipmentEvent,
  updateShipmentDocumentChecklistItem,
} from '@/lib/shipments';
import { useAuth } from '@/lib/auth/context';
import { hasPermission } from '@/lib/auth/permissions';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Truck,
  Ship,
  Plane,
  Box,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  X,
  MapPin,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface AdminShipmentWorkspaceProps {
  initialOrderId?: string;
  orderNumber?: string;
}

export function AdminShipmentWorkspace({
  initialOrderId,
  orderNumber,
}: AdminShipmentWorkspaceProps) {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [metrics, setMetrics] = useState<ShipmentSummaryMetrics | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'readiness' | 'packing' | 'documents' | 'tracking'>('overview');

  // Drawer state
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [events, setEvents] = useState<ShipmentEvent[]>([]);
  const [documents, setDocuments] = useState<ShipmentDocumentChecklistItem[]>([]);
  const [readiness, setReadiness] = useState<ShipmentReadiness | null>(null);

  // Modals & Action States
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<ShipmentStatus>('BOOKED');
  const [statusNote, setStatusNote] = useState('');
  const [statusLocation, setStatusLocation] = useState('');
  const [overrideGate, setOverrideGate] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);

  // Add packing item form
  const [isAddingPacking, setIsAddingPacking] = useState(false);
  const [packStyleNumber, setPackStyleNumber] = useState('');
  const [packColor, setPackColor] = useState('');
  const [packStartCarton, setPackStartCarton] = useState(1);
  const [packEndCarton, setPackEndCarton] = useState(50);
  const [packPiecesPerCarton, setPackPiecesPerCarton] = useState(50);
  const [packLength, setPackLength] = useState(60);
  const [packWidth, setPackWidth] = useState(40);
  const [packHeight, setPackHeight] = useState(30);
  const [packGrossWeight, setPackGrossWeight] = useState(625);
  const [packNetWeight, setPackNetWeight] = useState(590);

  // Add tracking event form
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventStatus, setEventStatus] = useState<ShipmentStatus>('IN_TRANSIT');
  const [eventDesc, setEventDesc] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'ALL'>('ALL');
  const [modeFilter, setModeFilter] = useState<TransportMode | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const canWrite = hasPermission(user?.role, 'shipments.write');
  const canChangeStatus = hasPermission(user?.role, 'shipments.status') || canWrite;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [shipmentsData, metricsData] = await Promise.all([
        getShipmentsForAdmin({
          status: statusFilter,
          transportMode: modeFilter,
          search: searchQuery,
        }),
        getShipmentMetrics(),
      ]);

      let filtered = shipmentsData;
      if (initialOrderId) {
        filtered = filtered.filter((s) => s.orderId === initialOrderId);
      }

      setShipments(filtered);
      setMetrics(metricsData);

      // If selected shipment exists, reload its details
      if (selectedShipment) {
        const freshSelected = filtered.find((s) => s.id === selectedShipment.id);
        if (freshSelected) {
          loadShipmentDetails(freshSelected);
        }
      }
    } catch (err) {
      console.error('Error loading shipment workspace data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, modeFilter, searchQuery, initialOrderId]);

  const loadShipmentDetails = async (shipment: Shipment) => {
    setSelectedShipment(shipment);
    try {
      const [packs, evts, docs, ready] = await Promise.all([
        getPackingItemsForShipment(shipment.id),
        getShipmentEvents(shipment.id),
        getShipmentDocumentChecklist(shipment.id),
        getShipmentReadiness(shipment.orderId),
      ]);
      setPackingItems(packs);
      setEvents(evts);
      setDocuments(docs);
      setReadiness(ready);
    } catch (err) {
      console.error('Error loading shipment details:', err);
    }
  };

  const handleStatusTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !user) return;
    setStatusError(null);

    startTransition(async () => {
      try {
        const updated = await updateShipmentStatus(
          selectedShipment.id,
          {
            status: targetStatus,
            note: statusNote,
            location: statusLocation,
            overrideQualityGate: overrideGate,
            overrideReason: overrideReason,
          },
          { uid: user.uid, role: user.role, name: user.displayName || user.email }
        );

        setSelectedShipment(updated);
        setStatusModalOpen(false);
        setStatusNote('');
        setStatusLocation('');
        setOverrideGate(false);
        setOverrideReason('');
        await loadData();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setStatusError(err.message);
        } else {
          setStatusError('Failed to transition shipment status.');
        }
      }
    });
  };

  const handleAddPackingItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !user) return;

    startTransition(async () => {
      try {
        const totalCartons = Math.max(1, packEndCarton - packStartCarton + 1);
        const totalPieces = totalCartons * packPiecesPerCarton;

        await createPackingItem(
          {
            shipmentId: selectedShipment.id,
            orderId: selectedShipment.orderId,
            cartonNumberStart: packStartCarton,
            cartonNumberEnd: packEndCarton,
            totalCartons,
            styleNumber: packStyleNumber || selectedShipment.orderNumber,
            color: packColor || 'Default Assortment',
            sizeBreakdown: { Standard: packPiecesPerCarton },
            piecesPerCarton: packPiecesPerCarton,
            totalPieces,
            lengthCM: packLength,
            widthCM: packWidth,
            heightCM: packHeight,
            grossWeightKG: packGrossWeight,
            netWeightKG: packNetWeight,
          },
          { uid: user.uid, role: user.role, name: user.displayName || user.email }
        );

        setIsAddingPacking(false);
        await loadShipmentDetails(selectedShipment);
        await loadData();
      } catch (err) {
        console.error('Failed to add packing item:', err);
      }
    });
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment || !user) return;

    startTransition(async () => {
      try {
        await recordShipmentEvent(
          selectedShipment.id,
          {
            title: eventTitle,
            location: eventLocation || selectedShipment.destinationPort,
            status: eventStatus,
            description: eventDesc,
            isMilestone: true,
          },
          { uid: user.uid, role: user.role, name: user.displayName || user.email }
        );

        setIsAddingEvent(false);
        setEventTitle('');
        setEventLocation('');
        setEventDesc('');
        await loadShipmentDetails(selectedShipment);
      } catch (err) {
        console.error('Failed to add tracking event:', err);
      }
    });
  };

  const handleVerifyDocument = async (docId: string) => {
    if (!user) return;
    try {
      await updateShipmentDocumentChecklistItem(
        docId,
        { status: 'VERIFIED' },
        { uid: user.uid, role: user.role, name: user.displayName || user.email }
      );
      if (selectedShipment) {
        const freshDocs = await getShipmentDocumentChecklist(selectedShipment.id);
        setDocuments(freshDocs);
      }
    } catch (err) {
      console.error('Failed to verify document:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="amber" size="sm">
              Logistics &amp; Cargo Control
            </Badge>
            {orderNumber && (
              <span className="text-xs font-medium text-slate-400">
                Order: <strong className="text-amber-400">{orderNumber}</strong>
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            Shipment &amp; Logistics Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            End-to-end cargo dispatch pipeline, packing validation, commercial documents &amp; milestone telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="gap-2 text-xs text-slate-300 border-slate-700 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          {canWrite && (
            <Link href="/admin/shipments/new">
              <Button variant="primary" size="sm" className="gap-2 text-xs">
                <Plus className="w-4 h-4" />
                <span>New Shipment Booking</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Metrics Summary Strip */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-slate-400">Total Bookings</span>
            <div className="text-xl font-bold font-medium text-white">{metrics.totalShipments}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-sky-400">In Transit</span>
            <div className="text-xl font-bold font-medium text-sky-400">{metrics.inTransitShipments}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-amber-400">Ready to Ship</span>
            <div className="text-xl font-bold font-medium text-amber-400">{metrics.readyToShipShipments}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-emerald-400">Delivered</span>
            <div className="text-xl font-bold font-medium text-emerald-400">{metrics.deliveredShipments}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-rose-400">Delayed</span>
            <div className="text-xl font-bold font-medium text-rose-400">{metrics.delayedShipments}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-slate-400">Total Volume</span>
            <div className="text-lg font-bold font-medium text-white">{metrics.totalCBM} CBM</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-slate-400">Total Pieces</span>
            <div className="text-lg font-bold font-medium text-white">{metrics.totalPieces.toLocaleString()}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-[10px] font-medium uppercase text-emerald-400">On-Time Rate</span>
            <div className="text-xl font-bold font-medium text-emerald-400">{metrics.onTimeDeliveryRate}%</div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <Card className="p-4 bg-slate-900/80 border-slate-800">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Shipment #, PO #, Carrier, Forwarder, Port..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 rounded-lg border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | 'ALL')}
              className="px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-amber-400 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PLANNING">Planning</option>
              <option value="BOOKING_REQUESTED">Booking Requested</option>
              <option value="BOOKED">Booked</option>
              <option value="PACKING">Packing</option>
              <option value="READY_TO_SHIP">Ready To Ship</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="CUSTOMS_HOLD">Customs Hold</option>
              <option value="CUSTOMS_CLEARED">Customs Cleared</option>
              <option value="ARRIVED_AT_PORT">Arrived at Port</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as TransportMode | 'ALL')}
              className="px-3 py-2 text-xs bg-slate-950 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-amber-400 font-medium"
            >
              <option value="ALL">All Transport Modes</option>
              <option value="SEA_FCL">Sea FCL (Container)</option>
              <option value="SEA_LCL">Sea LCL (Groupage)</option>
              <option value="AIR">Air Freight</option>
              <option value="ROAD">Road Transport</option>
              <option value="COURIER">Express Courier</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Shipments Data Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : shipments.length === 0 ? (
        <Card className="p-12 text-center border-slate-800">
          <EmptyState
            title="No Shipments Found"
            description="No active shipments or cargo bookings matched your search filter criteria."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden bg-slate-900/90 border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 font-medium text-[11px] text-slate-400 uppercase">
                  <th className="p-4">Shipment # / PO</th>
                  <th className="p-4">Destination &amp; Buyer</th>
                  <th className="p-4">Mode &amp; Carrier</th>
                  <th className="p-4">Packing Breakdown</th>
                  <th className="p-4">ETD / ETA</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {shipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      selectedShipment?.id === shipment.id ? 'bg-slate-800/60' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-amber-400">{shipment.shipmentNumber}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Package className="w-3 h-3" />
                        <span>{shipment.orderNumber}</span>
                      </div>
                    </td>

                    <td className="p-4 font-sans">
                      <div className="text-white font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{shipment.destinationCountry} - {shipment.destinationPort}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">
                        Org: {shipment.buyerOrganizationName}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        {shipment.transportMode === 'AIR' ? (
                          <Plane className="w-3.5 h-3.5 text-sky-400" />
                        ) : shipment.transportMode.startsWith('SEA') ? (
                          <Ship className="w-3.5 h-3.5 text-teal-400" />
                        ) : (
                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span className="font-bold">{shipment.transportMode}</span>
                        <span className="text-[10px] text-slate-400">({shipment.incoterm})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans truncate max-w-[180px]">
                        {shipment.carrier} | {shipment.forwarder}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-white font-bold">
                        {shipment.totalCartons} ctns / {shipment.totalPieces.toLocaleString()} pcs
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {shipment.totalCBM} CBM | {shipment.totalGrossWeightKG.toLocaleString()} kg
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-slate-300">
                        ETD: <span className="text-white">{shipment.plannedShipDate}</span>
                      </div>
                      <div className="text-slate-300">
                        ETA: <span className="text-amber-300">{shipment.estimatedDeliveryDate}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`text-[10px] font-medium font-bold px-2 py-0.5 rounded-full ${
                          shipment.status === 'DELIVERED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : shipment.status === 'IN_TRANSIT'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : shipment.status === 'READY_TO_SHIP'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {shipment.status.replace(/_/g, ' ')}
                        </span>

                        {shipment.delayStatus === 'DELAYED' && (
                          <Badge variant="rose" size="sm">
                            Delayed
                          </Badge>
                        )}
                        {shipment.delayStatus === 'AT_RISK' && (
                          <Badge variant="amber" size="sm">
                            At Risk
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadShipmentDetails(shipment)}
                        className="text-xs h-7 text-amber-400 border-amber-400/40 hover:bg-amber-400/10 gap-1"
                      >
                        <span>Workspace</span>
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Shipment Detailed Inspection Workspace Drawer */}
      {selectedShipment && (
        <Card className="p-6 bg-slate-900/95 border-amber-400/30 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                  {selectedShipment.shipmentNumber}
                </span>
                <span className="text-xs font-medium text-slate-300">
                  PO: <strong>{selectedShipment.orderNumber}</strong>
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Buyer: <strong>{selectedShipment.buyerOrganizationName}</strong>
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                Cargo Operational Workspace: {selectedShipment.destinationCountry} ({selectedShipment.destinationPort})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {canChangeStatus && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setStatusModalOpen(true)}
                  className="gap-1.5 text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update Stage ({selectedShipment.status.replace(/_/g, ' ')})</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedShipment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Module Sub-tabs */}
          <div className="flex border-b border-slate-800 gap-2 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-3 border-b-2 font-bold transition-colors ${
                activeTab === 'overview'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Commercial &amp; Vessel Specs
            </button>
            <button
              onClick={() => setActiveTab('readiness')}
              className={`pb-2.5 px-3 border-b-2 font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'readiness'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>2. Readiness &amp; Quality Gates</span>
              {readiness?.isReady ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('packing')}
              className={`pb-2.5 px-3 border-b-2 font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'packing'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>3. Packing List Breakdown</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">
                {packingItems.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`pb-2.5 px-3 border-b-2 font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'documents'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>4. Shipping Documents</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">
                {documents.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`pb-2.5 px-3 border-b-2 font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'tracking'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>5. Live Tracking Events</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">
                {events.length}
              </span>
            </button>
          </div>

          {/* Sub-tab 1: Commercial & Vessel Specs */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs font-medium">
              <Card className="p-4 bg-slate-950/60 border-slate-800 space-y-3">
                <h4 className="font-serif font-bold text-sm text-white pb-2 border-b border-slate-800">
                  Carrier &amp; Forwarding Agent
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Carrier Line:</span>
                    <span className="text-white font-bold">{selectedShipment.carrier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Freight Forwarder:</span>
                    <span className="text-white">{selectedShipment.forwarder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Incoterm:</span>
                    <span className="text-amber-400 font-bold">{selectedShipment.incoterm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transport Mode:</span>
                    <span className="text-white">{selectedShipment.transportMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Booking Ref:</span>
                    <span className="text-slate-200">{selectedShipment.bookingReference || 'N/A'}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-slate-950/60 border-slate-800 space-y-3">
                <h4 className="font-serif font-bold text-sm text-white pb-2 border-b border-slate-800">
                  Vessel &amp; Container Allocation
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vessel / Flight:</span>
                    <span className="text-white font-bold">{selectedShipment.vesselFlightNumber || 'TBD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Voyage / Flight #:</span>
                    <span className="text-white">{selectedShipment.voyageNumber || 'TBD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Container Number:</span>
                    <span className="text-amber-400 font-bold">{selectedShipment.containerNumber || 'TBD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Custom Seal Number:</span>
                    <span className="text-white">{selectedShipment.sealNumber || 'TBD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bill of Lading / AWB:</span>
                    <span className="text-emerald-400 font-bold">{selectedShipment.billOfLadingNumber || selectedShipment.airWaybillNumber || 'Pending Issuance'}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-slate-950/60 border-slate-800 space-y-3">
                <h4 className="font-serif font-bold text-sm text-white pb-2 border-b border-slate-800">
                  Schedule &amp; Internal Notes
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Port of Loading:</span>
                    <span className="text-white">{selectedShipment.portOfLoading}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Destination Port:</span>
                    <span className="text-white">{selectedShipment.destinationPort}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Actual Ship Date:</span>
                    <span className="text-white">{selectedShipment.actualShipDate || 'Not yet dispatched'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Actual Delivery:</span>
                    <span className="text-white">{selectedShipment.actualDeliveryDate || 'In Progress'}</span>
                  </div>
                </div>
                {selectedShipment.internalNotes && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-amber-400 font-bold block mb-1">Internal Operational Notes:</span>
                    <p className="text-[11px] text-slate-300 italic bg-slate-900 p-2 rounded">
                      {selectedShipment.internalNotes}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Sub-tab 2: Readiness & Quality Gates */}
          {activeTab === 'readiness' && readiness && (
            <div className="space-y-6">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                readiness.isReady
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : readiness.qualityGate.overrideApplied
                  ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}>
                <div className="flex items-center gap-3">
                  {readiness.isReady ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  ) : readiness.qualityGate.overrideApplied ? (
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-rose-400" />
                  )}
                  <div>
                    <h4 className="font-serif font-bold text-base text-white">
                      {readiness.isReady
                        ? 'All Pre-Shipment Quality & Production Gates Passed'
                        : readiness.qualityGate.overrideApplied
                        ? 'Shipment Approved via Manager Quality Override'
                        : 'Readiness Gates Blocked: Unmet Pre-Shipment Conditions'}
                    </h4>
                    <p className="text-xs text-slate-300">
                      {readiness.isReady
                        ? 'Order is fully verified for export dispatch with 0 critical defects and verified commercial packing list.'
                        : readiness.qualityGate.overrideApplied
                        ? `Overridden by ${readiness.qualityGate.overrideByName}: "${readiness.qualityGate.overrideReason}"`
                        : `${readiness.reasons.length} blocking condition(s) require resolution before DISPATCH.`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Gate 1: Quality Gate */}
                <Card className="p-5 bg-slate-950/70 border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h5 className="font-serif font-bold text-white text-sm">1. Quality &amp; AQL Gate</h5>
                    <Badge variant={readiness.qualityGate.passed ? 'emerald' : 'rose'} size="sm">
                      {readiness.qualityGate.passed ? 'PASSED' : 'BLOCKED'}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Inspections:</span>
                      <span className="text-white">{readiness.qualityGate.inspectionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Passed Audits:</span>
                      <span className="text-emerald-400 font-bold">{readiness.qualityGate.passedInspections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Failed Audits:</span>
                      <span className="text-rose-400">{readiness.qualityGate.failedInspections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Open CAPs:</span>
                      <span className={readiness.qualityGate.openCapsCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {readiness.qualityGate.openCapsCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Critical Defects:</span>
                      <span className={readiness.qualityGate.criticalDefectsCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {readiness.qualityGate.criticalDefectsCount}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Gate 2: Production Gate */}
                <Card className="p-5 bg-slate-950/70 border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h5 className="font-serif font-bold text-white text-sm">2. Packing &amp; Volume Gate</h5>
                    <Badge variant={readiness.productionGate.passed ? 'emerald' : 'amber'} size="sm">
                      {readiness.productionGate.completionPercentage}%
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-400">PO Quantity:</span>
                      <span className="text-white">{readiness.productionGate.requiredQuantity.toLocaleString()} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Packed Quantity:</span>
                      <span className="text-white font-bold">{readiness.productionGate.packedQuantity.toLocaleString()} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Packing Status:</span>
                      <span className="text-amber-400">{selectedShipment.packingStatus}</span>
                    </div>
                  </div>
                </Card>

                {/* Gate 3: Document Gate */}
                <Card className="p-5 bg-slate-950/70 border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h5 className="font-serif font-bold text-white text-sm">3. Documents Gate</h5>
                    <Badge variant={readiness.documentGate.isComplete ? 'emerald' : 'amber'} size="sm">
                      {readiness.documentGate.totalRequiredCount - readiness.documentGate.pendingRequiredCount} / {readiness.documentGate.totalRequiredCount}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Required Documents:</span>
                      <span className="text-white">{readiness.documentGate.totalRequiredCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pending Upload/Verify:</span>
                      <span className={readiness.documentGate.pendingRequiredCount > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                        {readiness.documentGate.pendingRequiredCount}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {readiness.reasons.length > 0 && (
                <Card className="p-4 bg-rose-950/30 border-rose-900/60 space-y-2">
                  <span className="text-xs font-medium font-bold text-rose-400 uppercase">
                    Blocking Issue Details:
                  </span>
                  <ul className="space-y-1 text-xs text-rose-200 list-disc list-inside">
                    {readiness.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}

          {/* Sub-tab 3: Detailed Packing List */}
          {activeTab === 'packing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-sans font-bold text-white text-base">Export Packing List Line Items</h4>
                  <p className="text-xs text-slate-400">
                    Calculated carton metrics: {selectedShipment.totalCartons} cartons | {selectedShipment.totalPieces.toLocaleString()} pieces | {selectedShipment.totalCBM} CBM | {selectedShipment.totalGrossWeightKG.toLocaleString()} kg Gross
                  </p>
                </div>
                {canWrite && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingPacking(!isAddingPacking)}
                    className="gap-1.5 text-xs text-amber-400 border-amber-400/40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingPacking ? 'Close Form' : 'Add Packing Range'}</span>
                  </Button>
                )}
              </div>

              {/* Add Packing Form */}
              {isAddingPacking && (
                <Card className="p-5 bg-slate-950 border-amber-400/40 space-y-4">
                  <h5 className="font-serif font-bold text-sm text-amber-400">Add Export Carton Range</h5>
                  <form onSubmit={handleAddPackingItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Style Number</label>
                      <input
                        type="text"
                        required
                        value={packStyleNumber}
                        onChange={(e) => setPackStyleNumber(e.target.value)}
                        placeholder="e.g. STY-KNIT-402"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Color / Shade</label>
                      <input
                        type="text"
                        required
                        value={packColor}
                        onChange={(e) => setPackColor(e.target.value)}
                        placeholder="e.g. Navy Blue"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Carton Start #</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={packStartCarton}
                        onChange={(e) => setPackStartCarton(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Carton End #</label>
                      <input
                        type="number"
                        min={packStartCarton}
                        required
                        value={packEndCarton}
                        onChange={(e) => setPackEndCarton(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Pcs Per Carton</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={packPiecesPerCarton}
                        onChange={(e) => setPackPiecesPerCarton(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Dimensions (L x W x H cm)</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={packLength}
                          onChange={(e) => setPackLength(Number(e.target.value))}
                          placeholder="L"
                          className="w-1/3 px-1.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium text-center"
                        />
                        <input
                          type="number"
                          value={packWidth}
                          onChange={(e) => setPackWidth(Number(e.target.value))}
                          placeholder="W"
                          className="w-1/3 px-1.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium text-center"
                        />
                        <input
                          type="number"
                          value={packHeight}
                          onChange={(e) => setPackHeight(Number(e.target.value))}
                          placeholder="H"
                          className="w-1/3 px-1.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium text-center"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Gross Weight (KG)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={packGrossWeight}
                        onChange={(e) => setPackGrossWeight(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Net Weight (KG)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={packNetWeight}
                        onChange={(e) => setPackNetWeight(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingPacking(false)}
                        className="text-slate-400"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isPending}
                        className="text-xs"
                      >
                        Save Packing Range
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Packing Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs border-collapse font-medium">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                      <th className="p-3">Carton Range</th>
                      <th className="p-3">Style / Color</th>
                      <th className="p-3">Cartons</th>
                      <th className="p-3">Pcs/Ctn</th>
                      <th className="p-3">Total Pcs</th>
                      <th className="p-3">Dimensions (cm)</th>
                      <th className="p-3">Total CBM</th>
                      <th className="p-3">Gross / Net (kg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {packingItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="p-3 font-bold text-amber-400">
                          #{item.cartonNumberStart} - #{item.cartonNumberEnd}
                        </td>
                        <td className="p-3 font-sans">
                          <span className="text-white font-semibold">{item.styleNumber}</span>
                          <span className="text-slate-400 block text-[11px]">{item.color}</span>
                        </td>
                        <td className="p-3 text-white">{item.totalCartons}</td>
                        <td className="p-3 text-slate-300">{item.piecesPerCarton}</td>
                        <td className="p-3 text-emerald-400 font-bold">{item.totalPieces.toLocaleString()}</td>
                        <td className="p-3 text-slate-400">
                          {item.lengthCM}x{item.widthCM}x{item.heightCM}
                        </td>
                        <td className="p-3 text-white font-bold">{item.totalCBM}</td>
                        <td className="p-3 text-slate-300">
                          {item.grossWeightKG} / {item.netWeightKG}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab 4: Shipping Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif font-bold text-white text-base">Commercial Shipping Documents</h4>
                <p className="text-xs text-slate-400">
                  Customs declaration, transport title deeds, origin certificates and invoice checklist.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4 bg-slate-950/70 border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white font-sans">{doc.documentName}</div>
                          <span className="text-[10px] font-medium text-slate-400">{doc.documentType}</span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          doc.status === 'VERIFIED'
                            ? 'emerald'
                            : doc.status === 'UPLOADED'
                            ? 'blue'
                            : doc.status === 'DRAFTED'
                            ? 'amber'
                            : 'slate'
                        }
                        size="sm"
                      >
                        {doc.status}
                      </Badge>
                    </div>

                    {doc.fileName && (
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300 flex items-center justify-between">
                        <span className="truncate">{doc.fileName}</span>
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:text-amber-300 shrink-0 ml-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}

                    {doc.notes && (
                      <p className="text-[11px] text-slate-400 italic">{doc.notes}</p>
                    )}

                    {canWrite && doc.status !== 'VERIFIED' && (
                      <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyDocument(doc.id)}
                          className="text-[11px] h-7 text-emerald-400 border-emerald-800/60 hover:bg-emerald-950/40 gap-1"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verify Document</span>
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Sub-tab 5: Live Tracking Events */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-white text-base">Cargo Milestone Progression</h4>
                  <p className="text-xs text-slate-400">
                    Chronological dispatch events, port departures, feeder vessel transfers, and customs gates.
                  </p>
                </div>
                {canWrite && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingEvent(!isAddingEvent)}
                    className="gap-1.5 text-xs text-amber-400 border-amber-400/40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingEvent ? 'Close Form' : 'Log Tracking Milestone'}</span>
                  </Button>
                )}
              </div>

              {isAddingEvent && (
                <Card className="p-5 bg-slate-950 border-amber-400/40 space-y-4">
                  <h5 className="font-serif font-bold text-sm text-amber-400">Record Carrier / Port Milestone</h5>
                  <form onSubmit={handleAddEvent} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Milestone Title</label>
                      <input
                        type="text"
                        required
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="e.g. Transshipment Discharged at Colombo Port"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Location</label>
                      <input
                        type="text"
                        required
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        placeholder="e.g. Colombo Port, Sri Lanka"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Stage Status</label>
                      <select
                        value={eventStatus}
                        onChange={(e) => setEventStatus(e.target.value as ShipmentStatus)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-medium"
                      >
                        <option value="BOOKED">Booked</option>
                        <option value="READY_TO_SHIP">Ready To Ship</option>
                        <option value="DISPATCHED">Dispatched</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="CUSTOMS_HOLD">Customs Hold</option>
                        <option value="CUSTOMS_CLEARED">Customs Cleared</option>
                        <option value="ARRIVED_AT_PORT">Arrived at Port</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Detailed Description</label>
                      <input
                        type="text"
                        required
                        value={eventDesc}
                        onChange={(e) => setEventDesc(e.target.value)}
                        placeholder="e.g. Container transferred to connecting mother vessel."
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                      />
                    </div>
                    <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingEvent(false)}
                        className="text-slate-400"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isPending}
                        className="text-xs"
                      >
                        Record Milestone Event
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Event Timeline */}
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                {events.map((evt) => (
                  <div key={evt.id} className="relative flex items-start gap-4 pl-1">
                    <div className="w-6 h-6 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center shrink-0 z-10">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white font-sans">{evt.title}</span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-sans">{evt.description}</div>
                      <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400 pt-1">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <MapPin className="w-3 h-3" />
                          {evt.location}
                        </span>
                        <span className="text-slate-700">|</span>
                        <span>Recorded by: {evt.createdByName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Stage Progression Modal */}
      {statusModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-slate-900 border-slate-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-medium text-amber-400 font-bold uppercase">Lifecycle Progression</span>
                <h4 className="font-serif font-bold text-lg text-white">
                  Update Stage for {selectedShipment.shipmentNumber}
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {statusError && (
              <div className="p-3 rounded bg-rose-950/60 border border-rose-800 text-xs text-rose-200">
                {statusError}
              </div>
            )}

            <form onSubmit={handleStatusTransition} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Stage</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as ShipmentStatus)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white font-medium"
                >
                  <option value="BOOKING_REQUESTED">Booking Requested</option>
                  <option value="BOOKED">Booked</option>
                  <option value="PACKING">Packing</option>
                  <option value="READY_TO_SHIP">Ready To Ship</option>
                  <option value="DISPATCHED">Dispatched</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="CUSTOMS_HOLD">Customs Hold</option>
                  <option value="CUSTOMS_CLEARED">Customs Cleared</option>
                  <option value="ARRIVED_AT_PORT">Arrived at Port</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Location / Port Milestone</label>
                <input
                  type="text"
                  value={statusLocation}
                  onChange={(e) => setStatusLocation(e.target.value)}
                  placeholder="e.g. Chittagong Port CFS Bay 2"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Operational Remarks / Note</label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Notes on customs clearance, seal confirmation, carrier handoff..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>

              {/* Quality Gate Manager Override */}
              {(targetStatus === 'READY_TO_SHIP' || targetStatus === 'DISPATCHED') && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="overrideCheck"
                      checked={overrideGate}
                      onChange={(e) => setOverrideGate(e.target.checked)}
                      className="rounded border-slate-700 text-amber-400 focus:ring-amber-400 bg-slate-900"
                    />
                    <label htmlFor="overrideCheck" className="text-amber-300 font-bold text-xs cursor-pointer">
                      Authorized Manager Quality / Production Gate Override
                    </label>
                  </div>
                  {overrideGate && (
                    <div className="pt-2">
                      <label className="block text-slate-400 mb-1">
                        Mandatory Justification Reason (Audit Logged):
                      </label>
                      <input
                        type="text"
                        required
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="e.g. Concession granted by buyer for minor shade variance Lot #4."
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatusModalOpen(false)}
                  className="text-slate-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isPending}
                  className="text-xs"
                >
                  Confirm Stage Transition
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
