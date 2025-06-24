const { execSync } = require('child_process');
const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');

// 1. Run Playwright Tests
console.log('📦 Running Playwright tests...');
try {
  execSync('npx playwright test || true', { stdio: 'inherit' });
} catch (err) {
  console.warn('⚠️ Some tests failed, continuing...');
}

// 2. Generate Allure Report
console.log('🧪 Generating Allure report...');
try {
  execSync('npx allure generate allure-results --clean -o allure-report', { stdio: 'inherit' });
} catch (e) {
  console.error('❌ Allure report generation failed.');
  process.exit(1);
}

// 3. Read test summary from allure-report/widgets/summary.json
let summaryPath = path.join(__dirname, 'allure-report/widgets/summary.json');
let summary = {
  total: 0,
  passed: 0,
  failed: 0,
  duration: '0s'
};

try {
  const data = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  summary.total = data.statistic.total;
  summary.passed = data.statistic.passed;
  summary.failed = data.statistic.failed;
  summary.duration = Math.round(data.time.duration / 1000) + 's';
  console.log(`✅ Summary: ${summary.total} total, ${summary.passed} passed, ${summary.failed} failed, duration: ${summary.duration}`);
} catch (e) {
  console.warn('⚠️ Failed to read test summary. Using default values.');
}

// 4. Send Email with Report
console.log('📧 Sending email...');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'spplusautomation@gmail.com',        // 🔁 Replace
    pass: 'vtszxdncjowzjovi'            // 🔁 Use App Password (NOT your real Gmail password)
  }
});

const mailOptions = {
  from: 'spplusautomation@gmail.com',
  to: 'vvenkateshwaran@metropolis.io',
  subject: `📋 Playwright Test Report - ${summary.total} tests`,
  text: `Test Summary:\n\nTotal: ${summary.total}\nPassed: ${summary.passed}\nFailed: ${summary.failed}\nDuration: ${summary.duration}`,
  attachments: [
    {
      filename: 'index.html',
      path: './allure-report/index.html',
      contentType: 'text/html'
    }
  ]
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.error('❌ Email failed to send:', error);
  } else {
    console.log('✅ Email sent: ' + info.response);
  }
});
