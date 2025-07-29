const { test, expect, request } = require('@playwright/test');
const loginInfo = require('../commonConfig/loginInfo.json');
const apiEndpoints = require('../commonConfig/apiEndpoints.json');
const headers = require('../commonConfig/headers.json');
const requestBody = require('../API_JSON/svc_notif_emailList.json');

test('API_NotificationEmailList_Test: Fetch Email Notification Templates', async ({ page }) => {
  let accessToken = '';

  // Listen for login token
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
        console.error('Error parsing login token response:', err);
      }
    }
  });

  // Simulate login UI steps
  await page.goto(loginInfo.loginUrl);
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(loginInfo.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(loginInfo.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for the token to be captured
  await page.waitForTimeout(5000);
  expect(accessToken).toBeTruthy();

  // Show login info
  console.log('\nLogin Info:');
  console.log(`Login URL: ${loginInfo.loginUrl}`);
  console.log(`Email: ${loginInfo.email}`);
  console.log(`Password: ${loginInfo.password}`);

  // Create API context with token
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...headers,
      authorization: `Bearer ${accessToken}`
    }
  });

  // Display request information
  const apiUrl = apiEndpoints.notificationEmailList;
  console.log('\nAPI Request Info:');
  console.log('URL:', apiUrl);
  console.log('Headers:', {
    ...headers,
    authorization: `Bearer ${accessToken}`
  });
  console.log('Request Body:', JSON.stringify(requestBody, null, 2));

  // Send API request
  const response = await apiContext.post(apiUrl, {
    data: requestBody
  });

  // Check and show response
  const status = response.status();
  const responseData = await response.json();

  console.log('\nAPI Response Info:');
  console.log('Status:', status);
  console.log('Response Body:', JSON.stringify(responseData, null, 2));

  // Assertions
  expect(response.ok()).toBeTruthy();
  expect(responseData).toBeDefined();
});
