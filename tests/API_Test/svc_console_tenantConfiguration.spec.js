const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/svc_console_tenantConfiguration.json'); // Use the new JSON file

test('API_svcConsole_TenantConfiguration_Test: Tenant Configuration API', async ({ page }) => {
  let accessToken = '';

  // Capture the token from the login response
  page.on('response', async (response) => {
    if (response.url().includes(config.loginInfo.tokenEndpoint) && response.request().method() === 'POST') {
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
  await page.goto(config.loginInfo.loginUrl);
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(config.loginInfo.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(config.loginInfo.password);
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

  // Make the API call to the Tenant Configuration endpoint
  const configurationResponse = await apiContext.get(
    `${config.api.tenantConfiguration}/${config.api.locationCode}`
  );

  // Validate the Configuration API response
  expect(configurationResponse.ok()).toBeTruthy();
  const configurationResponseBody = await configurationResponse.json();
  console.log('Configuration API Response:', configurationResponseBody);

  // Add assertions based on the expected response structure
  expect(configurationResponseBody).toBeDefined();
  expect(configurationResponseBody).toHaveProperty('id'); // Example assertion for a property
});