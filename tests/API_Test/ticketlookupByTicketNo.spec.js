const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/ticketlookupByTicketNo.json');

test('API_TicketLookup_ByTicketNo_Test: Validate ticket lookup response', async () => {
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers
    }
  });

  const { endpoint, queryParams } = config.api;
  const queryString = new URLSearchParams(queryParams).toString();
  const fullUrl = `${endpoint}?${queryString}`;

  // Log API Request
  console.log('\n********** API Request **********');
  console.log('Endpoint      :', endpoint);
  console.log('Query Params  :', JSON.stringify(queryParams, null, 2));
  console.log('Headers       :', JSON.stringify(config.headers, null, 2));
  console.log('Full URL      :', fullUrl);

  const response = await apiContext.get(fullUrl);
  const status = response.status();
  const body = await response.text();

  // Log API Response
  console.log('\n********** API Response **********');
  console.log('Status Code   :', status);
  console.log('Response Body :', body);

  expect(status).toBe(200);

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${err}`);
  }

  expect(parsed).toHaveProperty('StatusMessage', 'Success');
  expect(parsed).toHaveProperty('StatusCode', 200);

  // Validate Content structure
  if (
    typeof parsed.Content === 'object' &&
    parsed.Content?.TotalTickets > 0 &&
    Array.isArray(parsed.Content.TicketSummonsInfo) &&
    parsed.Content.TicketSummonsInfo.length > 0
  ) {
    const ticket = parsed.Content.TicketSummonsInfo[0];

    // Required field validations
    expect(ticket).toHaveProperty('IssueNo');
    expect(ticket).toHaveProperty('LicPlate');
    expect(ticket).toHaveProperty('IssueDate');
    expect(ticket).toHaveProperty('AmountDue');
    expect(ticket).toHaveProperty('DueDate');

    console.log('\nTicket Found:');
    console.log(JSON.stringify(ticket, null, 2));
  } else {
    throw new Error('Unexpected response: Ticket not found or invalid Content structure.');
  }
});
