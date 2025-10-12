import { test, expect } from '@playwright/test';

const MOCK_DATE_ONE = /August 24, 2025/;
const MOCK_DATE_TWO = /August 25, 2025/;

// The mock data should be displayed automatically when no archive export exists in /public.
test.describe('Mock data fallback', () => {
  test('renders conversations from bundled mock data', async ({ page }) => {
    await page.goto('/day/2025-08-24');

    const dateButton = page.getByRole('button', { name: 'Open date picker' });
    await expect(dateButton).toHaveText(MOCK_DATE_ONE);

    await expect(page.getByText('Friend One', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'View 1 orphaned media items' })
    ).toBeVisible();

    const nextDayButton = page.getByRole('button', { name: 'Next day' });
    await expect(nextDayButton).toBeEnabled();
    await nextDayButton.click();

    await expect(dateButton).toHaveText(MOCK_DATE_TWO);

    await expect(page.getByText('Mock Group', { exact: true })).toBeVisible();
  });
});
