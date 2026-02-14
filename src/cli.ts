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
import { VercelManager } from './managers/VercelManager';
import { NetlifyManager } from './managers/NetlifyManager';
import { exec } from 'child_process';


const program = new Command();

// Basic ASCII banner
function showBanner() {
    console.log();
    console.log(chalk.cyan('------------------------------------------------------------'));
    console.log(chalk.bold.white('                    ZeroStart CLI                       '));
    console.log(chalk.gray('          Create and deploy projects in seconds            '));
    console.log(chalk.cyan('------------------------------------------------------------'));
}

function openUrl(url: string) {
    const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
    exec(`${start} "${url}"`);
}

function showGitHubTokenHelp() {
    const tokenUrl = 'https://github.com/settings/tokens/new?scopes=repo&description=ZeroStart%20CLI%20Token';
    console.log();
    console.log(chalk.yellow('  GitHub Access Token Required:'));
    console.log(chalk.gray('  +----------------------------------------------------------+'));
    console.log(chalk.gray('  | ') + chalk.white('Opening GitHub in your browser...                      ') + chalk.gray(' |'));
    console.log(chalk.gray('  | ') + chalk.cyan(tokenUrl.substring(0, 50) + '...') + chalk.gray(' |'));
    console.log(chalk.gray('  +----------------------------------------------------------+'));
    console.log();
    openUrl(tokenUrl);
}

async function initializeProject(name: string, language: ProjectLanguage, type: ProjectType, options: { isPublic: boolean; createRemote: boolean; githubToken: string | null; authMethod: string }) {
    const cwd = process.cwd();
    const projectPath = path.join(cwd, name);

    if (fs.existsSync(projectPath)) {
        console.log(chalk.red('\n  Error: Directory "' + name + '" already exists!'));
        process.exit(1);
    }

    const config: ProjectConfig = {
        name,
        language,
        type,
        isTheRepoPublic: options.isPublic,
        description: `A ${type} project in ${language}`,
        path: projectPath
    };

    const spinner = ora({ text: 'Initializing...', color: 'cyan' }).start();

    try {
        const templateManager = new TemplateManager();
        const gitManager = new GitManager();
        const gitHubService = options.githubToken ? new GitHubServiceCLI(options.githubToken) : null;

        if (!await gitManager.checkGitInstalled()) {
            spinner.fail(chalk.red('Git is not installed!'));
            return;
        }

        spinner.text = chalk.cyan('Generating project structure...');
        await templateManager.createProjectStructure(config);
        spinner.succeed(chalk.green('Project structure created'));

        if (type !== ProjectType.DSAPractice) {
            spinner.start(chalk.cyan('Initializing Git repository...'));
            await gitManager.init(projectPath);
            await gitManager.commit(projectPath, "Initial commit");
            spinner.succeed(chalk.green('Git repository initialized'));
        }

        if (options.createRemote) {
            spinner.start(chalk.cyan('Creating GitHub repository...'));
            let repoUrl: string | undefined;

            if (options.authMethod === 'GitHub CLI') {
                repoUrl = await gitManager.createRepoWithGh(projectPath, name, options.isPublic);
            } else if (gitHubService) {
                repoUrl = await gitHubService.createRepo(config);
            }

            if (repoUrl) {
                spinner.succeed(chalk.green('GitHub repository created'));
                spinner.start(chalk.cyan('Pushing to GitHub...'));
                if (options.authMethod !== 'GitHub CLI') await gitManager.addRemote(projectPath, repoUrl);
                await gitManager.push(projectPath);
                spinner.succeed(chalk.green('Pushed to GitHub'));
            } else {
                spinner.warn(chalk.yellow('GitHub repository creation failed'));
            }
        }

        console.log();
        console.log(chalk.bold.green('  Success! Your project is ready!'));
        console.log(chalk.gray('  Location: ') + chalk.cyan(projectPath));
        console.log();

        const isWeb = [ProjectLanguage.React, ProjectLanguage.HTMLCSS].includes(language);
        const isPractice = type === ProjectType.DSAPractice;

        if (!isWeb || isPractice) {
            const gdbLinks: Record<string, string> = {
                [ProjectLanguage.Python]: 'https://www.onlinegdb.com/online_python_compiler',
                [ProjectLanguage.Java]: 'https://www.onlinegdb.com/online_java_compiler',
                [ProjectLanguage.CPP]: 'https://www.onlinegdb.com/online_c++_compiler',
                [ProjectLanguage.NodeJS]: 'https://www.onlinegdb.com/online_node.js_compiler',
                [ProjectLanguage.React]: 'https://www.onlinegdb.com/'
            };
            const link = gdbLinks[language] || 'https://www.onlinegdb.com/';
            console.log(chalk.bold.yellow('  Practice Online:'));
            console.log(chalk.gray('  - ') + chalk.cyan(link));
            console.log(chalk.gray('  (Opening in your browser...)'));
            openUrl(link);
            return;
        }

        console.log(chalk.bold('  Get started:'));
        console.log(chalk.gray('  - ') + chalk.cyan(`cd ${name}`));
        console.log(chalk.gray('  - ') + chalk.cyan('code .') + chalk.gray(' (or your favorite editor)'));
        console.log();

    } catch (error: any) {
        spinner.fail(chalk.red('Error: ' + error.message));
    }
}

program
    .name('zerostart')
    .description('Create and deploy a complete project with one command')
    .version('0.0.35');

// Standalone deployment commands
program
    .command('deploy-vercel')
    .description('Deploy the current project to Vercel')
    .action(async () => {
        showBanner();
        const vercelManager = new VercelManager();
        const cwd = process.cwd();
        if (await vercelManager.checkAuth()) {
            const { vName } = await inquirer.prompt([{ type: 'input', name: 'vName', message: 'Vercel Project Name:', default: path.basename(cwd) }]);
            const url = await vercelManager.deploy(cwd, vName);
            if (url) console.log(chalk.green('  ✔ Deployed! URL: ') + chalk.cyan(url));
        }
    });

program
    .command('deploy-netlify')
    .description('Deploy the current project to Netlify')
    .action(async () => {
        showBanner();
        const netlifyManager = new NetlifyManager();
        const cwd = process.cwd();
        if (await netlifyManager.checkAuth()) {
            const { nName } = await inquirer.prompt([{ type: 'input', name: 'nName', message: 'Netlify Project Name:', default: path.basename(cwd) }]);
            const res = await netlifyManager.createSite(nName, cwd);
            const success = await netlifyManager.deploy(cwd, res.siteId);
            if (success) console.log(chalk.green('  ✔ Deployed to Netlify!'));
        }
    });

// Shortcut commands (18 total)
const shortcuts = [
    { cmd: 'dsa-py', lang: ProjectLanguage.Python, type: ProjectType.DSAPractice },
    { cmd: 'dsa-java', lang: ProjectLanguage.Java, type: ProjectType.DSAPractice },
    { cmd: 'dsa-cpp', lang: ProjectLanguage.CPP, type: ProjectType.DSAPractice },
    { cmd: 'dsa-node', lang: ProjectLanguage.NodeJS, type: ProjectType.DSAPractice },
    { cmd: 'web-react', lang: ProjectLanguage.React, type: ProjectType.WebApp },
    { cmd: 'web-html', lang: ProjectLanguage.HTMLCSS, type: ProjectType.WebApp },
    { cmd: 'web-node', lang: ProjectLanguage.NodeJS, type: ProjectType.WebApp },
    { cmd: 'web-py', lang: ProjectLanguage.Python, type: ProjectType.WebApp },
    { cmd: 'web-java', lang: ProjectLanguage.Java, type: ProjectType.WebApp },
    { cmd: 'web-cpp', lang: ProjectLanguage.CPP, type: ProjectType.WebApp },
    { cmd: 'cli-py', lang: ProjectLanguage.Python, type: ProjectType.CLITool },
    { cmd: 'cli-node', lang: ProjectLanguage.NodeJS, type: ProjectType.CLITool },
    { cmd: 'cli-java', lang: ProjectLanguage.Java, type: ProjectType.CLITool },
    { cmd: 'cli-cpp', lang: ProjectLanguage.CPP, type: ProjectType.CLITool },
    { cmd: 'ml-py', lang: ProjectLanguage.Python, type: ProjectType.MLProject },
    { cmd: 'ml-node', lang: ProjectLanguage.NodeJS, type: ProjectType.MLProject },
    { cmd: 'ml-java', lang: ProjectLanguage.Java, type: ProjectType.MLProject },
    { cmd: 'ml-cpp', lang: ProjectLanguage.CPP, type: ProjectType.MLProject },
];

shortcuts.forEach(s => {
    program.command(s.cmd).argument('[name]', 'Project name', `my-${s.cmd}`).action(n => {
        showBanner();
        initializeProject(n, s.lang, s.type, { isPublic: false, createRemote: false, githubToken: null, authMethod: 'none' });
    });
});

// Main wizard
program.argument('[projectName]').action(async (projectName) => {
    showBanner();
    let name = projectName;
    const answers: any = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Project Name:', skip: !!projectName, when: !projectName },
        { type: 'list', name: 'language', message: 'Language:', choices: Object.values(ProjectLanguage) },
        { type: 'list', name: 'type', message: 'Type:', choices: Object.values(ProjectType) },
        { type: 'list', name: 'createRemote', message: 'Push to GitHub?', choices: ['Yes', 'No'], default: 'No', when: (ans) => ans.type !== ProjectType.DSAPractice }
    ]);

    await initializeProject(projectName || answers.name, answers.language, answers.type, {
        isPublic: false,
        createRemote: answers.createRemote === 'Yes',
        githubToken: null,
        authMethod: 'none'
    });
});

program.parse(process.argv);
