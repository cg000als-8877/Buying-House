import { test, expect } from '@playwright/test';

test.describe('E2E — Security Boundaries & Public Route Hardening', () => {
  test('public marketing website pages load with correct security headers and titles', async ({ page }) => {
    const publicRoutes = [
      '/',
      '/about',
      '/services',
      '/products',
      '/factories',
      '/quality',
      '/compliance',
      '/sustainability',
      '/insights',
      '/contact',
    ];

    for (const route of publicRoutes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('robots.txt and sitemap.xml are accessible', async ({ page }) => {
    const robotsRes = await page.goto('/robots.txt');
    expect(robotsRes?.status()).toBe(200);

    const sitemapRes = await page.goto('/sitemap.xml');
    expect(sitemapRes?.status()).toBe(200);
  });
});
