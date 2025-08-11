const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/svc_console_tenantStatusDel.json'); // Assuming the JSON file contains login and API details

test('API_svcConsole_TenantStatusDelete_Test: Delete Tenant Status API', async ({ page }) => {
  let accessToken = '';

  // Capture the token from the login response
  page.on('response', async (response) => {
    if (response.url().includes(config.tokenEndpoint) && response.request().method() === 'POST') {
      try {
        const json = await response.json();
        if (json && json.access_token) {
          accessToken = json.access_token;
          console.log('Access Token:', accessToken);
        } else {
          console.error('Access token not found in response:', json);
        }
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
  await page.waitForTimeout(5000); // Wait for the response to be processed
  expect(accessToken).toBeTruthy(); // Ensure the token is captured

  // Create a new API context with the token
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers,
      authorization: `Bearer ${accessToken}`,
    },
  });

  // Make the DELETE API call
  const tenantId = 8; // Replace with the actual tenant ID
  const statusId = 1; // Replace with the actual status ID
  const deleteUrl = `${config.api.deleteTenantStatus}/${tenantId}/${statusId}`;

  const response = await apiContext.delete(deleteUrl);

  // Validate the API response
  expect(response.ok()).toBeTruthy();
  const responseBody = await response.json();
  console.log('API Response:', responseBody);

  // Add assertions based on the expected response structure
  expect(responseBody).toBeDefined();
});
