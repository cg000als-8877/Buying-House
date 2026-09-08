import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
