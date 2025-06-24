const { test, expect, request } = require('@playwright/test');
const { generateRandomName, generateRandomEmail } = require('../../src/util');
const config = require('../API_JSON/CreateUser.json');

test('API_CreateUser_Test: Create a user via API', async () => {
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers
    }
  });

  const randomUsername = generateRandomName('userNameAuto');
  const randomEmail = generateRandomEmail('Automation', 'test.com');

  const requestBody = {
    ...config.body,
    UserName: randomUsername,
    EmailAddress: randomEmail
  };

  // Log request
  console.log('\n--- API Request ---');
  console.log('Endpoint     :', config.api.endpoint);
  console.log('Method       : POST');
  console.log('Headers      :', JSON.stringify(config.headers, null, 2));
  console.log('Request Body :', JSON.stringify(requestBody, null, 2));

  // Send request
  const response = await apiContext.post(config.api.endpoint, {
    data: requestBody
  });

  const status = response.status();
  const resText = await response.text();

  // Log response
  console.log('\n--- API Response ---');
  console.log('Status        :', status);
  console.log('Response Body :', resText);

  expect([200, 201, 400]).toContain(status);

  let parsed;
  try {
    parsed = JSON.parse(resText);
  } catch (err) {
    throw new Error(`Failed to parse response JSON: ${err}`);
  }

  expect(parsed).toHaveProperty('StatusMessage');
  expect(parsed).toHaveProperty('StatusCode');

  const { StatusMessage, StatusCode } = parsed;

  const isSuccess =
    StatusCode === 201 && StatusMessage === 'User has been created.';

  const isWarning =
    StatusCode === 400 && StatusMessage === 'User Name Already Exist.';

  if (isSuccess) {
    console.log(`User "${requestBody.UserName}" created successfully.`);
  } else if (isWarning) {
    console.warn(`Warning: ${StatusMessage} for "${requestBody.UserName}".`);
  } else {
    throw new Error(
      `Unexpected response:\n${JSON.stringify(parsed, null, 2)}`
    );
  }
});
