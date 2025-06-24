const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/getbycitationno.json');

test('API_Get_CitationNoDetails: Validate citation ticket response', async () => {
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers
    }
  });

  const endpoint = config.api.endpoint;

  // Log API request
  console.log('\n********** API Request **********');
  console.log('Method   : GET');
  console.log('Endpoint :', endpoint);
  console.log('Headers  :', JSON.stringify(config.headers, null, 2));

  // Send the API request
  const response = await apiContext.get(endpoint);
  const status = response.status();
  const responseBody = await response.text();

  // Log API response
  console.log('\n********** API Response **********');
  console.log('Status       :', status);
  console.log('Raw Response :', responseBody);

  // Validate HTTP status
  expect(status).toBe(200);

  let parsed;
  try {
    parsed = JSON.parse(responseBody);
  } catch (err) {
    throw new Error(`Failed to parse JSON response: ${err}`);
  }

  // Log parsed response
  console.log('\n********** Parsed JSON **********');
  console.log(JSON.stringify(parsed, null, 2));

  // Check for success
  expect(parsed).toHaveProperty('StatusMessage', 'Success');
  expect(parsed).toHaveProperty('StatusCode', 200);

  const { Content } = parsed;

  if (Array.isArray(Content)) {
    // Expected content
    console.log('\nValid content found. Validating citation object...');

    expect(Content.length).toBeGreaterThan(0);
    const citation = Content[0];

    expect(citation).toHaveProperty('CitationNo');
    expect(citation).toHaveProperty('TagNumber');
    expect(citation).toHaveProperty('Province');
    expect(citation).toHaveProperty('IssueDate');
    expect(citation).toHaveProperty('IssueTime');
    expect(citation).toHaveProperty('AmountDue');
    expect(citation).toHaveProperty('PayableCode');

    console.log('Citation details validated successfully.');

  } else if (
    typeof Content === 'string' &&
    Content === 'No result found for provided citation no.'
  ) {
    // Warning path
    console.warn('\nWarning: No result found for provided citation number.');
  } else {
    // Unexpected content
    throw new Error(`Unexpected Content received:\n${JSON.stringify(Content, null, 2)}`);
  }
});
