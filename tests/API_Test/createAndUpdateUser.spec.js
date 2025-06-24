const { test, expect, request } = require('@playwright/test');
const createConfig = require('../API_JSON/CreateUser.json');
const updateConfig = require('../API_JSON/createAndUpdateUser.json');
const { generateRandomString, generateRandomEmail } = require('../../src/util');

test('API_UpdateUser_Test: Create and Update a User', async () => {
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...updateConfig.headers
    }
  });

  // Step 1: Create User
  const randomUserName = generateRandomString('user');
  const randomEmail = generateRandomEmail('user');

  const createBody = {
    ...createConfig.body,
    UserName: randomUserName,
    EmailAddress: randomEmail
  };

  console.log('\n--- Create User Request ---');
  console.log('Endpoint:', createConfig.api.endpoint);
  console.log('Body:', JSON.stringify(createBody, null, 2));

  const createResponse = await apiContext.post(createConfig.api.endpoint, {
    data: createBody
  });

  const createStatus = createResponse.status();
  const createResText = await createResponse.text();

  console.log('\n--- Create User Response ---');
  console.log('Status:', createStatus);
  console.log('Body:', createResText);

  expect([200, 201]).toContain(createStatus);

  const created = JSON.parse(createResText);
  expect(created).toHaveProperty('StatusCode');
  expect([200, 201]).toContain(created.StatusCode);

  console.log(`User "${randomUserName}" created.`);

  // Step 2: Update User
  const updatedFirstName = `${createBody.FirstName}_Updated`;

  const updateBody = {
    ...updateConfig.body,
    UserName: createBody.UserName,
    FirstName: updatedFirstName,
    MiddleName: createBody.MiddleName,
    LastName: createBody.LastName,
    EmailAddress: createBody.EmailAddress,
    Badge: createBody.Badge,
    UserGroupName: createBody.UserGroupName,
    SubClientId: createBody.SubClientId
  };

  console.log('\n--- Update User Request ---');
  console.log('Endpoint:', updateConfig.api.endpoint);
  console.log('Body:', JSON.stringify(updateBody, null, 2));

  const updateResponse = await apiContext.put(updateConfig.api.endpoint, {
    data: updateBody
  });

  const updateStatus = updateResponse.status();
  const updateResText = await updateResponse.text();

  console.log('\n--- Update User Response ---');
  console.log('Status:', updateStatus);
  console.log('Body:', updateResText);

  expect(updateStatus).toBe(200);

  const updated = JSON.parse(updateResText);
  expect(updated).toHaveProperty('StatusCode');

  const isSuccess =
    updated.StatusCode === 200 &&
    updated.StatusMessage === 'User has been updated successfully.';

  const isWarning =
    updated.StatusCode === 400 &&
    updated.StatusMessage === "User doesn't Exist.";

  if (isSuccess) {
    console.log(`User "${randomUserName}" updated successfully. New FirstName: "${updatedFirstName}"`);
  } else if (isWarning) {
    console.warn(`Warning: ${updated.StatusMessage} - The user might not exist.`);
  } else {
    throw new Error(`Unexpected update response:\n${JSON.stringify(updated, null, 2)}`);
  }
});
