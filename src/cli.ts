#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import * as path from 'path';
import * as fs from 'fs';
import ora from 'ora';
import chalk from 'chalk';
import { ProjectConfig, ProjectLanguage, ProjectType } from './types';
import { TemplateManager } from './managers/TemplateManager';
import { GitManager } from './managers/GitManager';
import { GitHubServiceCLI } from './services/GitHubServiceCLI';

const program = new Command();

// Basic ASCII banner for maximum compatibility
function showBanner() {
    console.log();
    console.log(chalk.cyan('------------------------------------------------------------'));
    console.log(chalk.bold.white('                    ZeroStart CLI                       '));
    console.log(chalk.gray('          Create and deploy projects in seconds            '));
    console.log(chalk.cyan('------------------------------------------------------------'));
}

// Show GitHub token help (ASCII only)
function showGitHubTokenHelp() {
    console.log();
    console.log(chalk.yellow('  GitHub Access Token Required:'));
    console.log(chalk.gray('  +----------------------------------------------------------+'));
    console.log(chalk.gray('  | ') + chalk.white('To create a token, Ctrl+Click the link below:          ') + chalk.gray(' |'));
    console.log(chalk.gray('  | ') + chalk.cyan('https://github.com/settings/tokens/new                 ') + chalk.gray(' |'));
    console.log(chalk.gray('  |                                                          |'));
    console.log(chalk.gray('  | ') + chalk.white('1. Select scope: repo                                  ') + chalk.gray(' |'));
    console.log(chalk.gray('  | ') + chalk.white('2. Scroll down and click "Generate token"              ') + chalk.gray(' |'));
    console.log(chalk.gray('  +----------------------------------------------------------+'));
    console.log();
}

program
    .name('zerostart')
    .description('Create and deploy a complete project with one command')
    .version('0.0.6')
    .argument('[projectName]', 'Name of the project')
    .action(async (projectName) => {
        try {
            showBanner();

            // 1. Get Project Name
            let name = projectName;
            if (!name) {
                const nameAnswer = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'name',
                        message: 'Project Name:',
                        validate: (input: string) => {
                            if (input.trim() === '') return chalk.red('Project name is required!');
                            if (!/^[a-zA-Z0-9-_]+$/.test(input)) return chalk.red('Use only letters, numbers, hyphens, and underscores');
                            return true;
                        }
                    }
                ]);
                name = nameAnswer.name;
            }

            // 2. Get Details
            const answers = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'language',
                    message: 'Select Programming Language:',
                    choices: Object.values(ProjectLanguage)
                },
                {
                    type: 'list',
                    name: 'type',
                    message: 'Select Project Type:',
                    choices: Object.values(ProjectType)
                },
                {
                    type: 'list',
                    name: 'visibility',
                    message: 'Select Repository Visibility:',
                    choices: ['Public', 'Private'],
                    default: 'Private'
                },
                {
                    type: 'confirm',
                    name: 'createRemote',
                    message: 'Push to GitHub?',
                    default: false
                }
            ]);

            let githubToken = null;

            // Only ask for token if user wants GitHub integration
            if (answers.createRemote) {
                showGitHubTokenHelp();

                const tokenAnswer = await inquirer.prompt([
                    {
                        type: 'password',
                        name: 'githubToken',
                        message: 'Enter GitHub Token (or press Enter to skip):',
                        mask: '*'
                    }
                ]);

                githubToken = tokenAnswer.githubToken?.trim() || null;

                if (!githubToken) {
                    console.log(chalk.yellow('\n  ⚠️  Skipping GitHub integration (no token provided)'));
                    console.log(chalk.gray('  💡 You can manually push later with: ') + chalk.cyan('git remote add origin <url>'));
                    answers.createRemote = false;
                }
            }

            const cwd = process.cwd();
            const projectPath = path.join(cwd, name);

            if (fs.existsSync(projectPath)) {
                console.log();
                console.log(chalk.red('  ❌ Error: Directory "' + name + '" already exists!'));
                console.log(chalk.gray('  💡 Try a different name or remove the existing directory'));
                console.log();
                process.exit(1);
            }

            const config: ProjectConfig = {
                name: name,
                language: answers.language,
                type: answers.type,
                isTheRepoPublic: answers.visibility === 'Public',
                description: `A ${answers.type} project in ${answers.language}`,
                path: projectPath
            };

            console.log();
            const spinner = ora({
                text: 'Initializing...',
                color: 'cyan',
                spinner: 'dots'
            }).start();

            try {
                // Managers
                const templateManager = new TemplateManager();
                const gitManager = new GitManager();
                const gitHubService = githubToken ? new GitHubServiceCLI(githubToken) : null;

                // 0. Check Git
                if (!await gitManager.checkGitInstalled()) {
                    spinner.fail(chalk.red('Git is not installed!'));
                    console.log(chalk.yellow('\n  💡 Install Git from: ') + chalk.cyan('https://git-scm.com/'));
                    console.log();
                    return;
                }

                // 1. Structure
                spinner.text = chalk.cyan('📁 Generating project structure...');
                await templateManager.createProjectStructure(config);
                spinner.succeed(chalk.green('✓ Project structure created'));

                // 2. Git Init
                spinner.start(chalk.cyan('🔄 Initializing Git repository...'));
                await gitManager.init(config.path);
                await gitManager.commit(config.path, "🎉 Initial commit by ZeroStart");
                spinner.succeed(chalk.green('✓ Git repository initialized'));

                // 3. GitHub
                if (gitHubService && answers.createRemote) {
                    spinner.start(chalk.cyan('🐙 Creating GitHub repository...'));
                    const repoUrl = await gitHubService.createRepo(config);

                    if (repoUrl) {
                        spinner.succeed(chalk.green('✓ GitHub repository created'));

                        spinner.start(chalk.cyan('⬆️  Pushing to GitHub...'));
                        await gitManager.addRemote(config.path, repoUrl);
                        await gitManager.push(config.path);

                        // Cleanup token if used in URL
                        if (repoUrl.includes('@github.com')) {
                            const cleanUrl = repoUrl.replace(/\/\/[^@]+@/, '//');
                            await gitManager.setRemoteUrl(config.path, cleanUrl);
                        }

                        spinner.succeed(chalk.green('✓ Pushed to GitHub'));
                    } else {
                        spinner.warn(chalk.yellow('⚠️  GitHub repository creation failed'));
                        console.log(chalk.gray('  💡 Check your token permissions and try again'));
                    }
                }

                // Success message
                console.log();
                console.log(chalk.bold.green('  ✨ Success! Your project is ready!'));
                console.log();
                console.log(chalk.gray('  📍 Location: ') + chalk.cyan(config.path));
                console.log();
                console.log(chalk.bold('  🚀 Get started:'));
                console.log(chalk.gray('  ├─ ') + chalk.cyan(`cd ${name}`));
                console.log(chalk.gray('  └─ ') + chalk.cyan('code .') + chalk.gray(' (or your favorite editor)'));
                console.log();

                if (!answers.createRemote || !githubToken) {
                    console.log(chalk.bold.yellow('  💡 To push to GitHub later:'));
                    console.log(chalk.gray('  ├─ Create a repository on GitHub'));
                    console.log(chalk.gray('  ├─ ') + chalk.cyan('git remote add origin <your-repo-url>'));
                    console.log(chalk.gray('  └─ ') + chalk.cyan('git push -u origin main'));
                    console.log();
                }

            } catch (error: any) {
                spinner.fail(chalk.red('❌ Error: ' + error.message));
                console.log();
                console.log(chalk.gray('  💡 Need help? Check the documentation or open an issue'));
                console.log();
            }

        } catch (error) {
            console.error(chalk.red('\n  ❌ Unexpected error:'), error);
            console.log();
        }
    });

// Helper functions for emojis
function getLanguageEmoji(lang: string): string {
    const emojis: { [key: string]: string } = {
        'Node.js': '🟢',
        'React': '⚛️',
        'Python': '🐍',
        'Java': '☕',
        'C++': '⚡'
    };
    return emojis[lang] || '📝';
}

function getTypeEmoji(type: string): string {
    const emojis: { [key: string]: string } = {
        'Web App': '🌐',
        'CLI Tool': '⌨️',
        'DSA Practice': '🧮',
        'ML Project': '🤖'
    };
    return emojis[type] || '📦';
}

program.parse(process.argv);
