const { test, expect, request } = require('@playwright/test');
const loginInfo = require('../../utils/commonConfig/loginInfo.json');
const apiEndpoints = require('../../utils/commonConfig/apiEndpoints.json');
const headers = require('../../utils/commonConfig/headers.json');
const reportRequestBody = require('../../data/API_JSON/svc_console_reportAnalytic.json');

test('API_ReportAnalytic_Test: Report Analytic API', async ({ page }) => {
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
  console.log('Navigated to URL:', loginInfo.loginUrl);

  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(loginInfo.email);
  console.log('Filled Email:', loginInfo.email);

  await page.getByRole('textbox', { name: 'Password' }).fill(loginInfo.password);
  console.log('Filled Password: [HIDDEN]');

  await page.getByRole('button', { name: 'Log in' }).click();
  console.log('Clicked Login Button');

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
  console.log('Headers:', {
    ...headers,
    authorization: `Bearer ${accessToken}`,
  });

  // Make the API call to the Report Analytic endpoint
  console.log('Making API call to:', apiEndpoints.reportAnalytic);
  console.log('Request Body:', JSON.stringify(reportRequestBody, null, 2));

  const response = await apiContext.post(apiEndpoints.reportAnalytic, {
    data: reportRequestBody,
  });

  // Validate the API response
  console.log('Response Status:', response.status());
  expect(response.ok()).toBeTruthy();

  const responseBody = await response.json();
  console.log('Response Body (Beautified):', JSON.stringify(responseBody, null, 2));

  // Add assertions based on the expected response structure
  expect(responseBody).toBeDefined();
});