import { test, expect } from '@playwright/test';

test.describe('Platform Foundation Smoke Tests', () => {
  test('public homepage renders successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Buying House/i);
  });

  test('buyer login route resolves without 404', async ({ page }) => {
    await page.goto('/buyer/login');
    await expect(page.locator('h1')).toContainText(/Buyer/i);
  });

  test('admin login route resolves without 404', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('h1')).toContainText(/Operations Center/i);
  });
});
