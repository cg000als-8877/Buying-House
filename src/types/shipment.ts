export type ShipmentStatus =
  | 'Booking Pending'
  | 'Booked'
  | 'Container Loaded'
  | 'In Transit'
  | 'Customs Cleared'
  | 'Delivered';

export interface Shipment {
  id: string;
  orderId: string;
  status: ShipmentStatus;
  forwarder: string;
  carrier: string;
  bookingReference?: string;
  containerReference?: string;
  billOfLadingNumber?: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  actualDeparture?: string;
  actualArrival?: string;
  trackingReference?: string;
  createdAt: string;
  updatedAt: string;
}
