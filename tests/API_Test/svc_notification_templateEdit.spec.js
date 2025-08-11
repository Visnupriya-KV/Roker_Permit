const { test, expect, request } = require('@playwright/test');
const loginInfo = require('../commonConfig/loginInfo.json');
const apiEndpoints = require('../commonConfig/apiEndpoints.json');
const headers = require('../commonConfig/headers.json');
const requestBody = require('../API_JSON/svc_notification_templateEdit.json');

test('API_EmailNotificationTemplateEdit_Test: Update Email Notification Template', async ({ page }) => {
  let accessToken = '';

  // Capture the access token from login
  page.on('response', async (response) => {
    if (response.url().includes(loginInfo.tokenEndpoint) && response.request().method() === 'POST') {
      try {
        const json = await response.json();
        if (json && json.access_token) {
          accessToken = json.access_token;
          console.log('Access Token:', accessToken);
        } else {
          console.error('Access token not found in login response:', json);
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

  // Wait for token to be captured
  await page.waitForTimeout(5000);
  expect(accessToken).toBeTruthy();

  // Log login info
  console.log('Login URL:', loginInfo.loginUrl);
  console.log('Email:', loginInfo.email);

  // Set up API context
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...headers,
      authorization: `Bearer ${accessToken}`
    }
  });

  // Log request info
  const apiUrl = apiEndpoints.notificationEmailTemplateEdit;
  console.log('Request Method: PUT');
  console.log('Request URL:', apiUrl);
  console.log('Request Headers:', {
    ...headers,
    authorization: `Bearer ${accessToken}`
  });
  console.log('Request Body:', JSON.stringify(requestBody, null, 2));

  // Make PUT request
  const response = await apiContext.put(apiUrl, {
    data: requestBody
  });

  // Log response info
  const responseStatus = response.status();
  const responseData = await response.json();
  console.log('Response Status:', responseStatus);
  console.log('Response Body:', JSON.stringify(responseData, null, 2));

  // Assertions
  expect(response.ok()).toBeTruthy();
  expect(responseData).toBeDefined();
});
