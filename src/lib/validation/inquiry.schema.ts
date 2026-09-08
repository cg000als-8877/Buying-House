import { z } from 'zod';

export const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().min(2, 'Company name is required'),
  country: z.string().min(2, 'Country is required'),
  email: z.string().email('Please enter a valid work email'),
  phone: z.string().optional(),
  productCategory: z.string().min(1, 'Please select an apparel category'),
  estimatedQuantity: z.string().min(1, 'Estimated quantity is required'),
  targetDeliveryDate: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
