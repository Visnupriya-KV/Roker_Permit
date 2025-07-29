import { test, expect } from '@playwright/test';

test.use({ headless: false, browserName: 'chromium' }); // Run in headed mode on Chrome

test('test', async ({ page }) => {
  await page.goto('https://citycanada.app.develop.rokersmartpermits.com/homepage/default');
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill('automationtest@mailinator.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Autotest@123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('heading', { name: 'RokerPLUS' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'WelcomeAUTOMATION!' })).toBeVisible();
  await expect(page.locator('section')).toBeVisible();
});