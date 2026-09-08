import { z } from 'zod';

export const DOCUMENT_CATEGORIES = [
  'Tech Pack',
  'Specification',
  'Artwork',
  'Sample',
  'Approval',
  'Purchase Order',
  'Order Confirmation',
  'Quality',
  'Inspection',
  'Compliance',
  'Test Report',
  'Production',
  'Shipment',
  'Commercial',
  'Certificate',
  'Other',
] as const;

export const DOCUMENT_VISIBILITIES = ['buyer', 'internal', 'restricted'] as const;

export const DOCUMENT_STATUSES = ['active', 'draft', 'archived'] as const;

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
] as const;

export const MAX_DOCUMENT_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const createDocumentSchema = z.object({
  title: z
    .string()
    .min(2, 'Document title must be at least 2 characters')
    .max(120, 'Document title cannot exceed 120 characters'),
  category: z.enum(DOCUMENT_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid document category' }),
  }),
  visibility: z.enum(DOCUMENT_VISIBILITIES, {
    errorMap: () => ({ message: 'Please select a valid visibility scope' }),
  }).default('buyer'),
  status: z.enum(DOCUMENT_STATUSES).default('active'),
  buyerOrganizationId: z
    .string()
    .min(1, 'Buyer organization tenant context is required'),
  orderId: z.string().optional().or(z.literal('')),
  orderNumber: z.string().optional().or(z.literal('')),
  styleNumber: z.string().optional().or(z.literal('')),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z
    .number()
    .min(1, 'File size must be greater than 0')
    .max(MAX_DOCUMENT_FILE_SIZE, 'File size cannot exceed 50MB'),
  mimeType: z.enum(ALLOWED_MIME_TYPES, {
    errorMap: () => ({ message: 'Unsupported MIME type' }),
  }),
  url: z.string().url().optional().or(z.literal('')),
});

export type CreateDocumentInput = z.input<typeof createDocumentSchema>;

export const createDocumentRevisionSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z
    .number()
    .min(1, 'File size must be greater than 0')
    .max(MAX_DOCUMENT_FILE_SIZE, 'File size cannot exceed 50MB'),
  mimeType: z.enum(ALLOWED_MIME_TYPES, {
    errorMap: () => ({ message: 'Unsupported MIME type' }),
  }),
  changeNote: z
    .string()
    .min(3, 'Change note must be at least 3 characters explaining this revision')
    .max(500, 'Change note cannot exceed 500 characters'),
  url: z.string().url().optional().or(z.literal('')),
});

export type CreateDocumentRevisionInput = z.input<typeof createDocumentRevisionSchema>;

export const updateDocumentMetadataSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(120).optional(),
  category: z.enum(DOCUMENT_CATEGORIES).optional(),
  visibility: z.enum(DOCUMENT_VISIBILITIES).optional(),
  status: z.enum(DOCUMENT_STATUSES).optional(),
  description: z.string().max(1000).optional(),
  orderId: z.string().optional().or(z.literal('')),
  orderNumber: z.string().optional().or(z.literal('')),
});

export type UpdateDocumentMetadataInput = z.input<typeof updateDocumentMetadataSchema>;

export const archiveDocumentSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  reason: z.string().max(500).optional().or(z.literal('')),
});

export type ArchiveDocumentInput = z.input<typeof archiveDocumentSchema>;
