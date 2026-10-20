import { expect, test } from '@playwright/test';

// Execute in the browser CI environment; not run during local audit patch preparation.
test('successful studies update a persistent concise status region', async ({ page }) => {
  await page.goto('./?study=load-step');
  const status = page.getByTestId('research-completion-status');
  await expect(status).toBeAttached();
  await expect(status).toHaveAttribute('role', 'status');
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await expect(status).toHaveAttribute('aria-atomic', 'true');
  await expect(status).toBeEmpty();
  await page.getByTestId('research-run').click();
  await expect(status).toHaveText(/complete\. Results are ready\./);
  await expect(page.getByTestId('research-results')).toContainText('Applied result');
  await page
    .getByRole('navigation', { name: 'Choose a power-dynamics study' })
    .getByRole('button')
    .nth(1)
    .click();
  await expect(status).toBeAttached();
  await expect(status).toBeEmpty();
});
