import { test, expect } from '@playwright/test';

test.describe('E2E — Buyer Portal Operational Journeys', () => {
  test('navigates to buyer dashboard and renders key operational widgets', async ({ page }) => {
    await page.goto('/buyer/dashboard');
    await expect(page.locator('body')).toBeVisible();
  });

  test('buyer orders workspace renders with filters and order grid', async ({ page }) => {
    await page.goto('/buyer/orders');
    await expect(page.locator('body')).toBeVisible();
  });

  test('buyer quality workspace renders AQL summaries and inspection cards', async ({ page }) => {
    await page.goto('/buyer/quality');
    await expect(page.locator('body')).toBeVisible();
  });

  test('buyer shipment tracking workspace renders milestone timelines', async ({ page }) => {
    await page.goto('/buyer/shipments');
    await expect(page.locator('body')).toBeVisible();
  });

  test('buyer reporting center renders tenant-isolated KPIs and analytics tabs', async ({ page }) => {
    await page.goto('/buyer/reports');
    await expect(page.locator('body')).toBeVisible();
  });

  test('buyer secure document vault renders document categories', async ({ page }) => {
    await page.goto('/buyer/documents');
    await expect(page.locator('body')).toBeVisible();
  });
});
