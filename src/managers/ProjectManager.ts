
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ProjectLanguage, ProjectType, ProjectConfig } from '../types';
import { TemplateManager } from './TemplateManager';
import { GitHubService } from '../services/GitHubService';
import { GitManager } from './GitManager';
import { VercelManager } from './VercelManager';

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

            // 2. Get Programming Template
            const templates = [
                ProjectLanguage.React,
                ProjectLanguage.TypeScript,
                ProjectLanguage.HTMLCSS,
                ProjectLanguage.CPP,
                ProjectLanguage.Java,
                ProjectLanguage.Python
            ];
            const language = await vscode.window.showQuickPick(templates, {
                placeHolder: 'Select Project Template'
            });
            if (!language) return;

            // 3. GitHub Option
            let createRemote = false;
            let isPublic = false;
            if (language === ProjectLanguage.React || language === ProjectLanguage.TypeScript) {
                const githubResult = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: 'Add this project to GitHub?'
                });
                if (githubResult === 'Yes') {
                    createRemote = true;
                    const visibilityResult = await vscode.window.showQuickPick(['Public', 'Private'], {
                        placeHolder: 'Select Repository Visibility'
                    });
                    isPublic = visibilityResult === 'Public';
                }
            }

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

            let type = ProjectType.WebApp;
            if (language === ProjectLanguage.TypeScript) type = ProjectType.CLITool;
            if ([ProjectLanguage.CPP, ProjectLanguage.Java, ProjectLanguage.Python].includes(language as ProjectLanguage)) type = ProjectType.DSAPractice;

            const config: ProjectConfig = {
                name,
                language: language as ProjectLanguage,
                type: type,
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

                if (createRemote) {
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
                }


                progress.report({ increment: 100, message: "Done!" });
            });

            if ([ProjectLanguage.Python, ProjectLanguage.Java, ProjectLanguage.CPP].includes(language as ProjectLanguage)) {
                const gdbLinks: Record<string, string> = {
                    [ProjectLanguage.Python]: 'https://www.onlinegdb.com/online_python_compiler',
                    [ProjectLanguage.Java]: 'https://www.onlinegdb.com/online_java_compiler',
                    [ProjectLanguage.CPP]: 'https://www.onlinegdb.com/online_c++_compiler'
                };
                const link = gdbLinks[language as string];
                const action = await vscode.window.showInformationMessage(`Project '${name}' created! Practice online?`, 'Open GDB Link', 'Open Project');
                if (action === 'Open GDB Link') {
                    vscode.env.openExternal(vscode.Uri.parse(link));
                } else if (action === 'Open Project') {
                    const uri = vscode.Uri.file(projectPath);
                    await vscode.commands.executeCommand('vscode.openFolder', uri);
                }
            } else if (language === ProjectLanguage.HTMLCSS) {
                const action = await vscode.window.showInformationMessage(`Project '${name}' created! Deploy to Vercel?`, 'Deploy Now', 'Open Project');
                if (action === 'Deploy Now') {
                    const vm = new VercelManager();
                    if (await vm.checkAuth()) {
                        await vm.deploy(projectPath, name);
                        vscode.window.showInformationMessage('Deployment started!');
                    } else {
                        vscode.window.showErrorMessage('Vercel not authenticated. Please run "vercel login" in terminal.');
                    }
                } else if (action === 'Open Project') {
                    const uri = vscode.Uri.file(projectPath);
                    await vscode.commands.executeCommand('vscode.openFolder', uri);
                }
            } else {
                const action = await vscode.window.showInformationMessage(`Project '${name}' created successfully!`, 'Open Project');
                if (action === 'Open Project') {
                    const uri = vscode.Uri.file(projectPath);
                    await vscode.commands.executeCommand('vscode.openFolder', uri);
                }
            }

        } catch (error: any) {
            vscode.window.showErrorMessage(`Error creating project: ${error.message}`);
        }
    }
}
