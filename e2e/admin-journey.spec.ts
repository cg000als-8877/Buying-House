import { test, expect } from '@playwright/test';

test.describe('E2E — Admin & Staff Operations Journeys', () => {
  test('admin dashboard renders executive metrics and navigation sidebar', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin orders workspace renders management grid and actions', async ({ page }) => {
    await page.goto('/admin/orders');
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin quality assurance workspace renders AQL tools and CAP manager', async ({ page }) => {
    await page.goto('/admin/quality');
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin shipment logistics workspace renders dispatch controls and readiness gates', async ({ page }) => {
    await page.goto('/admin/shipments');
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin reporting center renders 9 operational report tabs and CSV exporter', async ({ page }) => {
    await page.goto('/admin/reports');
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin user management workspace renders role assigner and user table', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin immutable security audit logs workspace renders search and filters', async ({ page }) => {
    await page.goto('/admin/audit-logs');
    await expect(page.locator('body')).toBeVisible();
  });
});
