const { test, expect, request } = require('@playwright/test');
const createConfig = require('../API_JSON/CreateUser.json');
const deactivateConfig = require('../API_JSON/createAndDeactivateUser.json');
const { generateRandomName, generateRandomEmail } = require('../../src/util');

test('API_DeactivateUser_Test: Create and Deactivate a User', async () => {
  // Step 1: Create User
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...createConfig.headers
    }
  });

  const randomUserName = generateRandomName('user');
  const randomEmail = generateRandomEmail('user');

  const createBody = {
    ...createConfig.body,
    UserName: randomUserName,
    EmailAddress: randomEmail
  };

  console.log('\n--- CREATE USER REQUEST ---');
  console.log('Endpoint:', createConfig.api.endpoint);
  console.log('Request Body:', JSON.stringify(createBody, null, 2));

  const createResponse = await apiContext.post(createConfig.api.endpoint, {
    data: createBody
  });

  const createStatus = createResponse.status();
  const createResText = await createResponse.text();

  console.log('\n--- CREATE USER RESPONSE ---');
  console.log('Status Code:', createStatus);
  console.log('Response Body:', createResText);

  expect([200, 201]).toContain(createStatus);

  let created;
  try {
    created = JSON.parse(createResText);
  } catch (err) {
    throw new Error(`Failed to parse create response JSON: ${err.message}`);
  }

  expect(created).toHaveProperty('StatusCode');
  expect(created.StatusCode).toBe(201);
  console.log(`User "${randomUserName}" created successfully.`);

  // Step 2: Deactivate User
  const deactivateContext = await request.newContext({
    extraHTTPHeaders: {
      ...deactivateConfig.headers
    }
  });

  const deactivateUrl = `${deactivateConfig.api.endpoint}?userName=${randomUserName}`;

  console.log('\n--- DEACTIVATE USER REQUEST ---');
  console.log('Endpoint:', deactivateUrl);

  const deactivateResponse = await deactivateContext.delete(deactivateUrl);
  const deactivateStatus = deactivateResponse.status();
  const deactivateResText = await deactivateResponse.text();

  console.log('\n--- DEACTIVATE USER RESPONSE ---');
  console.log('Status Code:', deactivateStatus);
  console.log('Response Body:', deactivateResText);

  expect(deactivateStatus).toBe(200);

  let deactivated;
  try {
    deactivated = JSON.parse(deactivateResText);
  } catch (err) {
    throw new Error(`Failed to parse deactivate response JSON: ${err.message}`);
  }

  expect(deactivated).toHaveProperty('StatusMessage');
  expect(deactivated).toHaveProperty('StatusCode');
  expect(deactivated).toHaveProperty('Content');

  const expectedSuccess = {
    StatusMessage: "User has been delete successfully.",
    StatusCode: 200,
    Content: ""
  };

  const expectedWarning = {
    StatusMessage: "User doesn't Exist.",
    StatusCode: 400,
    Content: ""
  };

  if (
    deactivated.StatusMessage === expectedSuccess.StatusMessage &&
    deactivated.StatusCode === expectedSuccess.StatusCode &&
    deactivated.Content === expectedSuccess.Content
  ) {
    console.log(`User "${randomUserName}" successfully deactivated.`);
  } else if (
    deactivated.StatusMessage === expectedWarning.StatusMessage &&
    deactivated.StatusCode === expectedWarning.StatusCode &&
    deactivated.Content === expectedWarning.Content
  ) {
    console.warn(`Warning: ${deactivated.StatusMessage} — user may not have existed or was already deleted.`);
  } else {
    throw new Error(`Unexpected response during deactivation:\n${JSON.stringify(deactivated, null, 2)}`);
  }
});
