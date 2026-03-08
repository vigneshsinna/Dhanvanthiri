import { test, expect } from '@playwright/test';

test.describe('Guest order tracking page', () => {
  test('renders tracking form at /track-order', async ({ page }) => {
    await page.goto('/track-order');
    await expect(page.getByRole('heading', { name: /track.*order/i })).toBeVisible();
  });

  test('shows order number input field', async ({ page }) => {
    await page.goto('/track-order');
    const orderInput = page.getByLabel(/order.*number/i).or(
      page.locator('input[placeholder*="order" i]').first()
    );
    await expect(orderInput).toBeVisible();
  });

  test('shows email or phone input', async ({ page }) => {
    await page.goto('/track-order');
    const emailInput = page.getByLabel(/email/i).or(
      page.locator('input[type="email"]').first()
    );
    const phoneInput = page.getByLabel(/phone/i).or(
      page.locator('input[type="tel"]').first()
    );
    // At least one should be visible
    const emailVisible = await emailInput.isVisible().catch(() => false);
    const phoneVisible = await phoneInput.isVisible().catch(() => false);
    expect(emailVisible || phoneVisible).toBe(true);
  });

  test('has a submit/track button', async ({ page }) => {
    await page.goto('/track-order');
    const trackBtn = page.getByRole('button', { name: /track|find|search|submit/i });
    await expect(trackBtn).toBeVisible();
  });
});

test.describe('Wishlist page', () => {
  test('redirects to login if not authenticated', async ({ page }) => {
    await page.goto('/wishlist');
    // Should redirect to login or show login prompt
    await page.waitForTimeout(1000);
    const url = page.url();
    const hasLogin = url.includes('login') || url.includes('sign-in');
    const hasLoginPrompt = await page.getByText(/log.*in|sign.*in/i).first().isVisible().catch(() => false);
    expect(hasLogin || hasLoginPrompt).toBe(true);
  });
});

test.describe('Blog and legal pages', () => {
  test('blog list page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: /blog/i })).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/pages/about');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('FAQ page loads with questions', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByRole('heading', { name: /faq|frequently/i })).toBeVisible();
    // Should have interactive question items
    const questionButtons = page.locator('button, details summary');
    const count = await questionButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Cart integration', () => {
  test('cart page shows empty state', async ({ page }) => {
    await page.goto('/cart');
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
    // Should show "empty" or "no items" or a shop link
    const emptyText = page.getByText(/empty|no items|start shopping/i).first();
    const shopLink = page.getByRole('link', { name: /shop|browse|products/i }).first();
    const hasEmpty = await emptyText.isVisible().catch(() => false);
    const hasShop = await shopLink.isVisible().catch(() => false);
    expect(hasEmpty || hasShop).toBe(true);
  });

  test('product detail has Add to Cart button', async ({ page }) => {
    await page.goto('/products');
    const firstProduct = page.locator('a[href*="/products/"]').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });
    await firstProduct.click();
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  });
});

test.describe('Login page', () => {
  test('login page renders form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i).or(page.locator('input[type="email"]').first())).toBeVisible();
    await expect(page.getByLabel(/password/i).or(page.locator('input[type="password"]').first())).toBeVisible();
    await expect(page.getByRole('button', { name: /log.*in|sign.*in/i })).toBeVisible();
  });

  test('login page has register link', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.getByRole('link', { name: /register|sign.*up|create/i });
    await expect(registerLink).toBeVisible();
  });

  test('login page has forgot password link', async ({ page }) => {
    await page.goto('/login');
    const forgotLink = page.getByRole('link', { name: /forgot.*password/i }).or(
      page.getByText(/forgot.*password/i).first()
    );
    await expect(forgotLink).toBeVisible();
  });
});

test.describe('Register page', () => {
  test('register page renders form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByLabel(/name/i).or(page.locator('input[name="name"]').first())).toBeVisible();
    await expect(page.getByLabel(/email/i).or(page.locator('input[type="email"]').first())).toBeVisible();
    await expect(page.getByLabel(/password/i).first().or(page.locator('input[type="password"]').first())).toBeVisible();
  });
});
