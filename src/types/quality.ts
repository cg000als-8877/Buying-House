export type InspectionType =
  | 'PP_MEETING'
  | 'INLINE'
  | 'MIDLINE'
  | 'FINAL_RANDOM'
  | 'REINSPECTION';

export type InspectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type InspectionResult = 'PASS' | 'CONDITIONAL' | 'FAIL' | 'PENDING';

export type DefectSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export type DefectCategory =
  | 'Workmanship'
  | 'Measurement'
  | 'Fabric / Material'
  | 'Color / Shade'
  | 'Cleanliness / Spots'
  | 'Packaging / Labeling'
  | 'Trims / Accessories'
  | 'Other';

export interface DefectItem {
  id: string;
  inspectionId: string;
  category: DefectCategory;
  code?: string;
  severity: DefectSeverity;
  quantity: number;
  location?: string;
  description: string;
  photoUrl?: string;
}

export type InspectionLevel = 'GI' | 'GII' | 'GIII' | 'S1' | 'S2' | 'S3' | 'S4';

export interface AQLConfig {
  defaultLevel: InspectionLevel;
  majorAQL: number; // e.g. 2.5
  minorAQL: number; // e.g. 4.0
  criticalAQL: number; // 0.0 (Zero tolerance)
  allowConditionalMinor: boolean;
}

export interface AQLCalculationResult {
  codeLetter: string;
  sampleSize: number;
  inspectedQuantity: number;
  lotSize: number;
  majorAQL: number;
  minorAQL: number;
  criticalAQL: number;
  maxAllowedCritical: number;
  maxAllowedMajor: number;
  maxAllowedMinor: number;
  majorMaxAllowed?: number;
  minorMaxAllowed?: number;
  criticalMaxAllowed?: number;
  actualCritical: number;
  actualMajor: number;
  actualMinor: number;
  criticalCount?: number;
  majorCount?: number;
  minorCount?: number;
  criticalDefectsPass?: boolean;
  majorDefectsPass?: boolean;
  minorDefectsPass?: boolean;
  totalDefects: number;
  result: InspectionResult;
  failureReasons: string[];
}

export interface CorrectiveAction {
  id: string;
  inspectionId: string;
  orderId: string;
  issueDescription?: string;
  rootCause?: string;
  actionRequired?: string;
  actionPlan?: string;
  responsibleParty?: string;
  assignedTo?: string;
  dueDate?: string;
  targetDate?: string;
  status: 'open' | 'in_progress' | 'completed' | 'verified' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
  resolutionNotes?: string;
  verificationNotes?: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LabTestCategory =
  | 'Color Fastness'
  | 'Washing Fastness'
  | 'Rubbing Fastness'
  | 'Shrinkage'
  | 'GSM'
  | 'Fabric Composition'
  | 'Fiber Composition'
  | 'Dimensional Stability'
  | 'Tensile Strength'
  | 'Tear Strength'
  | 'Flammability'
  | 'Seam Slippage'
  | 'Formaldehyde'
  | 'pH'
  | 'Restricted Substance Testing'
  | 'Other';

export type LabVerificationStatus = 'VERIFIED' | 'VERIFICATION_REQUIRED' | 'PENDING';

export interface LabTestReport {
  id: string;
  reportNumber: string;
  testCategory: LabTestCategory;
  labName: string;
  reportDate: string;
  sampleReference?: string | null;
  orderId: string;
  orderNumber?: string | null;
  buyerOrganizationId: string;
  documentId?: string | null;
  documentUrl?: string | null;
  fileName?: string | null;
  result: 'PASS' | 'FAIL' | 'CONDITIONAL';
  status: 'active' | 'archived';
  verificationStatus: LabVerificationStatus;
  visibility: 'buyer' | 'internal';
  remarks?: string | null;
  testParameters?: { parameter: string; standard: string; result: string; pass: boolean }[];
  published: boolean;
  publishedAt?: string | null;
  publishedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Inspection {
  id: string;
  orderId: string;
  orderNumber: string;
  styleNumber: string;
  buyerOrganizationId: string;
  factoryId: string;
  inspectionType: InspectionType;
  inspectionDate: string;
  inspectorId: string;
  inspectorName: string;
  inspectionStatus: InspectionStatus;
  orderQuantity: number;
  inspectedQuantity: number;
  sampleSize: number;
  aqlLevel: InspectionLevel;
  aqlMajor: number;
  aqlMinor: number;
  criticalDefects: number;
  majorDefects: number;
  minorDefects: number;
  totalDefects: number;
  maxAllowedMajor: number;
  maxAllowedMinor: number;
  result: InspectionResult;
  defects: DefectItem[];
  remarks?: string;
  internalNotes?: string;
  correctiveAction?: CorrectiveAction | null;
  correctiveActions?: CorrectiveAction[];
  reinspectionRequired: boolean;
  reinspectionOfId?: string | null;
  reinspectionIds?: string[];
  reportDocumentId?: string | null;
  attachments?: string[];
  published: boolean;
  publishedAt?: string | null;
  publishedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QualitySummaryMetrics {
  totalInspections: number;
  passedCount: number;
  conditionalCount: number;
  failedCount: number;
  pendingCount: number;
  reinspectionCount: number;
  passRatePercentage: number;
  passRate?: number;
  openCorrectiveActions: number;
  totalLabReports: number;
  verifiedLabReports?: number;
}
