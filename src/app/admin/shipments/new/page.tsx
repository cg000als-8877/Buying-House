'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { getAllOrders } from '@/lib/orders';
import { createShipment } from '@/lib/shipments';
import { Order } from '@/types/order';
import { TransportMode, Incoterm } from '@/types/shipment';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Truck, Ship, Plane, Calendar, Package } from 'lucide-react';

export default function NewShipmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [transportMode, setTransportMode] = useState<TransportMode>('SEA_FCL');
  const [incoterm, setIncoterm] = useState<Incoterm>('FOB');
  const [carrier, setCarrier] = useState('');
  const [forwarder, setForwarder] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('Germany');
  const [destinationPort, setDestinationPort] = useState('Hamburg Port (DEHAM)');
  const [portOfLoading, setPortOfLoading] = useState('Chittagong Port (BDCGP)');
  const [vesselFlightNumber, setVesselFlightNumber] = useState('');
  const [voyageNumber, setVoyageNumber] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [plannedShipDate, setPlannedShipDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [internalNotes, setInternalNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const orderList = await getAllOrders();
        setOrders(orderList);
        if (orderList.length > 0) {
          setSelectedOrderId(orderList[0].id);
        }
      } catch (err) {
        console.error('Failed to load orders for shipment booking:', err);
      }
    }
    loadOrders();
  }, []);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !user) return;
    setError(null);

    startTransition(async () => {
      try {
        await createShipment(
          {
            orderId: selectedOrder.id,
            orderNumber: selectedOrder.orderNumber,
            buyerOrganizationId: selectedOrder.buyerOrganizationId,
            buyerOrganizationName: selectedOrder.buyerOrganizationId,
            destinationCountry,
            destinationPort,
            portOfLoading,
            transportMode,
            incoterm,
            carrier,
            forwarder,
            vesselFlightNumber,
            voyageNumber,
            containerNumber,
            sealNumber,
            bookingReference,
            plannedShipDate,
            estimatedDeliveryDate,
            internalNotes,
          },
          { uid: user.uid, role: user.role, name: user.displayName || user.email }
        );

        router.push('/admin/shipments');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to create shipment.');
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Link href="/admin/shipments" className="text-slate-400 hover:text-white">
            Shipments
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-amber-400 font-bold">New Booking</span>
        </div>

        <Link href="/admin/shipments">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Shipments</span>
          </Button>
        </Link>
      </div>

      <Card className="p-8 bg-slate-900 border-slate-800 space-y-6">
        <div>
          <Badge variant="amber" size="sm">
            Cargo Booking Workflow
          </Badge>
          <h2 className="text-2xl font-serif font-bold text-white mt-1">
            Initialize New Shipment Booking Plan
          </h2>
          <p className="text-xs text-slate-400">
            Create an operational export consignment linked to an active purchase order.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1: Order Selection */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="font-serif font-bold text-sm text-amber-400">
              1. Purchase Order Linking
            </h3>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Select Purchase Order</label>
              <select
                required
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} - {o.productName} ({o.quantity.toLocaleString()} pcs, Buyer: {o.buyerOrganizationId})
                  </option>
                ))}
              </select>
            </div>
            {selectedOrder && (
              <div className="text-[11px] font-medium text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                <span>Style: <strong className="text-slate-200">{selectedOrder.styleNumber}</strong></span>
                <span>Category: <strong className="text-slate-200">{selectedOrder.category}</strong></span>
                <span>Ex-Factory: <strong className="text-amber-400">{selectedOrder.exFactoryDate}</strong></span>
              </div>
            )}
          </div>

          {/* Section 2: Carrier & Transport Mode */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="font-serif font-bold text-sm text-amber-400">
              2. Carrier &amp; Logistics Service Provider
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Transport Mode</label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value as TransportMode)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium"
                >
                  <option value="SEA_FCL">Sea FCL (Full Container Load)</option>
                  <option value="SEA_LCL">Sea LCL (Less than Container Load)</option>
                  <option value="AIR">Air Freight</option>
                  <option value="ROAD">Cross-Border Road Transport</option>
                  <option value="COURIER">Express Courier</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Incoterm</label>
                <select
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value as Incoterm)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium"
                >
                  <option value="FOB">FOB (Free On Board)</option>
                  <option value="CIF">CIF (Cost, Insurance &amp; Freight)</option>
                  <option value="CFR">CFR (Cost and Freight)</option>
                  <option value="EXW">EXW (Ex Works)</option>
                  <option value="DDP">DDP (Delivered Duty Paid)</option>
                  <option value="DAP">DAP (Delivered at Place)</option>
                  <option value="FCA">FCA (Free Carrier)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Carrier Line / Airline</label>
                <input
                  type="text"
                  required
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g. Hapag-Lloyd, Maersk Line, Qatar Airways Cargo"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Freight Forwarder</label>
                <input
                  type="text"
                  required
                  value={forwarder}
                  onChange={(e) => setForwarder(e.target.value)}
                  placeholder="e.g. Kuehne+Nagel, DSV Air & Sea, DHL Global"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Routing & Port Schedule */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="font-serif font-bold text-sm text-amber-400">
              3. Port Routing &amp; Vessel Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Port of Loading (POL)</label>
                <input
                  type="text"
                  required
                  value={portOfLoading}
                  onChange={(e) => setPortOfLoading(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Destination Country</label>
                <input
                  type="text"
                  required
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Destination Port / Airport (POD)</label>
                <input
                  type="text"
                  required
                  value={destinationPort}
                  onChange={(e) => setDestinationPort(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Booking Reference #</label>
                <input
                  type="text"
                  value={bookingReference}
                  onChange={(e) => setBookingReference(e.target.value)}
                  placeholder="e.g. BK-KN-2026-9901"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Planned Ship Date (ETD)</label>
                <input
                  type="date"
                  required
                  value={plannedShipDate}
                  onChange={(e) => setPlannedShipDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Estimated Delivery Date (ETA)</label>
                <input
                  type="date"
                  required
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Vessel / Flight Name</label>
                <input
                  type="text"
                  value={vesselFlightNumber}
                  onChange={(e) => setVesselFlightNumber(e.target.value)}
                  placeholder="e.g. MV Express Berlin"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Container # (if known)</label>
                <input
                  type="text"
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value)}
                  placeholder="e.g. HLXU-892147-3"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Internal Operational Notes</label>
              <textarea
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Specific container stuffing instructions, CFS requirements, customs broker details..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Link href="/admin/shipments">
              <Button type="button" variant="ghost" size="sm" className="text-slate-400">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isPending}
              className="gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>Create Shipment Booking</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
