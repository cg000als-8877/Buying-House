import { z } from 'zod';

export const createProductionUpdateSchema = z.object({
  orderId: z.string().min(1, 'Order reference ID is required'),
  buyerOrganizationId: z.string().min(1, 'Buyer organization tenant ID is required'),
  productionStageId: z.string().min(1, 'Production stage reference is required'),
  stageKey: z.string().min(1, 'Stage key is required'),
  stageName: z.string().min(1, 'Stage name is required'),
  productionDate: z
    .string()
    .min(1, 'Production date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Production date must follow YYYY-MM-DD format'),
  plannedQuantity: z
    .number({ invalid_type_error: 'Planned quantity must be a valid number' })
    .min(0, 'Planned quantity cannot be negative'),
  actualQuantity: z
    .number({ invalid_type_error: 'Actual quantity must be a valid number' })
    .min(0, 'Actual quantity cannot be negative'),
  remarks: z.string().max(1000, 'Remarks cannot exceed 1000 characters').optional().or(z.literal('')),
  issues: z.string().max(1000, 'Issues description cannot exceed 1000 characters').optional().or(z.literal('')),
  correctiveAction: z.string().max(1000, 'Corrective action cannot exceed 1000 characters').optional().or(z.literal('')),
  status: z.enum(['draft', 'submitted', 'published', 'rejected']).default('draft'),
});

export type CreateProductionUpdateInput = z.infer<typeof createProductionUpdateSchema>;

export const updateProductionStageSchema = z.object({
  stageId: z.string().min(1, 'Stage ID is required'),
  stageName: z.string().min(1, 'Stage name is required'),
  enabled: z.boolean(),
  plannedQuantity: z.number().min(0, 'Planned quantity cannot be negative'),
  targetStartDate: z.string().optional(),
  targetEndDate: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'delayed']).default('not_started'),
});

export type UpdateProductionStageInput = z.infer<typeof updateProductionStageSchema>;

export const productionPhotoSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  productionUpdateId: z.string().min(1, 'Production update ID is required'),
  caption: z.string().max(255, 'Caption cannot exceed 255 characters').optional().or(z.literal('')),
  fileSize: z.number().max(20 * 1024 * 1024, 'Photo file size must not exceed 20MB'),
  fileType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'], {
    errorMap: () => ({ message: 'Only JPG, PNG, and WEBP images are supported' }),
  }),
});
