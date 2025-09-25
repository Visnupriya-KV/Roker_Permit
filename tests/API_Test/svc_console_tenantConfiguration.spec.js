const { test, expect, request } = require('@playwright/test');
const loginInfo = require('../../utils/commonConfig/loginInfo.json');
const apiEndpoints = require('../../utils/commonConfig/apiEndpoints.json');
const headers = require('../../utils/commonConfig/headers.json');
const locCode = require('../../data/API_JSON/svc_console_tenantConfiguration.json');


test('API_svcConsole_TenantConfiguration_Test: Tenant Configuration API', async ({ page }) => {
  let accessToken = '';

  // Capture the token from the login response
  page.on('response', async (response) => {
    if (response.url().includes(loginInfo.tokenEndpoint) && response.request().method() === 'POST') {
      try {
        const json = await response.json();
        accessToken = json.access_token;
        console.log('Access Token:', accessToken);
      } catch (err) {
        console.error('Failed to parse token response:', err);
      }
    }
  });

  // Perform login
  await page.goto(loginInfo.loginUrl);
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(loginInfo.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(loginInfo.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for the token to be captured
  await page.waitForTimeout(5000);
  expect(accessToken).toBeTruthy();

  // Create a new API context with the token
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...headers,
      authorization: `Bearer ${accessToken}`,
    },
  });

  // Make the API call to the Tenant Configuration endpoint
  const response = await apiContext.get(
    `${apiEndpoints.tenantConfiguration}/${locCode.locationCode}`
  );

  // Validate the API response
  expect(response.ok()).toBeTruthy();
  const responseBody = await response.json();
  console.log('Tenant Configuration API Response:', responseBody);

  // Add assertions based on the expected response structure
  expect(responseBody).toBeDefined();
});
