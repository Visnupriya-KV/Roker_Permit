const { test, expect, request } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const loginInfo = require('../commonConfig/loginInfo.json');
const apiEndpoints = require('../commonConfig/apiEndpoints.json');
const headers = require('../commonConfig/headers.json');
const reportExportRequestBody = require('../API_JSON/svc_console_reportExport.json');

test('API_ReportExport_Test: Report Export API', async ({ page }) => {
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

  // Make the API call to the Report Export endpoint
  console.log('Making API call to:', apiEndpoints.reportExport);
  console.log('Request Body:', JSON.stringify(reportExportRequestBody, null, 2));

  const response = await apiContext.post(apiEndpoints.reportExport, {
    data: reportExportRequestBody,
  });

  // Validate the API response
  console.log('Response Status:', response.status());
  expect(response.ok()).toBeTruthy();

  // Check the Content-Type of the response
  const contentType = response.headers()['content-type'];
  console.log('Content-Type:', contentType);

  if (contentType.includes('application/json')) {
    // Parse JSON response
    const responseBody = await response.json();
    console.log('Response Body:', JSON.stringify(responseBody, null, 2));

    // Add assertions based on the expected response structure
    expect(responseBody).toBeDefined();
    expect(responseBody).toHaveProperty('success', true); // Example assertion for a success property
  } else {
    const buffer = await response.body();
    console.log('Response is a file or non-JSON content. Size:', buffer.length);

    // Optionally, save the file locally
    const fs = require('fs');
    fs.writeFileSync('report-export.xlsx', buffer);
    console.log('File saved as report-export.xlsx');
  }
});