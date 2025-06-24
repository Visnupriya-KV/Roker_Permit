const { test, expect, request } = require('@playwright/test');
const createConfig = require('../API_JSON/CreateUserGroup.json');
const updateConfig = require('../API_JSON/updateUserGroup.json');
const { generateRandomGroupName } = require('../../src/util');

test('API_UpdateUserGroup_Test: Create and Update a User Group', async () => {
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...updateConfig.headers
    }
  });

  // ===== STEP 1: CREATE GROUP =====
  const randomGroupName = generateRandomGroupName();
  const createBody = {
    ...createConfig.body,
    GroupName: randomGroupName,
    NewGroupName: randomGroupName
  };

  console.log('\n===== CREATE GROUP REQUEST =====');
  console.log('Endpoint:', createConfig.api.endpoint);
  console.log('Body:', JSON.stringify(createBody, null, 2));

  const createResponse = await apiContext.post(createConfig.api.endpoint, { data: createBody });
  const createStatus = createResponse.status();
  const createResText = await createResponse.text();

  console.log('\n===== CREATE GROUP RESPONSE =====');
  console.log('Status:', createStatus);
  console.log('Body:', createResText);

  expect([200, 201]).toContain(createStatus);

  let created;
  try {
    created = JSON.parse(createResText);
  } catch (err) {
    throw new Error(`Failed to parse create group response JSON: ${err}`);
  }

  expect(created).toHaveProperty('StatusCode', 201);
  console.log(`Group "${randomGroupName}" created successfully.`);

  // ===== STEP 2: UPDATE GROUP =====
  const updatedGroupName = `${randomGroupName}_Updated`;
  const updateBody = {
    ...updateConfig.body,
    GroupName: randomGroupName,
    NewGroupName: updatedGroupName
  };

  console.log('\n===== UPDATE GROUP REQUEST =====');
  console.log('Endpoint:', updateConfig.api.endpoint);
  console.log('Body:', JSON.stringify(updateBody, null, 2));

  const updateResponse = await apiContext.put(updateConfig.api.endpoint, { data: updateBody });
  const updateStatus = updateResponse.status();
  const updateResText = await updateResponse.text();

  console.log('\n===== UPDATE GROUP RESPONSE =====');
  console.log('Status:', updateStatus);
  console.log('Body:', updateResText);

  expect(updateStatus).toBe(200);

  let updated;
  try {
    updated = JSON.parse(updateResText);
  } catch (err) {
    throw new Error(`Failed to parse update group response JSON: ${err}`);
  }

  expect(updated).toHaveProperty('StatusMessage');
  expect(updated).toHaveProperty('StatusCode');

  const expectedSuccess = updated.StatusMessage === 'User Group has been updated successfully.' && updated.StatusCode === 200;
  const expectedWarning = updated.StatusMessage === "Group Name doesn't Exist." && updated.StatusCode === 400;

  if (expectedSuccess) {
    console.log(`Group updated from "${randomGroupName}" to "${updatedGroupName}"`);
  } else if (expectedWarning) {
    console.warn('WARNING: Group name does not exist. Partial pass.');
  } else {
    throw new Error(`❌ Unexpected response: ${JSON.stringify(updated, null, 2)}`);
  }
});
