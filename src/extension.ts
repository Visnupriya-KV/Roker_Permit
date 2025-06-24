// src/extension.ts
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

    console.log('Extension "playwright-automation-vsc-extension" is now active!');

    // Use vscode.commands.registerCommand to link the ID to the function
    let disposable = vscode.commands.registerCommand('extension.runSelectedApiTests', () => {
        // <<<---------------------------------------------------->>>
        // This is the callback function containing the code that
        // executes when the command 'extension.runSelectedApiTests'
        // is triggered (e.g., by clicking the button).
        // <<<---------------------------------------------------->>>

        // 1. Get workspace folder
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('Cannot run tests: No workspace folder is open.');
            return;
        }
        const workspacePath = workspaceFolders[0].uri.fsPath;

        // 2. Construct script path
        const scriptName = 'run-selected-api-tests.js';
        const scriptPath = path.join(workspacePath, scriptName);

        // 3. Construct command
        const commandToExecute = `node "${scriptPath}"`;

        vscode.window.showInformationMessage('Starting selected API tests execution...');

        // 4. Get/create terminal
        const terminalName = "Playwright CSV Runner";
        let terminal = vscode.window.terminals.find(t => t.name === terminalName);
        if (!terminal) {
            terminal = vscode.window.createTerminal(terminalName);
        }

        // 5. Run command in terminal
        terminal.sendText('clear');
        terminal.sendText(commandToExecute);
        terminal.show();
    }); // End of the callback function for registerCommand

    // Add the registration to the extension's subscriptions.
    // This ensures the command is properly cleaned up when the
    // extension is deactivated.
    context.subscriptions.push(disposable);
}

export function deactivate() {}
