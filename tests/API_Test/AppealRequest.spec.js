const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/AppealRequest.json');

test('API_AppealRequest_Test: Submit appeal and expect exact successful response', async () => {
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers
    }
  });

  // Log the request details
  console.log('REQUEST');
  console.log('URL:', config.api.appealRequest);
  console.log('Headers:', JSON.stringify(config.headers, null, 2));
  console.log('Body:', JSON.stringify(config.requestBody, null, 2));

  // Make the API call
  const response = await apiContext.post(config.api.appealRequest, {
    data: config.requestBody
  });

  // Get the response
  const status = response.status();
  const responseText = await response.text();

  console.log('\nRESPONSE');
  console.log('Status:', status);
  console.log('Body:', responseText);

  let parsedResponse;
  try {
    parsedResponse = JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error.message}`);
  }

  // Define expected success response
  const expectedResponse = {
    StatusMessage: "Appeal request processed succesfully.",
    StatusCode: 200,
    Content: ""
  };

  // Strict validations
  expect(status, 'Expected HTTP status to be 200').toBe(200);
  expect(parsedResponse, 'Response does not match expected success payload').toEqual(expectedResponse);

  console.log('\nTest Passed: Exact expected response received.\n');
});
