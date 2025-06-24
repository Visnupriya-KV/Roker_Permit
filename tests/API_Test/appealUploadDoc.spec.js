const { test, expect, request } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const config = require('../API_JSON/AppealUploadDoc.json');

test('API_AppealUploadDoc_Test: Upload a document and expect exact successful response', async () => {
  // Setup API context with headers
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers
    }
  });

  // Resolve and validate file path
  const absoluteFilePath = path.resolve(__dirname, config.formData.filePath);
  console.log('\nREQUEST');
  console.log('Upload URL:', config.api.uploadEndpoint);
  console.log('Headers:', JSON.stringify(config.headers, null, 2));
  console.log('File Path:', absoluteFilePath);

  if (!fs.existsSync(absoluteFilePath)) {
    throw new Error(`File not found: ${absoluteFilePath}`);
  }

  const fileStream = fs.createReadStream(absoluteFilePath);

  // Perform the upload
  const response = await apiContext.post(config.api.uploadEndpoint, {
    multipart: {
      files: fileStream,
      CitationNo: config.formData.CitationNo
    }
  });

  const status = response.status();
  const responseText = await response.text();

  console.log('\nRESPONSE');
  console.log('Status Code:', status);
  console.log('Body:', responseText);

  let parsedResponse;
  try {
    parsedResponse = JSON.parse(responseText);
  } catch (err) {
    throw new Error(`Failed to parse JSON response: ${err.message}`);
  }

  // Expected exact success response
  const expectedResponse = {
    StatusMessage: "Document(s) uploaded succesfully.",
    StatusCode: 200,
    Content: []
  };

  // Assert HTTP status
  expect(status, 'Expected HTTP 200 OK').toBe(200);

  // Strictly match the response payload
  expect(parsedResponse, 'Response does not match the exact expected success response').toEqual(expectedResponse);

  console.log('\nTest Passed: Document uploaded and expected response received.\n');
});