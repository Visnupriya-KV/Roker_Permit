const { test, expect, request } = require('@playwright/test');
const loginInfo = require('../commonConfig/loginInfo.json');
const apiEndpoints = require('../commonConfig/apiEndpoints.json');
const headers = require('../commonConfig/headers.json');

test('API_NotificationEmailDetail_Test: Fetch Email Notification Template Detail', async ({ page }) => {
  let accessToken = '';

  // Capture the access token from login response
  page.on('response', async (response) => {
    if (response.url().includes(loginInfo.tokenEndpoint) && response.request().method() === 'POST') {
      try {
        const json = await response.json();
        if (json && json.access_token) {
          accessToken = json.access_token;
          console.log('\nAccess Token Captured:');
          console.log(accessToken);
        } else {
          console.error('Access token not found in login response:', json);
        }
      } catch (err) {
        console.error('Error parsing token response:', err);
      }
    }
  });

  // Simulate login
  await page.goto(loginInfo.loginUrl);
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(loginInfo.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(loginInfo.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for the token to be captured
  await page.waitForTimeout(5000);
  expect(accessToken).toBeTruthy();

  // Log login info
  console.log('\nLogin Info:');
  console.log(`Login URL: ${loginInfo.loginUrl}`);
  console.log(`Email: ${loginInfo.email}`);

  // Setup API context
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...headers,
      authorization: `Bearer ${accessToken}`
    }
  });

  // Prepare URL
  const apiUrl = apiEndpoints.notificationEmailDetail;

  // Log request info
  console.log('\nAPI Request Info:');
  console.log('Method: GET');
  console.log('URL:', apiUrl);
  console.log('Headers:', {
    ...headers,
    authorization: `Bearer ${accessToken}`
  });

  // Make GET API call
  const response = await apiContext.get(apiUrl);

  // Validate & log response
  const status = response.status();
  const responseData = await response.json();

  console.log('\nAPI Response Info:');
  console.log('Status:', status);
  console.log('Response Body:', JSON.stringify(responseData, null, 2));

  expect(response.ok()).toBeTruthy();
  expect(responseData).toBeDefined();
});
