const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/Payment.json');

test('API_Payment_Test: Make a payment and verify the response', async () => {
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers
    }
  });

  // Log the request
  console.log('\n===== PAYMENT REQUEST =====');
  console.log('Endpoint:', config.api.endpoint);
  console.log('Request Body:', JSON.stringify(config.body, null, 2));

  // Send the payment request
  const response = await apiContext.post(config.api.endpoint, {
    data: config.body
  });

  const status = response.status();
  const responseText = await response.text();

  // Log the response
  console.log('\n===== PAYMENT RESPONSE =====');
  console.log('Status:', status);
  console.log('Raw Response:', responseText);

  // Basic status check
  expect([200, 201]).toContain(status);

  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch (err) {
    throw new Error(`Failed to parse response JSON: ${err}`);
  }

  // Validate structure
  expect(parsed).toHaveProperty('StatusMessage');
  expect(parsed).toHaveProperty('StatusCode');
  expect(parsed).toHaveProperty('Content');

  // Strictly check expected values
  const expectedResponse = {
    StatusMessage: 'Payment applied successfully',
    StatusCode: 201,
    Content: {
      ErrorMessage: '',
      Code: 0
    }
  };

  expect(parsed.StatusMessage).toBe(expectedResponse.StatusMessage);
  expect(parsed.StatusCode).toBe(expectedResponse.StatusCode);
  expect(parsed.Content).toMatchObject(expectedResponse.Content);

  console.log('\nPayment applied successfully and response verified.');
});
