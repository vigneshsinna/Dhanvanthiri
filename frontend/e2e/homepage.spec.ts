import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads homepage with hero section', async ({ page }) => {
    await page.goto('/');
    // Wait for React to hydrate and Helmet to update title
    await page.waitForTimeout(1000);
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/dhanvanthiri|tamil|pickles|thokku/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('displays navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /products/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /about/i }).first()).toBeVisible();
  });

  test('hero CTA navigates to products', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /shop now|explore|browse/i }).first();
    if (await cta.isVisible()) {
      await cta.click();
      await expect(page).toHaveURL(/products/);
    }
  });

  test('footer is visible', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('announcement bar shows free shipping message', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/free shipping/i).first()).toBeVisible();
  });
});
