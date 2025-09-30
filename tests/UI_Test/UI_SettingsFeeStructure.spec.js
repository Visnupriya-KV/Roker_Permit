import { test, expect } from '@playwright/test';
import config from '../../data/UI_JSON/UI_SettingsFeeStructure.json'; // Import the JSON file

test.use({ headless: false, browserName: 'chromium' }); // Run in headed mode on Chrome

test('UI_SettingsFeeStructure_Test: Add a Fee Structure on Settings', async ({ page }) => {
  // Navigate to the login page
  await page.goto(config.url); // Use URL from JSON
  await page.locator('#ctl03_txtusername').click();
  await page.locator('#ctl03_txtusername').fill(config.login.username); // Use username from JSON
  await page.locator('#ctl03_txtpassword').click();
  await page.locator('#ctl03_txtpassword').fill(config.login.password); // Use password from JSON
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Fee Structures' }).click();
  await page.getByRole('link', { name: 'Add' }).click();

  // Generate random fee structure name
  const randomFeeName = `AutoF_${Math.random().toString(36).substring(2, 8)}`;
  console.log(`Generated Fee Structure Name: ${randomFeeName}`);
  await page.locator('#MainContent_ctl00_txtFeeName').fill(randomFeeName);

  // Use values from JSON for fee structure details
  await page.getByRole('cell', { name: 'Days' }).click();
  await page.getByRole('radio', { name: 'Days' }).check();
  await page.locator('#txtFeeDays').click();
  await page.locator('#txtFeeDays').fill(config.feeStructure.days); // Use days from JSON
  await page.locator('#txtFees').click();
  await page.locator('#txtFees').fill(config.feeStructure.fees); // Use fees from JSON
  await page.getByRole('button', { name: 'Add Fee' }).click();
});