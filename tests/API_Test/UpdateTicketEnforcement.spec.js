const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/UpdateTicketEnforcement.json');

test('API_UpdateTicketEnforcement_Test: Update ticket enforcement data and validate response', async () => {
  const apiContext = await request.newContext({
    extraHTTPHeaders: config.headers
  });

  // Log API Request
  console.log('\n********** API Request **********');
  console.log('Endpoint      :', config.api.updateTicketEnforcement);
  console.log('Headers       :', JSON.stringify(config.headers, null, 2));
  console.log('Request Body  :', JSON.stringify(config.requestBody, null, 2));

  // Make the API request
  const response = await apiContext.post(config.api.updateTicketEnforcement, {
    data: config.requestBody
  });

  const status = response.status();
  const responseBody = await response.text();

  // Log API Response
  console.log('\n********** API Response **********');
  console.log('Status Code   :', status);
  console.log('Response Body :', responseBody);

  // Basic validations
  expect([200, 201]).toContain(status);

  let parsed;
  try {
    parsed = JSON.parse(responseBody);
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${err}`);
  }

  // Strict response validation
  expect(parsed).toHaveProperty('StatusMessage', 'Success');
  expect(parsed).toHaveProperty('StatusCode', 200);
  expect(parsed).toHaveProperty('Content', 'Record successfully updated.');

  console.log('\nTicket enforcement record updated successfully.');
});

