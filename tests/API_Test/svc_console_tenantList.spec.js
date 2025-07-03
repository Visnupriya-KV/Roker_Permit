const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/svc_Console_tenantList.json'); // Updated to use tenantList.json

test('API_svcConsole_TenantList_Test: Tenant List API', async ({ page }) => {
  let accessToken = '';

  // Capture the token from the login response
  page.on('response', async (response) => {
    if (response.url().includes(config.tokenEndpoint) && response.request().method() === 'POST') {
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
  await page.goto(config.loginUrl);
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(config.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(config.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for the token to be captured
  await page.waitForTimeout(5000);
  expect(accessToken).toBeTruthy();

  // Create a new API context with the token
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers,
      authorization: `Bearer ${accessToken}`,
    },
  });

  // Make the API call to the Tenant List endpoint
  const response = await apiContext.post(config.api.tenantList, {
    data: { searchText: '' },
  });

  // Validate the API response
  expect(response.ok()).toBeTruthy();
  const responseBody = await response.json();
  console.log('API Response:', responseBody);

  // Add assertions based on the expected response structure
  expect(responseBody).toBeDefined();
  expect(Array.isArray(responseBody)).toBeTruthy(); // Validate that the response is an array
  expect(responseBody.length).toBeGreaterThan(0); // Ensure the array is not empty
});

