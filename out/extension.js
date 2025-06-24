"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// src/extension.ts
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
function activate(context) {
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
function deactivate() { }
//# sourceMappingURL=extension.js.map