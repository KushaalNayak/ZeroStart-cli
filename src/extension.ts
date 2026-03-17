
import * as vscode from 'vscode';
import { ProjectManager } from './managers/ProjectManager';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "ZeroStart" is now active!');

    // Set default auto-select family attempt timeout to 1000ms if available
    // This helps with connection issues in dual-stack (IPv4/IPv6) environments
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const net = require('net');
        if (typeof net.setDefaultAutoSelectFamilyAttemptTimeout === 'function') {
            net.setDefaultAutoSelectFamilyAttemptTimeout(1000);
            console.log('Set default auto-select family attempt timeout to 1000ms');
        }
    } catch (error) {
        console.warn('Failed to set auto-select family attempt timeout:', error);
    }

    const disposable = vscode.commands.registerCommand('zerostart.create', async (projectName?: string) => {
        const projectManager = new ProjectManager();
        await projectManager.start(projectName);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
