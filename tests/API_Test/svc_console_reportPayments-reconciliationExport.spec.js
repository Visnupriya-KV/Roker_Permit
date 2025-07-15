const { test, expect, request } = require('@playwright/test');
const loginInfo = require('../commonConfig/loginInfo.json');
const apiEndpoints = require('../commonConfig/apiEndpoints.json');
const headers = require('../commonConfig/headers.json');
const requestBody = require('../API_JSON/svc_console_reportPayments-reconciliationExport.json');

test('API_svcConsole_ReportPaymentsReconciliationExport_Test: Export Payments Reconciliation Report API', async ({ page }) => {
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
  console.log('Request URL:', apiEndpoints.reportPaymentsReconciliationExport);
  console.log('Request Headers:', {
    ...headers,
    authorization: `Bearer ${accessToken}`,
  });
  console.log('Request Body:', requestBody);

  // Make the POST API call
  const apiUrl = apiEndpoints.reportPaymentsReconciliationExport;
  const response = await apiContext.post(apiUrl, {
    data: requestBody, // Pass the request body from JSON
  });

  // Validate the API response
  expect(response.ok()).toBeTruthy();

  // Check the Content-Type of the response
  const contentType = response.headers()['content-type'];
  console.log('Response Content-Type:', contentType);

  if (contentType.includes('application/json')) {
    // Parse JSON response
    const responseBody = await response.json();
    console.log('Response Body:', responseBody);

    // Add assertions based on the expected response structure
    expect(responseBody).toBeDefined();
    expect(responseBody).toHaveProperty('success', true); // Example assertion for a success property
  } else {
    // Handle non-JSON response (e.g., file download)
    const buffer = await response.body();
    console.log('Response is a file or non-JSON content. Size:', buffer.length);

    // Optionally, save the file locally
    const fs = require('fs');
    fs.writeFileSync('payments-reconciliation-export.xlsx', buffer);
    console.log('File saved as payments-reconciliation-export.xlsx');
  }
});