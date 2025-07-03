const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/accountconfiguration.json');

test('API_AccountConfiguration_Test:Account Configuration API', async ({ page }) => {
  let accessToken = '';

  page.on('response', async (response) => {
    if (response.url().includes(config.tokenEndpoint) && response.request().method() === 'POST') {
      try {
        const json = await response.json();
        accessToken = json.access_token;
        console.log('✅ Access Token:', accessToken);
      } catch (err) {
        console.error('❌ Failed to parse token response:', err);
      }
    }
  });

  await page.goto(config.loginUrl);
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(config.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(config.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.waitForTimeout(5000);
  expect(accessToken).toBeTruthy();

  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers,
      'authorization': `Bearer ${accessToken}`,
    }
  });

  const response = await apiContext.get(config.api.accountConfiguration);
  console.log('📡 API Status:', response.status());

  const responseBody = await response.text();
  const beautifiedJson = JSON.stringify(JSON.parse(responseBody), null, 2);
  console.log('📦 Beautified API Response:\n', beautifiedJson);

  const json = JSON.parse(responseBody);

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(json).toHaveProperty('Result.dashboardInfo.accountSettings');
  expect(Array.isArray(json.Result.dashboardInfo.accountSettings)).toBe(true);
  expect(json.Result.dashboardInfo.accountSettings.length).toBeGreaterThan(0);
});