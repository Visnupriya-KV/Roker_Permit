const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/CheckTicketEligibleAppeal.json');

test('API_CheckTicketEligibleAppeal_Test: Validate citation eligibility for appeal', async () => {
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers
    }
  });

  // Log Request Info
  console.log('\nREQUEST');
  console.log('URL:', config.api.checkAppealEligibility);
  console.log('Headers:', JSON.stringify(config.headers, null, 2));

  const response = await apiContext.post(config.api.checkAppealEligibility);
  const responseBody = await response.text();
  const status = response.status();

  // Log Response Info
  console.log('\nRESPONSE');
  console.log('Status Code:', status);
  console.log('Body:', responseBody);

  // Validate HTTP status
  expect(status, 'Expected HTTP 200 OK').toBe(200);

  // Parse JSON response
  let parsed;
  try {
    parsed = JSON.parse(responseBody);
  } catch (err) {
    throw new Error(`Failed to parse response as JSON:\n${err.message}`);
  }

  // Schema Validations
  expect(parsed).toHaveProperty('StatusMessage');
  expect(parsed).toHaveProperty('StatusCode');
  expect(parsed).toHaveProperty('Content');

  // Value Validations - Allowed responses
  const allowedResponses = [
    {
      StatusMessage: "True",
      StatusCode: 200,
      Content: "Appeal Enabled"
    },
    {
      StatusMessage: "True",
      StatusCode: 200,
      Content: "Appeal Disabled"
    },
    {
      StatusMessage: "False",
      StatusCode: 200,
      Content: "Appeal Disabled as Ticket is already in Appeal."
    },
    {
      StatusMessage: "False",
      StatusCode: 200,
      Content: "Appeal Disabled as Ticket in Review."
    },
    {
      StatusMessage: "False",
      StatusCode: 200,
      Content: "Appeal Disabled as Ticket in Extension."
    }
  ];

  const isResponseAllowed = allowedResponses.some(expected =>
    expected.StatusMessage === parsed.StatusMessage &&
    expected.StatusCode === parsed.StatusCode &&
    expected.Content === parsed.Content
  );

  expect(isResponseAllowed, 'Response does not match any of the allowed formats').toBeTruthy();

  console.log('\nTest Passed: Response matched one of the approved formats.\n');
});

