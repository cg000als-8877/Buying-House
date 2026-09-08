import { z } from 'zod';

export const createOrderSchema = z.object({
  orderNumber: z.string().min(3, 'Order number is required'),
  buyerOrganizationId: z.string().min(1, 'Buyer organization is required'),
  styleNumber: z.string().min(2, 'Style number is required'),
  productName: z.string().min(2, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  factoryId: z.string().min(1, 'Factory assignment is required'),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
  currency: z.string().default('USD'),
  unitPrice: z.number().positive().optional(),
  orderDate: z.string().min(1, 'Order date is required'),
  exFactoryDate: z.string().min(1, 'Ex-factory date is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedMerchandiserId: z.string().min(1, 'Assigned merchandiser is required'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
