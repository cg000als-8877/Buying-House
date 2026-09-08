import { describe, it, expect } from 'vitest';
import { loginSchema, inquirySchema, createOrderSchema } from '@/lib/validation';

describe('Zod Validation Schemas', () => {
  it('validates authentic login payload', () => {
    const valid = loginSchema.safeParse({
      email: 'buyer@nordic.com',
      password: 'securePassword123',
    });
    expect(valid.success).toBe(true);

    const invalid = loginSchema.safeParse({
      email: 'invalid-email',
      password: '123',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates inquiry payload and enforces required fields', () => {
    const valid = inquirySchema.safeParse({
      name: 'John Doe',
      company: 'Apparel Group',
      country: 'United Kingdom',
      email: 'john@apparel.com',
      productCategory: 'Knitwear',
      estimatedQuantity: '1000 pcs',
      message: 'Looking for 100% organic cotton t-shirts.',
    });
    expect(valid.success).toBe(true);

    const invalid = inquirySchema.safeParse({
      name: 'J',
      company: '',
      country: '',
      email: 'not-an-email',
      productCategory: '',
      estimatedQuantity: '',
      message: 'short',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates order payload with positive integer quantities', () => {
    const valid = createOrderSchema.safeParse({
      orderNumber: 'PO-2026-001',
      buyerOrganizationId: 'org-1',
      styleNumber: 'ST-900',
      productName: 'Heavyweight Tee',
      category: 'Knitwear',
      factoryId: 'fac-1',
      quantity: 5000,
      currency: 'USD',
      orderDate: '2026-01-01',
      exFactoryDate: '2026-03-01',
      priority: 'high',
      assignedMerchandiserId: 'usr-1',
    });
    expect(valid.success).toBe(true);

    const invalidQty = createOrderSchema.safeParse({
      orderNumber: 'PO-2026-001',
      buyerOrganizationId: 'org-1',
      styleNumber: 'ST-900',
      productName: 'Heavyweight Tee',
      category: 'Knitwear',
      factoryId: 'fac-1',
      quantity: -50,
      orderDate: '2026-01-01',
      exFactoryDate: '2026-03-01',
      assignedMerchandiserId: 'usr-1',
    });
    expect(invalidQty.success).toBe(false);
  });
});
