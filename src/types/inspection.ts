export type InspectionType = 'Inline' | 'Pre-Shipment' | 'Final Random' | 'Fabric Audit';
export type InspectionResult = 'Passed' | 'Failed' | 'Pending Review';

export interface Inspection {
  id: string;
  orderId: string;
  inspectionType: InspectionType;
  inspectionDate: string;
  status: 'scheduled' | 'completed';
  result: InspectionResult;
  majorDefects?: number;
  minorDefects?: number;
  criticalDefects?: number;
  remarks?: string;
  reportDocumentId?: string;
  inspector: string;
  createdAt: string;
  updatedAt: string;
}
