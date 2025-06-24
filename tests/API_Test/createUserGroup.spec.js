const { test, expect, request } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const config = require('../API_JSON/CreateUserGroup.json');
const { generateRandomGroupName } = require('../../src/util');

// Path to log file (modify as needed)
const logFilePath = path.join(__dirname, '../../logs/createdUserGroup.json');

test('API_CreateUserGroup_Test: Create a user group with random name and log it', async () => {
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers
    }
  });

  const randomGroupName = generateRandomGroupName();
  const requestBody = {
    ...config.body,
    GroupName: randomGroupName,
    NewGroupName: randomGroupName
  };

  // Request Logs
  console.log('\n--- API Request ---');
  console.log('Endpoint     :', config.api.endpoint);
  console.log('Method       : POST');
  console.log('Headers      :', JSON.stringify(config.headers, null, 2));
  console.log('Request Body :', JSON.stringify(requestBody, null, 2));

  const response = await apiContext.post(config.api.endpoint, {
    data: requestBody
  });

  const status = response.status();
  const responseBody = await response.text();

  // Response Logs
  console.log('\n--- API Response ---');
  console.log('Status        :', status);
  console.log('Raw Response  :', responseBody);

  // Accept only 200, 201 or 400 status codes
  expect([200, 201, 400]).toContain(status);

  let parsed;
  try {
    parsed = JSON.parse(responseBody);
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${err}`);
  }

  expect(parsed).toHaveProperty('StatusMessage');
  expect(parsed).toHaveProperty('StatusCode');

  const { StatusMessage, StatusCode } = parsed;

  // Valid Success Response
  const isSuccess =
    StatusCode === 201 && StatusMessage === 'User Group has been created.';

  // Expected Warning Response
  const isWarning =
    StatusCode === 400 && StatusMessage === 'Group Name Already Exist.';

  if (isSuccess) {
    console.log(`Group "${randomGroupName}" created successfully.`);

  
  } else if (isWarning) {
    console.warn(`Warning: ${StatusMessage} for "${randomGroupName}".`);
  } else {
    throw new Error(`Unexpected response:\n${JSON.stringify(parsed, null, 2)}`);
  }
});
