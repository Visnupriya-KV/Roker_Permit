const { test, expect, request } = require('@playwright/test');
const loginInfo = require('../../utils/commonConfig/loginInfo.json');
const apiEndpoints = require('../../utils/commonConfig/apiEndpoints.json');
const headers = require('../../utils/commonConfig/headers.json');

test('API_svcNotification_NotificationSettingsList_Test: Fetch Notification Settings List API', async ({ page }) => {
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
      accept: headers.accept, // Pass the 'accept' key-value
      authorization: `Bearer ${accessToken}`, // Pass the captured Authorization token
    },
  });

  // Log the request details
  console.log('Request URL:', apiEndpoints.notificationSettingsList);
  console.log('Request Headers:', {
    accept: headers.accept,
    authorization: `Bearer ${accessToken}`,
  });

  // Make the POST API call
  const apiUrl = apiEndpoints.notificationSettingsList;
  const response = await apiContext.get(apiUrl);

  // Validate the API response
  expect(response.ok()).toBeTruthy();
  const responseBody = response.status() === 200 ? await response.json() : null;
  if (!responseBody) {
    throw new Error('Invalid or empty response body');
  }

  // Log the response details
  console.log('Response Status:', response.status());
  console.log('Response Body:', JSON.stringify(responseBody, null, 2));

  // Add assertions based on the expected response structure
  expect(responseBody).toBeDefined();
});