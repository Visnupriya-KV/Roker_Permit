import { test, expect, request } from '@playwright/test';
import config from '../API_JSON/CheckTicketAppeal.json';

test.describe('CheckTicketAppeal API Test Suite', () => {
  test('API_CheckTicketAppeal_Test: Check if ticket is in appeal', async () => {
    const apiContext = await request.newContext();
    const url = `${config.api.checkTicketAppeal}?CitationNo=${config.citationNumber}`;
    const headers = config.headers;

    // Log request details
    console.log('\nREQUEST');
    console.log('Endpoint:', url);
    console.log('Method: POST');
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Query Param:', { CitationNo: config.citationNumber });

    const response = await apiContext.post(url, { headers });
    const status = response.status();
    let responseBody;

    try {
      responseBody = await response.json();
    } catch {
      const text = await response.text();
      throw new Error(`Failed to parse response as JSON. Raw response: ${text}`);
    }

    // Log response details
    console.log('\nRESPONSE');
    console.log('Status Code:', status);
    console.log('Body:', JSON.stringify(responseBody, null, 2));

    // Define the exact expected response
    const expectedResponse = {
      StatusMessage: "True",
      StatusCode: 200,
      Content: "Ticket in appeal : True"
    };

    // Validate exact match
    expect(status, 'Expected HTTP status 200').toBe(200);
    expect(responseBody, 'Response does not exactly match expected payload').toEqual(expectedResponse);
  });
});

