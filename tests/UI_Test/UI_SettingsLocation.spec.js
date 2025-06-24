import { test, expect } from '@playwright/test';
import config from '../UI_JSON/UI_SettingsLocation.json'; // Import the JSON file

test.use({ headless: false, browserName: 'chromium' }); // Run in headed mode on Chrome

test('UI_SettingsLocation_Test: Add a new location and verify success message', async ({ page }) => {
  await page.goto(config.url); // Use URL from JSON
  await page.locator('#ctl03_txtusername').click();
  await page.locator('#ctl03_txtusername').fill(config.login.username);
  await page.locator('#ctl03_txtpassword').click();
  await page.locator('#ctl03_txtpassword').fill(config.login.password);
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Location' }).click();
  await page.getByRole('link', { name: 'Add' }).click();
  await page.getByRole('button', { name: '+' }).click();

  // Generate random location name
  const randomLocationName = `ALoc_${Math.random().toString(36).substring(2, 8)}`;
  console.log(`Generated Location Name: ${randomLocationName}`);
  await page.getByRole('textbox', { name: '* Name' }).fill(randomLocationName);

  await page.getByRole('textbox', { name: 'External Location Id' }).click();
  await page.getByRole('textbox', { name: 'External Location Id' }).fill(config.location.externalLocationId); 
  await page.getByRole('textbox', { name: 'Address' }).click();
  await page.getByRole('textbox', { name: 'Address' }).fill(config.location.address);
  await page.getByRole('textbox', { name: 'City' }).click();
  await page.getByRole('textbox', { name: 'City' }).fill(config.location.city);
  await page.getByRole('textbox', { name: 'State' }).click();
  await page.getByRole('textbox', { name: 'State' }).fill(config.location.state);
  await page.getByRole('textbox', { name: 'Zip Code' }).click();
  await page.getByRole('textbox', { name: 'Zip Code' }).fill(config.location.zipCode);
  await page.getByRole('button', { name: 'Save' }).click();

  // Verify success message
  const successMessage = await page.locator(`text=${config.successMessage}`); 
  await expect(successMessage).toBeVisible(); // Assert that the success message is visible
  console.log('Location is saved successfully');
});