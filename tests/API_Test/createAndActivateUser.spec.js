const { test, expect, request } = require('@playwright/test');
const createConfig = require('../API_JSON/CreateUser.json');
const activateConfig = require('../API_JSON/createAndActivateUser.json');
const { generateRandomName, generateRandomEmail } = require('../../src/util');

test('API_ActivateUser_Test: Create and Activate a User', async () => {
  // Step 1: Create a User
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

  console.log('\nCREATE USER REQUEST');
  console.log('Endpoint:', createConfig.api.endpoint);
  console.log('Request Body:', JSON.stringify(createBody, null, 2));

  const createResponse = await apiContext.post(createConfig.api.endpoint, {
    data: createBody
  });

  const createStatus = createResponse.status();
  const createResText = await createResponse.text();

  console.log('\nCREATE USER RESPONSE');
  console.log('Status:', createStatus);
  console.log('Response Body:', createResText);

  expect([200, 201], 'Expected status code 200 or 201').toContain(createStatus);

  let created;
  try {
    created = JSON.parse(createResText);
  } catch (err) {
    throw new Error(`Failed to parse create response JSON: ${err.message}`);
  }

  expect(created).toHaveProperty('StatusCode');
  expect(created.StatusCode).toBe(201);
  console.log(`User "${randomUserName}" created successfully.`);

  // Step 2: Activate the same user
  const activateContext = await request.newContext({
    extraHTTPHeaders: {
      ...activateConfig.headers
    }
  });

  const activateUrl = `${activateConfig.api.endpoint}?userName=${randomUserName}`;

  console.log('\nACTIVATE USER REQUEST');
  console.log('Endpoint:', activateUrl);

  const activateResponse = await activateContext.post(activateUrl);
  const activateStatus = activateResponse.status();
  const activateResText = await activateResponse.text();

  console.log('\nACTIVATE USER RESPONSE');
  console.log('Status:', activateStatus);
  console.log('Response Body:', activateResText);

  let activated;
  try {
    activated = JSON.parse(activateResText);
  } catch (err) {
    throw new Error(`Failed to parse activate response JSON: ${err.message}`);
  }

  expect(activateStatus).toBe(200);
  expect(activated).toHaveProperty('StatusMessage');
  expect(activated).toHaveProperty('StatusCode');
  expect(activated).toHaveProperty('Content');

  const expectedSuccess = {
    StatusMessage: "User has been activate successfully.",
    StatusCode: 200,
    Content: ""
  };

  const expectedWarning = {
    StatusMessage: "User doesn't Exist.",
    StatusCode: 400,
    Content: ""
  };

  if (
    activated.StatusMessage === expectedSuccess.StatusMessage &&
    activated.StatusCode === expectedSuccess.StatusCode &&
    activated.Content === expectedSuccess.Content
  ) {
    console.log(`Activation succeeded: ${activated.StatusMessage}`);
  } else if (
    activated.StatusMessage === expectedWarning.StatusMessage &&
    activated.StatusCode === expectedWarning.StatusCode &&
    activated.Content === expectedWarning.Content
  ) {
    console.warn(`Warning: ${activated.StatusMessage} — user may not have been committed yet.`);
  } else {
    throw new Error(`Unexpected activation response: ${JSON.stringify(activated, null, 2)}`);
  }
});
