import { test, expect } from '@playwright/test';

test.describe('Product catalog', () => {
  test('loads product listing page', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('displays product cards', async ({ page }) => {
    await page.goto('/products');
    // Wait for products to render (from API or fallback data)
    const productLinks = page.locator('a[href*="/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10000 });
    const count = await productLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('product card links to product detail', async ({ page }) => {
    await page.goto('/products');
    const firstProduct = page.locator('a[href*="/products/"]').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });
    await firstProduct.click();
    await expect(page).toHaveURL(/\/products\/.+/);
  });
});

test.describe('Product detail page', () => {
  test('shows product name and price', async ({ page }) => {
    await page.goto('/products');
    const firstProduct = page.locator('a[href*="/products/"]').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });
    await firstProduct.click();
    // Product detail page should have an H1 with product name
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Price should be displayed with ₹ symbol
    await expect(page.getByText(/₹/).first()).toBeVisible();
  });

  test('has Add to Cart button', async ({ page }) => {
    await page.goto('/products');
    const firstProduct = page.locator('a[href*="/products/"]').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });
    await firstProduct.click();
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  });
});
