import { z } from 'zod';
import { getSampleSize } from '../quality/calculations';

export const INSPECTION_TYPES = [
  'PP_MEETING',
  'INLINE',
  'MIDLINE',
  'FINAL_RANDOM',
  'REINSPECTION',
] as const;

export const INSPECTION_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'] as const;

export const INSPECTION_RESULTS = ['PASS', 'CONDITIONAL', 'FAIL', 'PENDING'] as const;

export const DEFECT_SEVERITIES = ['CRITICAL', 'MAJOR', 'MINOR'] as const;

export const DEFECT_CATEGORIES = [
  'Workmanship',
  'Measurement',
  'Fabric / Material',
  'Color / Shade',
  'Cleanliness / Spots',
  'Packaging / Labeling',
  'Trims / Accessories',
  'Other',
] as const;

export const INSPECTION_LEVELS = ['GI', 'GII', 'GIII', 'S1', 'S2', 'S3', 'S4'] as const;

export const LAB_TEST_CATEGORIES = [
  'Color Fastness',
  'Washing Fastness',
  'Rubbing Fastness',
  'Shrinkage',
  'GSM',
  'Fabric Composition',
  'Fiber Composition',
  'Dimensional Stability',
  'Tensile Strength',
  'Tear Strength',
  'Flammability',
  'Seam Slippage',
  'Formaldehyde',
  'pH',
  'Restricted Substance Testing',
  'Other',
] as const;

export const LAB_VERIFICATION_STATUSES = ['VERIFIED', 'VERIFICATION_REQUIRED', 'PENDING'] as const;

export const defectItemSchema = z.object({
  id: z.string().optional(),
  category: z.enum(DEFECT_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid defect category' }),
  }),
  code: z.string().optional().or(z.literal('')),
  severity: z.enum(DEFECT_SEVERITIES, {
    errorMap: () => ({ message: 'Please select defect severity' }),
  }),
  quantity: z
    .number()
    .int('Defect count must be an integer')
    .min(1, 'Defect quantity must be at least 1')
    .max(100000, 'Defect count exceeds reasonable limit'),
  location: z.string().optional().or(z.literal('')),
  description: z
    .string()
    .min(3, 'Defect description must be at least 3 characters')
    .max(500, 'Defect description cannot exceed 500 characters'),
  photoUrl: z.string().url().optional().or(z.literal('')),
});

export type DefectItemInput = z.input<typeof defectItemSchema>;

export const createInspectionSchema = z
  .object({
    orderId: z.string().min(1, 'Purchase Order ID is required'),
    orderNumber: z.string().min(1, 'Order PO Number is required'),
    styleNumber: z.string().min(1, 'Style Number is required'),
    buyerOrganizationId: z.string().min(1, 'Buyer organization tenant context is required'),
    factoryId: z.string().min(1, 'Manufacturing factory unit is required'),
    inspectionType: z.enum(INSPECTION_TYPES, {
      errorMap: () => ({ message: 'Please select a valid inspection type' }),
    }),
    inspectionDate: z
      .string()
      .min(1, 'Inspection date is required')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Inspection date must be in YYYY-MM-DD format'),
    inspectorId: z.string().min(1, 'Inspector ID is required'),
    inspectorName: z.string().min(1, 'Inspector Name is required'),
    orderQuantity: z
      .number()
      .int('Order quantity must be an integer')
      .min(1, 'Order quantity must be greater than 0'),
    inspectedQuantity: z
      .number()
      .int('Inspected quantity must be an integer')
      .min(1, 'Inspected quantity must be greater than 0')
      .optional(),
    aqlLevel: z.enum(INSPECTION_LEVELS).default('GII'),
    aqlMajor: z.number().min(0.1, 'AQL Major must be > 0').default(2.5),
    aqlMinor: z.number().min(0.1, 'AQL Minor must be > 0').default(4.0),
    defects: z.array(defectItemSchema).default([]),
    remarks: z.string().max(2000).optional().or(z.literal('')),
    internalNotes: z.string().max(2000).optional().or(z.literal('')),
    reportDocumentId: z.string().optional().or(z.literal('')),
    reinspectionOfId: z.string().optional().or(z.literal('')),
    published: z.boolean().default(false),
  })
  .refine(
    (data) => {
      const sampleSize = data.inspectedQuantity || getSampleSize(data.orderQuantity, data.aqlLevel || 'GII');
      const totalDefects = (data.defects || []).reduce((sum, d) => sum + (d.quantity || 0), 0);
      return totalDefects <= sampleSize;
    },
    {
      message: 'Total defect count cannot exceed the inspected sample quantity',
      path: ['defects'],
    }
  );

export type CreateInspectionInput = z.input<typeof createInspectionSchema>;

export const updateInspectionSchema = z.object({
  inspectionId: z.string().min(1, 'Inspection ID is required'),
  inspectionStatus: z.enum(INSPECTION_STATUSES).optional(),
  inspectionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  inspectedQuantity: z.number().int().min(1).optional(),
  defects: z.array(defectItemSchema).optional(),
  remarks: z.string().max(2000).optional(),
  internalNotes: z.string().max(2000).optional(),
  reportDocumentId: z.string().optional().or(z.literal('')),
  published: z.boolean().optional(),
});

export type UpdateInspectionInput = z.input<typeof updateInspectionSchema>;

export const correctiveActionSchema = z.object({
  inspectionId: z.string().optional(),
  orderId: z.string().optional(),
  issueDescription: z
    .string()
    .max(1000, 'Issue description cannot exceed 1000 characters')
    .optional(),
  rootCause: z.string().max(1000).optional().or(z.literal('')),
  actionRequired: z
    .string()
    .max(1000, 'Action required cannot exceed 1000 characters')
    .optional(),
  actionPlan: z
    .string()
    .max(1000, 'Action plan cannot exceed 1000 characters')
    .optional(),
  responsibleParty: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format')
    .optional(),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format')
    .optional(),
  status: z
    .enum(['open', 'in_progress', 'completed', 'verified', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'])
    .default('open'),
  resolutionNotes: z.string().max(1000).optional().or(z.literal('')),
  verificationNotes: z.string().max(1000).optional().or(z.literal('')),
});

export type CorrectiveActionInput = z.input<typeof correctiveActionSchema>;

export const reinspectionRequestSchema = z.object({
  inspectionId: z.string().min(1, 'Original inspection ID is required'),
  reason: z
    .string()
    .min(5, 'Please provide reason for re-inspection')
    .max(1000, 'Reason cannot exceed 1000 characters'),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format')
    .optional(),
});

export type ReinspectionRequestInput = z.input<typeof reinspectionRequestSchema>;

export const labTestReportSchema = z.object({
  reportNumber: z.string().min(1, 'Lab report number/ID is required'),
  testCategory: z.enum(LAB_TEST_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid laboratory test category' }),
  }),
  labName: z.string().min(2, 'Laboratory name is required'),
  reportDate: z
    .string()
    .min(1, 'Report date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Report date must be in YYYY-MM-DD format'),
  sampleReference: z.string().optional().or(z.literal('')),
  orderId: z.string().min(1, 'Purchase Order ID is required'),
  orderNumber: z.string().optional().or(z.literal('')),
  buyerOrganizationId: z.string().min(1, 'Buyer organization tenant context is required'),
  documentId: z.string().optional().or(z.literal('')),
  documentUrl: z.string().url().optional().or(z.literal('')),
  fileName: z.string().optional().or(z.literal('')),
  result: z.enum(['PASS', 'FAIL', 'CONDITIONAL']).default('PASS'),
  verificationStatus: z.enum(LAB_VERIFICATION_STATUSES).default('VERIFICATION_REQUIRED'),
  visibility: z.enum(['buyer', 'internal']).default('buyer'),
  remarks: z.string().max(1000).optional().or(z.literal('')),
  testParameters: z
    .array(
      z.object({
        parameter: z.string(),
        standard: z.string(),
        result: z.string(),
        pass: z.boolean(),
      })
    )
    .optional(),
  published: z.boolean().default(false),
});

export type LabTestReportInput = z.input<typeof labTestReportSchema>;

export const qualityConfigSchema = z.object({
  defaultLevel: z.enum(INSPECTION_LEVELS).default('GII'),
  majorAQL: z.number().min(0.1).max(10.0).default(2.5),
  minorAQL: z.number().min(0.1).max(15.0).default(4.0),
  criticalAQL: z.number().min(0).max(1.0).default(0.0),
  allowConditionalMinor: z.boolean().default(true),
});

export type QualityConfigInput = z.input<typeof qualityConfigSchema>;
