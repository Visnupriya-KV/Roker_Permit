const { test, expect, request } = require('@playwright/test');
const loginInfo = require('../../utils/commonConfig/loginInfo.json');
const apiEndpoints = require('../../utils/commonConfig/apiEndpoints.json');
const headers = require('../../utils/commonConfig/headers.json');
const requestBody = require('../../data/API_JSON/svc_console_emailNotificationTemplatesEdit.json');

test('API_svcConsole_EmailNotificationTemplatesEdit_Test: Edit Email Notification Template API', async ({ page }) => {
  let accessToken = '';

  // Capture the token from the login response
  page.on('response', async (response) => {
    if (response.url().includes(loginInfo.tokenEndpoint) && response.request().method() === 'POST') {
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
  await page.goto(loginInfo.loginUrl);
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(loginInfo.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(loginInfo.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for the token to be captured
  await page.waitForTimeout(5000); // Wait for the response to be processed
  expect(accessToken).toBeTruthy(); // Ensure the token is captured

  // Create a new API context with the token
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...headers,
      authorization: `Bearer ${accessToken}`, // Pass the captured token
    },
  });

  // Log the request details
  console.log('Request URL:', apiEndpoints.emailNotificationTemplateEdit);
  console.log('Request Headers:', {
    ...headers,
    authorization: `Bearer ${accessToken}`,
  });
  console.log('Request Body:', requestBody);

  // Make the PUT API call
  const apiUrl = apiEndpoints.emailNotificationTemplateEdit;
  const response = await apiContext.put(apiUrl, {
    data: requestBody, // Pass the request body from JSON
  });

  // Validate the API response
  expect(response.ok()).toBeTruthy();
  const responseBody = await response.json();

  // Log the response details
  console.log('Response Status:', response.status());
  console.log('Response Body:', responseBody);

  // Add assertions based on the expected response structure
  expect(responseBody).toBeDefined();
});