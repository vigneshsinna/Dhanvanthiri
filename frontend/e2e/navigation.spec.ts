import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navigates to About page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /about/i }).first().click();
    await expect(page).toHaveURL(/about/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('navigates to FAQ page', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByRole('heading', { name: /frequently asked questions/i })).toBeVisible();
  });

  test('navigates to Blog page', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: /blog/i })).toBeVisible();
  });

  test('navigates to Cart page', async ({ page }) => {
    await page.goto('/cart');
    // Cart page should show either cart items or empty state
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByText(/404|not found/i).first()).toBeVisible();
  });
});

test.describe('Mobile navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('hamburger menu opens on mobile', async ({ page }) => {
    await page.goto('/');
    const hamburger = page.getByRole('button', { name: /menu|toggle/i }).or(
      page.locator('button').filter({ has: page.locator('svg') }).first()
    );
    if (await hamburger.isVisible()) {
      await hamburger.click();
      // Mobile nav should appear with links
      await expect(page.getByRole('link', { name: /products/i }).first()).toBeVisible();
    }
  });
});
