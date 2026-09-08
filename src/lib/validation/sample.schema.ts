import { z } from 'zod';

export const SAMPLE_TYPES = [
  'Proto Sample',
  'Fit Sample',
  'Size Set',
  'Salesman Sample',
  'Pre-Production (PP)',
  'Top of Production (TOP)',
  'Shipment Sample',
  'Lab Dip / Strike-Off',
] as const;

export const SAMPLE_STATUSES = [
  'draft',
  'in_development',
  'submitted',
  'approved',
  'changes_requested',
  'rejected',
] as const;

export const createSampleSchema = z.object({
  orderId: z.string().min(1, 'Order reference is required'),
  buyerOrganizationId: z.string().min(1, 'Buyer organization tenant is required'),
  sampleType: z.enum(SAMPLE_TYPES, {
    errorMap: () => ({ message: 'Please select a valid sample type' }),
  }),
  targetDate: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: 'Target date must follow YYYY-MM-DD format',
    }),
  courierName: z.string().max(100).optional().or(z.literal('')),
  trackingNumber: z.string().max(100).optional().or(z.literal('')),
  internalRemarks: z.string().max(1500, 'Internal remarks cannot exceed 1500 characters').optional().or(z.literal('')),
  buyerRemarks: z.string().max(1500, 'Buyer remarks cannot exceed 1500 characters').optional().or(z.literal('')),
  status: z.enum(SAMPLE_STATUSES).default('draft'),
});

export type CreateSampleInput = z.infer<typeof createSampleSchema>;

export const buyerSampleDecisionSchema = z
  .object({
    sampleId: z.string().min(1, 'Sample ID is required'),
    decision: z.enum(['approved', 'changes_requested', 'rejected'], {
      errorMap: () => ({ message: 'Decision must be Approved, Changes Requested, or Rejected' }),
    }),
    feedback: z.string().max(2000, 'Feedback cannot exceed 2000 characters').optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if ((data.decision === 'changes_requested' || data.decision === 'rejected') && (!data.feedback || data.feedback.trim().length < 5)) {
        return false;
      }
      return true;
    },
    {
      message: 'Detailed feedback is required when requesting changes or rejecting a sample (minimum 5 characters).',
      path: ['feedback'],
    }
  );

export type BuyerSampleDecisionInput = z.infer<typeof buyerSampleDecisionSchema>;

export const sampleAttachmentSchema = z.object({
  sampleId: z.string().min(1, 'Sample ID is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.string().min(1, 'File size is required'),
  fileType: z.string().min(1, 'File type is required'),
  caption: z.string().max(255).optional().or(z.literal('')),
  visibility: z.enum(['buyer', 'internal']).default('buyer'),
  url: z.string().url('Attachment URL must be valid').optional().or(z.literal('')),
});

export type SampleAttachmentInput = z.infer<typeof sampleAttachmentSchema>;

export const createSampleRevisionSchema = z.object({
  sampleId: z.string().min(1, 'Sample ID is required'),
  revisionNotes: z.string().min(3, 'Please provide notes explaining this new revision round'),
  targetDate: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: 'Target date must follow YYYY-MM-DD format',
    }),
});

export type CreateSampleRevisionInput = z.infer<typeof createSampleRevisionSchema>;
