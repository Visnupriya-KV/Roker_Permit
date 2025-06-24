import { test, expect } from '@playwright/test';
test.use({ headless: false, browserName: 'chromium' }); // Run in headed mode on Chrome

test('test', async ({ page }) => {
  await page.goto('https://development.vms.staging.rokerplus.com/Login.aspx');
  await page.locator('#ctl03_txtusername').click();
  await page.locator('#ctl03_txtusername').fill('administrator');
  await page.locator('#ctl03_txtpassword').click();
  await page.locator('#ctl03_txtpassword').click();
  await page.locator('#ctl03_txtpassword').fill('DemoUser@1');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Fee Structures' }).click();
  await page.getByRole('link', { name: 'Edit' }).click();
  await page.getByRole('link', { name: 'Add Fee Structure' }).click();
  await page.getByRole('radio', { name: 'Action' }).check();
  await page.locator('#MainContent_ctl00_txtFeeName').click();

  // Generate random fee structure name
  const randomFeeName = `AutoF_${Math.random().toString(36).substring(2, 8)}`;
  console.log(`Generated Fee Structure Name: ${randomFeeName}`);
  await page.locator('#MainContent_ctl00_txtFeeName').fill(randomFeeName);

  //await page.locator('#MainContent_ctl00_txtFeeName').fill('GenTestAction');
  await page.locator('#ddlActions').selectOption('NIC');
  await page.locator('#txtFees').click();
  await page.locator('#txtFees').fill('1');
  await page.locator('#MainContent_ctl00_txtFeeName').dblclick();
  await page.locator('#MainContent_ctl00_txtFeeName').press('ControlOrMeta+c');
  await page.getByRole('button', { name: 'Add Fee' }).click();
  await page.goto('https://development.vms.staging.rokerplus.com/IAdmin/EditFeeStructure.aspx?FeeStructureId=66', { waitUntil: 'networkidle' });
  await page.waitForSelector('body'); // Ensure page is fully loaded
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.waitForSelector('#btnDeleteFeeStructureDetails', { state: 'visible' }); // Wait for the delete button to appear
  await page.locator('#btnDeleteFeeStructureDetails').click();
});