import { test, expect } from '@playwright/test';

test.describe('Landing visuals', () => {
  test('header and cta', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'networkidle' });
    await expect(page.locator('.animate-pulse')).toHaveCount(0, { timeout: 10000 });

    const header = page.getByTestId('landing-header');
    await expect(header).toBeVisible();
    await expect(header).toHaveScreenshot('landing-header.png', { animations: 'disabled' });

    const cta = page.getByTestId('landing-cta');
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toHaveScreenshot('landing-cta.png', { animations: 'disabled' });
  });
});
