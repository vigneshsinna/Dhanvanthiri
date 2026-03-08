import { test, expect } from '@playwright/test';

test.describe('SEO & Accessibility', () => {
  test('homepage has meta description', async ({ page }) => {
    await page.goto('/');
    // Wait for Helmet to populate meta tags
    await page.waitForTimeout(2000);
    const metas = await page.locator('meta[name="description"]').all();
    const hasContent = metas.length > 0;
    expect(hasContent).toBe(true);
  });

  test('about page has Helmet title', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveTitle(/dhanvanthiri/i);
  });

  test('products page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/products');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('images have alt attributes', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // alt should exist (can be empty string for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('page has lang attribute', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('links have discernible text', async ({ page }) => {
    await page.goto('/');
    const links = page.getByRole('link');
    const count = await links.count();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const text = await links.nth(i).textContent();
      const ariaLabel = await links.nth(i).getAttribute('aria-label');
      const title = await links.nth(i).getAttribute('title');
      const hasChild = await links.nth(i).locator('img, svg').count();
      // Link should have text, aria-label, title, or child image/svg
      expect(text?.trim() || ariaLabel || title || hasChild > 0).toBeTruthy();
    }
  });

  test('FAQ page has structured content', async ({ page }) => {
    await page.goto('/faq');
    // FAQ page should have FAQ questions visible as clickable buttons
    await expect(page.getByRole('heading', { name: /frequently asked questions/i })).toBeVisible();
    // Questions are rendered as buttons
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});
