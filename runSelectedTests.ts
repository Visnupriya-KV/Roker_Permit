import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { spawn } from 'child_process';

//const csvFilePath = '/Users/visnupriyakv/Desktop/Roker_VMS/Testcase.csv';
const csvFilePath = path.resolve(__dirname, './Testcase.csv');
const testDir = path.resolve(__dirname, 'tests/API_Test');

const run = async () => {
  const selectedTests: string[] = [];
  const parser = fs
    .createReadStream(csvFilePath)
    .pipe(parse({ columns: true, trim: true }));

  for await (const record of parser) {
    if (record.Control === 'Y') {
      const tsFile = path.join(testDir, `${record.fileName}.spec.js`);
      if (fs.existsSync(tsFile)) selectedTests.push(tsFile);
      else console.warn(`⚠️ Test file not found for TestCaseID: ${record.TestCaseID}`);
    }
  }

  if (selectedTests.length === 0) {
    console.log('No tests with Control=Y found in CSV.');
    process.exit(1);
  }

  console.log('Selected test files:', selectedTests);

  const testProcess = spawn(
    'npx',
    ['playwright', 'test', ...selectedTests, '--reporter=list,allure-playwright'],
    { stdio: 'inherit' }
  );

  testProcess.on('error', (err) => {
    console.error('Failed to start test process:', err);
  });

  testProcess.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Tests passed. Generating Allure report...');
      const gen = spawn('npx', ['allure', 'generate', 'allure-results', '--clean', '-o', 'allure-report'], { stdio: 'inherit' });

      gen.on('error', (err) => {
        console.error('Failed to start allure generate:', err);
      });

      gen.on('exit', () => {
        spawn('npx', ['allure', 'open', 'allure-report'], { stdio: 'inherit' });
      });
    } else {
      console.error('❌ Tests failed.');
      process.exit(code ?? 1);
    }
  });
};

run().catch((err) => {
  console.error(err);
});
