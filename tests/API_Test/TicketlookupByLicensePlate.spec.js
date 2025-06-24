const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/TicketlookupByLicensePlate.json');
const qs = require('querystring');

test('API_TicketLookup_ByLicensePlate_Test: Validate lookup response', async () => {
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers
    }
  });

  // Construct URL
  const queryString = qs.stringify(config.api.queryParams);
  const fullUrl = `${config.api.endpoint}?${queryString}`;

  // === Log Request ===
  console.log('\n========== API REQUEST ==========');
  console.log('Method       : GET');
  console.log('Endpoint     :', config.api.endpoint);
  console.log('Query Params :', JSON.stringify(config.api.queryParams, null, 2));
  console.log('Full URL     :', fullUrl);
  console.log('Headers      :', JSON.stringify(config.headers, null, 2));

  // Send request
  const response = await apiContext.get(fullUrl);
  const status = response.status();
  const bodyText = await response.text();

  // === Log Response ===
  console.log('\n========== API RESPONSE ==========');
  console.log('Status Code  :', status);
  console.log('Raw Body     :', bodyText);

  expect(status).toBe(200);

  let parsed;
  try {
    parsed = JSON.parse(bodyText);
  } catch (err) {
    throw new Error(`Failed to parse JSON response:\n${err}`);
  }

  console.log('\n========== PARSED RESPONSE ==========');
  console.log(JSON.stringify(parsed, null, 2));

  // Validate top-level response structure
  expect(parsed).toHaveProperty('StatusMessage', 'Success');
  expect(parsed).toHaveProperty('StatusCode', 200);
  expect(parsed).toHaveProperty('Content');
  expect(parsed.Content).toHaveProperty('TotalTickets');
  expect(parsed.Content).toHaveProperty('TicketSummonsInfo');
  expect(Array.isArray(parsed.Content.TicketSummonsInfo)).toBe(true);

  // Validate ticket content
  const ticket = parsed.Content.TicketSummonsInfo[0];
  if (!ticket || !ticket.IssueNo || !ticket.LicPlate) {
    throw new Error(`Unexpected or missing ticket content:\n${JSON.stringify(parsed.Content, null, 2)}`);
  }

  // Specific field validation
expect(ticket).toHaveProperty('LicPlate');
expect(ticket.LicPlate.toLowerCase()).toBe(config.api.queryParams.licensePlate.toLowerCase());
expect(ticket).toHaveProperty('AmountDue');
expect(ticket).toHaveProperty('IssueDate');
expect(ticket).toHaveProperty('DueDate');


  console.log(`\nValid ticket found for plate: ${ticket.LicPlate}`);
});
