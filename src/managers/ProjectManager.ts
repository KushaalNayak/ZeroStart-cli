
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ProjectLanguage, ProjectType, ProjectConfig } from '../types';
import { TemplateManager } from './TemplateManager';
import { GitHubService } from '../services/GitHubService';
import { GitManager } from './GitManager';

export class ProjectManager {
    private templateManager: TemplateManager;
    private gitHubService: GitHubService;
    private gitManager: GitManager;

    constructor() {
        this.templateManager = new TemplateManager();
        this.gitHubService = new GitHubService();
        this.gitManager = new GitManager();
    }

    public async start(initialName?: string) {
        try {
            // 0. Check Prerequisites
            if (!await this.gitManager.checkGitInstalled()) {
                vscode.window.showErrorMessage('Git is required to use this extension. Please install Git and try again.');
                return;
            }

            // 1. Get Project Name
            let name = initialName;
            if (!name) {
                name = await vscode.window.showInputBox({
                    prompt: 'Enter Project Name',
                    placeHolder: 'my-awesome-project',
                    validateInput: (text) => {
                        return text && text.trim().length > 0 ? null : 'Project name is required';
                    }
                });
            }
            if (!name) return;

            // 2. Get Programming Language
            const language = await vscode.window.showQuickPick(Object.values(ProjectLanguage), {
                placeHolder: 'Select Programming Language'
            });
            if (!language) return;

            // 3. Get Project Type
            const type = await vscode.window.showQuickPick(Object.values(ProjectType), {
                placeHolder: 'Select Project Type'
            });
            if (!type) return;

            // 4. Get GitHub Repository Visibility
            const visibilityParts = ['Public', 'Private'];
            const visibilitySelection = await vscode.window.showQuickPick(visibilityParts, {
                placeHolder: 'Select Repository Visibility'
            });
            if (!visibilitySelection) return;
            const isPublic = visibilitySelection === 'Public';

            // 5. Select Parent Folder
            const folderResult = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Select Project Location'
            });
            if (!folderResult || folderResult.length === 0) return;

            const parentPath = folderResult[0].fsPath;
            const projectPath = path.join(parentPath, name);

            const config: ProjectConfig = {
                name,
                language: language as ProjectLanguage,
                type: type as ProjectType,
                isTheRepoPublic: isPublic,
                description: `A ${type} project in ${language}`,
                path: projectPath
            };

            // Start Process
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Creating Project...",
                cancellable: false
            }, async (progress, token) => {

                progress.report({ increment: 10, message: "Generating project structure..." });
                await this.templateManager.createProjectStructure(config);

                progress.report({ increment: 30, message: "Initializing Git..." });
                await this.gitManager.init(config.path);
                // Create initial commit
                await this.gitManager.commit(config.path, "Initial commit configured by Project Starter AI");

                progress.report({ increment: 50, message: "Creating GitHub Repository..." });
                const repoUrl = await this.gitHubService.createRepo(config);

                if (repoUrl && repoUrl.trim().length > 0) {
                    progress.report({ increment: 70, message: "Pushing to GitHub..." });
                    await this.gitManager.addRemote(config.path, repoUrl);
                    await this.gitManager.push(config.path);

                    // Clean up token from remote URL if it was injected
                    if (repoUrl.includes('x-access-token')) {
                        const cleanUrl = repoUrl.replace(/x-access-token:[^@]+@/, '');
                        await this.gitManager.setRemoteUrl(config.path, cleanUrl);
                    }
                }


                progress.report({ increment: 100, message: "Done!" });
            });

            const action = await vscode.window.showInformationMessage(`Project '${name}' created successfully!`, 'Open Project');
            if (action === 'Open Project') {
                const uri = vscode.Uri.file(projectPath);
                await vscode.commands.executeCommand('vscode.openFolder', uri);
            }

        } catch (error: any) {
            vscode.window.showErrorMessage(`Error creating project: ${error.message}`);
        }
    }
}
