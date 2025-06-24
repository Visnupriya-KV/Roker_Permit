const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/getticketstage.json');

test('API_Getticketstage_Test: GET ticket stage by citationNo', async ({ playwright }) => {
  const apiContext = await playwright.request.newContext();

  const citationNo = config.requestBody.CitationNo;
  const url = `${config.api.getTicketStage}?citationNo=${citationNo}`;
  const headers = config.headers;

  // ==== Log Request Details ====
  console.log('\n========= API REQUEST =========');
  console.log('Method       : GET');
  console.log('URL          :', url);
  console.log('Headers      :', JSON.stringify(headers, null, 2));
  console.log('Query Params :', `citationNo=${citationNo}`);

  const response = await apiContext.get(url, { headers });

  const status = response.status();
  const responseBody = await response.text();

  // ==== Log Response Details ====
  console.log('\n========= API RESPONSE =========');
  console.log('Status Code   :', status);
  console.log('Raw Body      :', responseBody);

  expect(status).toBe(200);

  let parsed;
  try {
    parsed = JSON.parse(responseBody);
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${err}`);
  }

  console.log('\n========= PARSED RESPONSE =========');
  console.log(JSON.stringify(parsed, null, 2));

  expect(parsed).toHaveProperty('StatusMessage', 'Success');
  expect(parsed).toHaveProperty('StatusCode', 200);

  const { Content } = parsed;

  // Validate Content structure and StageName value
  if (
    typeof Content === 'object' &&
    ['TICKET ISSUED', 'CLOSED'].includes(Content.StageName) &&
    typeof Content.StageCompleted === 'number' &&
    typeof Content.TagState === 'string' &&
    typeof Content.HoldPayment === 'string'
  ) {
    console.log(`\nValid ticket stage response received. StageName: ${Content.StageName}`);
  } else {
    throw new Error(`Unexpected Content structure or StageName:\n${JSON.stringify(Content, null, 2)}`);
  }
});

