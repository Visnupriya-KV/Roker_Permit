const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

const csvFilePath = path.join(__dirname, 'Testcase.csv'); // Path to Testcase.csv
const reportDir = path.join(__dirname, 'playwright-report'); // Default Playwright report directory
const reportFilePath = path.join(reportDir, '/html/index.html'); // Full path to the report file

// --- Email Configuration ---
const emailConfig = {
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined,
    secure: process.env.EMAIL_SECURE ? (process.env.EMAIL_SECURE === 'true') : undefined,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
};

// --- Helper Function to Send Email ---
async function sendReportEmail(status) {
    console.log('📧 Preparing to send email...');

    if (!emailConfig.auth.user || !emailConfig.auth.pass || !emailConfig.to) {
        console.warn('⚠️ Email configuration incomplete. Skipping email notification.');
        return;
    }

    if (!fs.existsSync(reportFilePath)) {
        console.error(`❌ HTML report not found at ${reportFilePath}. Cannot send email attachment.`);
        return;
    }

    // Extract test details from the JSON report
    const reportSummary = extractReportSummary(reportDir);
    const { totalTests, passedTests, failedTests, duration } = reportSummary;

    const transporter = nodemailer.createTransport({
        service: emailConfig.service,
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: emailConfig.auth,
    });

    const currentDateTime = new Date().toLocaleString(); // Get current date and time

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const formattedTime = currentDate.toTimeString().split(' ')[0].replace(/:/g, ':'); // Format: HH-MM-SS
    const dynamicFilename = `UAT_permit_${formattedDate}/${formattedTime}.html`;

    const mailOptions = {
        from: emailConfig.from,
        to: emailConfig.to,
        subject: `UAT ROKER Permit TEST REPORT - ${status.toUpperCase()} - (${currentDateTime})`,
        text: `Hi Team,

UAT Roker Permit test execution has completed with the following details:

Status: ${status.toUpperCase()}
Total Tests: ${totalTests}
Passed: ${passedTests}
Failed: ${failedTests}
Duration: ${duration}

Please download and view the attached HTML report for full details.

Regards,
QA Automation`,
        html: `<p>Hi Team,</p>
<p>UAT Roker Permit test execution has completed with the following details:</p>
<ul>
    <li><b>Status:</b> ${status.toUpperCase()}</li>
    <li><b>Total Tests:</b> ${totalTests}</li>
    <li><b>Passed:</b> ${passedTests}</li>
    <li><b>Failed:</b> ${failedTests}</li>
    <li><b>Duration:</b> ${duration}</li>
</ul>
<p>Please download and view the attached HTML report for full details.</p>
<p>Regards,<br>QA Automation</p>`,
        attachments: [
            {
                filename: dynamicFilename, // Use the dynamically generated filename
                path: reportFilePath,
                contentType: 'text/html',
            },
        ],
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
}

// --- Extract Report Summary ---
function extractReportSummary(reportDir) {
    const jsonReportPath = path.join(reportDir, '/json/report.json'); // Correct path to the JSON report

    // Default values in case parsing fails
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let duration = 'N/A';

    try {
        if (!fs.existsSync(jsonReportPath)) {
            console.error(`❌ JSON report not found at ${jsonReportPath}`);
            return { totalTests, passedTests, failedTests, duration };
        }

        const reportContent = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
        console.log('📄 JSON report loaded successfully.');

        // Extract test results
        totalTests = reportContent.stats.expected + reportContent.stats.unexpected;
        passedTests = reportContent.stats.expected;
        failedTests = reportContent.stats.unexpected;

        // Extract duration
        if (reportContent.stats.duration) {
            const durationInSeconds = Math.round(reportContent.stats.duration / 1000);
            const minutes = Math.floor(durationInSeconds / 60);
            const seconds = durationInSeconds % 60;
            duration = `${minutes}m ${seconds}s`;
        }
    } catch (error) {
        console.error('❌ Error extracting report summary from JSON:', error);
    }

    return { totalTests, passedTests, failedTests, duration };
}

// --- Main Script Logic ---
(async () => {
    let executionStatus = 'SUCCESS';
    try {
        // Read the CSV file
        const csvData = fs.readFileSync(csvFilePath, 'utf8');
        const lines = csvData.split('\n');
        const headerLine = lines[0].trim();
        const headers = headerLine.split(',');

        // Find the index of 'Control' and 'TestCaseID' columns
        const controlIndex = headers.indexOf('Control');
        const testCaseIdIndex = headers.indexOf('TestCaseID');

        if (controlIndex === -1 || testCaseIdIndex === -1) {
            throw new Error(`CSV file "${csvFilePath}" must contain 'Control' and 'TestCaseID' columns.`);
        }

        // Find TestCaseIDs where Control is 'Y'
        const testCaseIDsToRun = lines
            .slice(1) // Skip header row
            .map(line => line.trim())
            .filter(line => line) // Remove empty lines
            .map(line => {
                const columns = line.split(','); // Simple CSV split
                return { control: columns[controlIndex]?.trim(), id: columns[testCaseIdIndex]?.trim() };
            })
            .filter(testCase => testCase.control && testCase.control.toUpperCase() === 'Y' && testCase.id)
            .map(testCase => testCase.id);

        if (testCaseIDsToRun.length === 0) {
            console.log(`No test cases marked with Control="Y" found in ${csvFilePath}`);
            process.exit(0); // Exit gracefully if no tests are selected
        }

        console.log('▶️ Test Cases to run:', testCaseIDsToRun.join(', '));

        // Construct the Playwright command with --grep
        const grepPattern = testCaseIDsToRun.map(id => `${id}.*`).join('|'); // Match test titles with additional text
        const playwrightCommand = `PW_TEST_HTML_REPORT_OPEN=never npx playwright test --grep="${grepPattern}"`;

        console.log(`\n🚀 Executing command: ${playwrightCommand}\n`);

        // Execute the command
        try {
            execSync(playwrightCommand, { stdio: 'inherit' }); // Inherit stdio to see Playwright output
            console.log('\n✅ Playwright tests completed successfully.');
        } catch (error) {
            console.error('\n❌ Playwright tests failed.');
            executionStatus = 'FAILURE';
        }

        // --- Print the report path to the terminal ---
        if (fs.existsSync(reportFilePath)) {
            console.log(`\n📄 HTML Report generated at: ${reportFilePath}`);
        } else {
            console.warn(`\n⚠️ HTML Report file not found at: ${reportFilePath}. Cannot provide path or send attachment.`);
        }
    } catch (error) {
        console.error('\n❌ An error occurred in the main script execution:', error);
        executionStatus = 'FAILURE';
    } finally {
        // Send email after execution attempt, regardless of success or failure
        await sendReportEmail(executionStatus);
    }
})();
