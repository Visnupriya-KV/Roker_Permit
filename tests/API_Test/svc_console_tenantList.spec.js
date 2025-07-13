// filepath: [svc_Console_tenantList.spec.js](http://_vscodecontentref_/0)
const { test, expect, request } = require('@playwright/test');
const loginInfo = require('../commonConfig/loginInfo.json');
const apiEndpoints = require('../commonConfig/apiEndpoints.json');
const headers = require('../commonConfig/headers.json');

test('API_svcConsole_TenantList_Test: Tenant List API', async ({ page }) => {
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

  // Make the API call to the Tenant List endpoint
  const response = await apiContext.post(apiEndpoints.tenantList, {
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