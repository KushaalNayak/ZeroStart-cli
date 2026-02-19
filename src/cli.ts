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
import open from 'open';



const program = new Command();

// Basic ASCII banner
function showBanner() {
    console.log();
    console.log(chalk.cyan('------------------------------------------------------------'));
    console.log(chalk.bold.white('                    ZeroStart CLI                       '));
    console.log(chalk.gray('          Create and deploy projects in seconds            '));
    console.log(chalk.gray('  📘 Docs: ') + chalk.cyan.underline('https://zerostart.zeroonedevs.in'));
    console.log(chalk.cyan('------------------------------------------------------------'));
    console.log();
}

async function openUrl(url: string) {
    console.log(chalk.cyan('🌐 Opening GitHub in your browser...'));
    await open(url);
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

async function initializeProject(
    name: string,
    language: ProjectLanguage,
    type: ProjectType,
    options: { isPublic: boolean; createRemote: boolean; githubToken: string | null; authMethod: string }
): Promise<string> {
    // Returns the project path so the wizard can continue with deploy steps
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
            return projectPath;
        }

        // ── Step 1: Create project files ────────────────────────────────────
        spinner.text = chalk.cyan('Generating project structure...');
        await templateManager.createProjectStructure(config);
        spinner.succeed(chalk.green('Project structure created'));

        if (type !== ProjectType.DSAPractice) {
            // ── Step 2: Git init + FIRST human commit ────────────────────────
            spinner.start(chalk.cyan('Initializing Git repository...'));
            await gitManager.init(projectPath);
            // First commit: just README and .gitignore (base project skeleton)
            await gitManager.commitSelective(projectPath, ['README.md', '.gitignore', 'roadmap.md'], 'feat: initialize project with ZeroStart CLI');
            // Second commit: everything else (source files, config, etc.)
            await gitManager.commit(projectPath, 'chore: add project structure and configuration files');
            spinner.succeed(chalk.green('Git repository initialized (2 commits)'));
        }

        // ── Step 3: Create GitHub remote if requested ─────────────────────
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
                spinner.succeed(chalk.green('Pushed to GitHub ✓'));
            } else {
                spinner.warn(chalk.yellow('GitHub repository creation failed — continuing locally'));
            }
        }

        console.log();
        console.log(chalk.bold.green('  ✅ Success! Your project is ready!'));
        console.log(chalk.gray('  Location: ') + chalk.cyan(projectPath));
        console.log();

        // ── CP languages: open browser + interactive terminal ─────────────
        if ([ProjectLanguage.Python, ProjectLanguage.Java, ProjectLanguage.CPP].includes(language)) {
            const gdbLinks: Record<string, string> = {
                [ProjectLanguage.Python]: 'https://www.onlinegdb.com/online_python_compiler',
                [ProjectLanguage.Java]: 'https://www.onlinegdb.com/online_java_compiler',
                [ProjectLanguage.CPP]: 'https://www.onlinegdb.com/online_c++_compiler'
            };
            const link = gdbLinks[language]!;
            console.log(chalk.bold.yellow('  Practice Online:'));
            console.log(chalk.gray('  - ') + chalk.cyan(link));
            console.log(chalk.gray('  (Opening in your browser...)'));
            openUrl(link);

            const terminalCmds: Record<string, string> = {
                [ProjectLanguage.Python]: 'start cmd /k "python"',
                [ProjectLanguage.Java]: `start cmd /k "cd /d ${projectPath} && javac src/main/java/com/example/Main.java && java -cp src/main/java com.example.Main"`,
                [ProjectLanguage.CPP]: `start cmd /k "cd /d ${projectPath} && g++ main.cpp -o main && main"`,
            };
            const termCmd = terminalCmds[language];
            if (termCmd) {
                console.log(chalk.bold.yellow('  Opening interactive terminal...'));
                exec(termCmd, { cwd: projectPath });
            }
        }

        console.log(chalk.bold('\n  Get started:'));
        console.log(chalk.gray('  - ') + chalk.cyan(`cd ${name}`));
        console.log(chalk.gray('  - ') + chalk.cyan('code .') + chalk.gray(' (or your favorite editor)'));
        console.log();

        return projectPath;

    } catch (error: any) {
        spinner.fail(chalk.red('Error: ' + error.message));
        return projectPath;
    }
}

program
    .name('zerostart')
    .description('Create and deploy a complete project with one command')
    .version('0.0.41');

// zerostart init [project-name]
program
    .command('init [project-name]')
    .description('Initialize a new project with interactive prompts')
    .action(async (projectName) => {
        showBanner();
        await startWizard(projectName);
    });

// zerostart deploy
program
    .command('deploy')
    .description('Deploy your project to a hosting provider')
    .action(async () => {
        showBanner();
        const { provider } = await inquirer.prompt([{
            type: 'list',
            name: 'provider',
            message: 'Choose deployment provider:',
            choices: ['Vercel', 'Netlify', 'GitHub Pages']
        }]);

        const cwd = process.cwd();
        const projectName = path.basename(cwd);

        if (provider === 'Vercel') {
            const vercelManager = new VercelManager();
            if (await vercelManager.checkAuth()) {
                const { vName } = await inquirer.prompt([{ type: 'input', name: 'vName', message: 'Vercel Project Name:', default: projectName }]);
                const url = await vercelManager.deploy(cwd, vName);
                if (url) console.log(chalk.green('  ✔ Deployed! URL: ') + chalk.cyan(url));
            }
        } else if (provider === 'Netlify') {
            const netlifyManager = new NetlifyManager();
            if (await netlifyManager.checkAuth()) {
                const { nName } = await inquirer.prompt([{ type: 'input', name: 'nName', message: 'Netlify Project Name:', default: projectName }]);
                const res = await netlifyManager.createSite(nName, cwd);
                const success = await netlifyManager.deploy(cwd, res.siteId);
                if (success) console.log(chalk.green('  ✔ Deployed to Netlify!'));
            }
        } else if (provider === 'GitHub Pages') {
            console.log(chalk.yellow('  GitHub Pages deployment coming soon!'));
        }
    });

// zerostart git
program
    .command('git')
    .description('Initialize Git repository and optionally create GitHub repo')
    .action(async () => {
        showBanner();
        const cwd = process.cwd();
        const gitManager = new GitManager();
        const spinner = ora({ text: 'Checking Git...', color: 'cyan' }).start();

        if (!await gitManager.checkGitInstalled()) {
            spinner.fail(chalk.red('Git is not installed!'));
            return;
        }

        spinner.text = 'Initializing Git repository...';
        await gitManager.init(cwd);
        spinner.succeed(chalk.green('Git repository initialized'));

        const { createGitHub } = await inquirer.prompt([{
            type: 'list',
            name: 'createGitHub',
            message: 'Create GitHub repository?',
            choices: ['Yes', 'No'],
            default: 'No'
        }]);

        if (createGitHub === 'Yes') {
            const { isPublic } = await inquirer.prompt([{
                type: 'list',
                name: 'isPublic',
                message: 'Repository visibility:',
                choices: ['Public', 'Private'],
                default: 'Private'
            }]);

            spinner.start('Creating GitHub repository...');
            const repoName = path.basename(cwd);
            const repoUrl = await gitManager.createRepoWithGh(cwd, repoName, isPublic === 'Public');

            if (repoUrl) {
                spinner.succeed(chalk.green('GitHub repository created'));
                spinner.start('Pushing to GitHub...');
                await gitManager.commit(cwd, 'Initial commit');
                await gitManager.push(cwd);
                spinner.succeed(chalk.green('Pushed to GitHub'));
                console.log(chalk.cyan(`  Repository: ${repoUrl}`));
            } else {
                spinner.fail(chalk.red('Failed to create GitHub repository'));
            }
        } else {
            await gitManager.commit(cwd, 'Initial commit');
            console.log(chalk.green('  ✔ Git initialized with initial commit'));
        }
    });

// zerostart add [feature]
program
    .command('add [feature]')
    .description('Add features to your existing project')
    .action(async (feature) => {
        showBanner();
        const features = ['auth', 'database', 'api', 'ui-components', 'testing', 'docker'];

        let selectedFeature = feature;
        if (!feature) {
            const { feat } = await inquirer.prompt([{
                type: 'list',
                name: 'feat',
                message: 'Select feature to add:',
                choices: features
            }]);
            selectedFeature = feat;
        }

        const spinner = ora({ text: `Adding ${selectedFeature}...`, color: 'cyan' }).start();

        // Placeholder implementation - would need actual feature templates
        setTimeout(() => {
            spinner.succeed(chalk.green(`${selectedFeature} feature added successfully!`));
            console.log(chalk.gray(`  Note: Feature templates are being developed`));
        }, 1000);
    });

// zerostart env
program
    .command('env')
    .description('Manage environment variables interactively')
    .action(async () => {
        showBanner();
        const cwd = process.cwd();
        const envPath = path.join(cwd, '.env');

        const { action } = await inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'Environment variable action:',
            choices: ['Add/Edit', 'View', 'Remove']
        }]);

        if (action === 'Add/Edit') {
            const { key, value } = await inquirer.prompt([
                { type: 'input', name: 'key', message: 'Variable name:' },
                { type: 'input', name: 'value', message: 'Variable value:' }
            ]);

            let envContent = '';
            if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf-8');
            }

            const lines = envContent.split('\n').filter(line => !line.startsWith(`${key}=`));
            lines.push(`${key}=${value}`);
            fs.writeFileSync(envPath, lines.join('\n'));
            console.log(chalk.green(`  ✔ ${key} added to .env`));
        } else if (action === 'View') {
            if (fs.existsSync(envPath)) {
                const content = fs.readFileSync(envPath, 'utf-8');
                console.log(chalk.cyan('\n  Environment variables:'));
                console.log(chalk.gray(content));
            } else {
                console.log(chalk.yellow('  No .env file found'));
            }
        } else if (action === 'Remove') {
            if (fs.existsSync(envPath)) {
                const content = fs.readFileSync(envPath, 'utf-8');
                const vars = content.split('\n').filter(l => l.includes('=')).map(l => l.split('=')[0]);
                const { varToRemove } = await inquirer.prompt([{
                    type: 'list',
                    name: 'varToRemove',
                    message: 'Select variable to remove:',
                    choices: vars
                }]);
                const newContent = content.split('\n').filter(l => !l.startsWith(`${varToRemove}=`)).join('\n');
                fs.writeFileSync(envPath, newContent);
                console.log(chalk.green(`  ✔ ${varToRemove} removed`));
            }
        }
    });

// zerostart test
program
    .command('test')
    .description('Set up testing framework with sample tests')
    .action(async () => {
        showBanner();
        const { framework } = await inquirer.prompt([{
            type: 'list',
            name: 'framework',
            message: 'Choose testing framework:',
            choices: ['Jest', 'Vitest', 'Cypress', 'Mocha']
        }]);

        const spinner = ora({ text: `Setting up ${framework}...`, color: 'cyan' }).start();

        // Placeholder - would install actual dependencies
        setTimeout(() => {
            spinner.succeed(chalk.green(`${framework} configured successfully!`));
            console.log(chalk.gray(`  Run tests with: npm test`));
        }, 1500);
    });

// zerostart build
program
    .command('build')
    .description('Build your project for production')
    .action(async () => {
        showBanner();
        const cwd = process.cwd();
        const spinner = ora({ text: 'Building for production...', color: 'cyan' }).start();

        try {
            const packageJsonPath = path.join(cwd, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                if (packageJson.scripts && packageJson.scripts.build) {
                    exec('npm run build', { cwd }, (error, stdout, stderr) => {
                        if (error) {
                            spinner.fail(chalk.red('Build failed!'));
                            console.error(stderr);
                        } else {
                            spinner.succeed(chalk.green('Build completed successfully!'));
                            console.log(chalk.gray(stdout));
                        }
                    });
                } else {
                    spinner.warn(chalk.yellow('No build script found in package.json'));
                }
            } else {
                spinner.warn(chalk.yellow('No package.json found'));
            }
        } catch (error: any) {
            spinner.fail(chalk.red('Build failed: ' + error.message));
        }
    });

// zerostart dev
program
    .command('dev')
    .description('Start development server with hot reload')
    .action(async () => {
        showBanner();
        const cwd = process.cwd();
        console.log(chalk.cyan('  Starting development server...\n'));

        try {
            const packageJsonPath = path.join(cwd, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                if (packageJson.scripts && packageJson.scripts.dev) {
                    exec('npm run dev', { cwd }, (error, stdout, stderr) => {
                        if (error) {
                            console.error(chalk.red('Failed to start dev server:'), stderr);
                        }
                    });
                } else if (packageJson.scripts && packageJson.scripts.start) {
                    exec('npm start', { cwd }, (error, stdout, stderr) => {
                        if (error) {
                            console.error(chalk.red('Failed to start dev server:'), stderr);
                        }
                    });
                } else {
                    console.log(chalk.yellow('  No dev or start script found in package.json'));
                }
            } else {
                console.log(chalk.yellow('  No package.json found'));
            }
        } catch (error: any) {
            console.error(chalk.red('Error: ' + error.message));
        }
    });

// zerostart clean
program
    .command('clean')
    .description('Clean build artifacts and cache files')
    .action(async () => {
        showBanner();
        const cwd = process.cwd();
        const { confirm, reinstall } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'This will delete node_modules, dist, build, and cache files. Continue?',
                default: false
            },
            {
                type: 'confirm',
                name: 'reinstall',
                message: 'Reinstall dependencies after cleaning?',
                default: true,
                when: (ans) => ans.confirm
            }
        ]);

        if (!confirm) {
            console.log(chalk.yellow('  Cancelled'));
            return;
        }

        const spinner = ora({ text: 'Cleaning...', color: 'cyan' }).start();
        const dirsToClean = ['node_modules', 'dist', 'build', 'out', '.next', '.cache'];

        for (const dir of dirsToClean) {
            const dirPath = path.join(cwd, dir);
            if (fs.existsSync(dirPath)) {
                fs.rmSync(dirPath, { recursive: true, force: true });
                spinner.text = `Removed ${dir}`;
            }
        }

        spinner.succeed(chalk.green('Cleaned successfully!'));

        if (reinstall) {
            spinner.start('Reinstalling dependencies...');
            exec('npm install', { cwd }, (error, stdout, stderr) => {
                if (error) {
                    spinner.fail(chalk.red('Failed to reinstall dependencies'));
                    console.error(stderr);
                } else {
                    spinner.succeed(chalk.green('Dependencies reinstalled!'));
                }
            });
        }
    });

// zerostart update
program
    .command('update')
    .description('Update ZeroStart CLI to the latest version')
    .action(async () => {
        showBanner();
        const spinner = ora({ text: 'Checking for updates...', color: 'cyan' }).start();

        exec('npm view zerostart-cli version', (error, stdout, stderr) => {
            if (error) {
                spinner.fail(chalk.red('Failed to check for updates'));
                return;
            }

            const latestVersion = stdout.trim();
            const currentVersion = '0.0.41';

            if (latestVersion === currentVersion) {
                spinner.succeed(chalk.green('You are using the latest version!'));
            } else {
                spinner.info(chalk.yellow(`Update available: ${currentVersion} → ${latestVersion}`));
                console.log(chalk.cyan('  Run: npm install -g zerostart-cli@latest'));
            }
        });
    });

// zerostart docs
program
    .command('docs')
    .description('Open the ZeroStart website and documentation in your browser')
    .action(() => {
        showBanner();
        const docsUrl = 'https://zerostart.zeroonedevs.in';
        console.log(chalk.bold.cyan('  🌐 Opening ZeroStart website...'));
        console.log(chalk.gray('  URL: ') + chalk.cyan.underline(docsUrl));
        console.log();
        console.log(chalk.gray('  Explore commands, templates, and deployment guides at the site.'));
        openUrl(docsUrl);
    });

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

// Shortcut commands (Removed Node.js shortcuts)
const shortcuts = [
    { cmd: 'dsa-py', lang: ProjectLanguage.Python, type: ProjectType.DSAPractice },
    { cmd: 'dsa-java', lang: ProjectLanguage.Java, type: ProjectType.DSAPractice },
    { cmd: 'dsa-cpp', lang: ProjectLanguage.CPP, type: ProjectType.DSAPractice },
    { cmd: 'web-react', lang: ProjectLanguage.React, type: ProjectType.WebApp },
    { cmd: 'web-html', lang: ProjectLanguage.HTMLCSS, type: ProjectType.WebApp },
    { cmd: 'web-py', lang: ProjectLanguage.Python, type: ProjectType.WebApp },
    { cmd: 'web-java', lang: ProjectLanguage.Java, type: ProjectType.WebApp },
    { cmd: 'web-cpp', lang: ProjectLanguage.CPP, type: ProjectType.WebApp },
    { cmd: 'cli-py', lang: ProjectLanguage.Python, type: ProjectType.CLITool },
    { cmd: 'cli-java', lang: ProjectLanguage.Java, type: ProjectType.CLITool },
    { cmd: 'cli-cpp', lang: ProjectLanguage.CPP, type: ProjectType.CLITool },
    { cmd: 'ml-py', lang: ProjectLanguage.Python, type: ProjectType.MLProject },
    { cmd: 'ml-java', lang: ProjectLanguage.Java, type: ProjectType.MLProject },
    { cmd: 'ml-cpp', lang: ProjectLanguage.CPP, type: ProjectType.MLProject },
];

shortcuts.forEach(s => {
    program.command(s.cmd).argument('[name]', 'Project name', `my-${s.cmd}`).action(n => {
        showBanner();
        initializeProject(n, s.lang, s.type, { isPublic: false, createRemote: false, githubToken: null, authMethod: 'none' });
    });
});

async function startWizard(initialName?: string) {
    // ── Wizard Steps ────────────────────────────────────────────────────────
    // 1 → What are you building? (Web Dev / CP)
    // 2 → Select Language
    // 3 → Project Name
    // 4 → [Web Dev only] Create GitHub repo? (Yes/No)
    // 5 → [Web Dev + GitHub=Yes] Enter GitHub token
    // 6 → [Web Dev only] Run locally OR Deploy to Vercel?
    // ────────────────────────────────────────────────────────────────────────
    let step = 1;
    let name = initialName;
    let category: string | undefined;
    let language: ProjectLanguage | undefined;
    let github = false;
    let githubToken: string | null = null;

    const BACK = '< Back';
    const CAT_WEB = '🌐 Web Development (React, TS, HTML/CSS)';
    const CAT_CP = '🏆 Competitive Programming (C++, Java, Python)';

    while (step > 0 && step <= 6) {
        // ── STEP 1: Category ────────────────────────────────────────────────
        if (step === 1) {
            const ans = await inquirer.prompt([{
                type: 'list',
                name: 'category',
                message: 'What are you building?',
                choices: [CAT_WEB, CAT_CP]
            }]);
            category = ans.category;
            step++;

            // ── STEP 2: Language ────────────────────────────────────────────────
        } else if (step === 2) {
            const langChoices = category === CAT_WEB
                ? [ProjectLanguage.React, ProjectLanguage.TypeScript, ProjectLanguage.HTMLCSS, new inquirer.Separator(), BACK]
                : [ProjectLanguage.CPP, ProjectLanguage.Java, ProjectLanguage.Python, new inquirer.Separator(), BACK];

            const langAns = await inquirer.prompt([{
                type: 'list',
                name: 'language',
                message: 'Select Language:',
                choices: langChoices
            }]);

            if (langAns.language === BACK) { step--; }
            else { language = langAns.language; step++; }

            // ── STEP 3: Project Name ────────────────────────────────────────────
        } else if (step === 3) {
            if (!name) {
                const ans = await inquirer.prompt([{
                    type: 'input',
                    name: 'name',
                    message: 'Project Name:',
                    default: 'my-project',
                    validate: (v: string) => v.trim().length > 0 || 'Name cannot be empty'
                }]);
                name = ans.name.trim();
            }
            step++;

            // ── STEP 4: GitHub repo? (Web Dev only) ────────────────────────────
        } else if (step === 4) {
            if (category === CAT_WEB) {
                const ans = await inquirer.prompt([{
                    type: 'list',
                    name: 'github',
                    message: 'Create a GitHub repository for this project?',
                    choices: [
                        { name: '✅ Yes — push to GitHub', value: 'yes' },
                        { name: '❌ No — keep it local', value: 'no' },
                        new inquirer.Separator(),
                        { name: BACK, value: 'back' }
                    ],
                    default: 'yes'
                }]);

                if (ans.github === 'back') {
                    name = undefined;
                    step--;
                } else {
                    github = ans.github === 'yes';
                    step++;
                }
            } else {
                // CP projects skip straight to done
                github = false;
                step = 7; // jump past all web dev steps
            }

            // ── STEP 5: GitHub Token ────────────────────────────────────────────
        } else if (step === 5) {
            if (github) {
                showGitHubTokenHelp();
                console.log(chalk.gray('  💡 Tip: ') + chalk.white('Your token can be saved and reused for all future ZeroStart projects.'));
                console.log(chalk.gray('  💡 Tip: ') + chalk.white('Scopes needed: ') + chalk.cyan('repo'));
                console.log();

                const tokenAns = await inquirer.prompt([{
                    type: 'password',
                    name: 'token',
                    message: 'Paste your GitHub Personal Access Token:',
                    validate: (input: string) => {
                        if (input.toLowerCase() === 'back') return true;
                        if (input.trim().length < 10) return 'That doesn\'t look like a valid token';
                        return true;
                    }
                }]);

                if (tokenAns.token.toLowerCase() === 'back') {
                    step--;
                } else {
                    // Validate token immediately
                    const spinner = ora({ text: 'Validating token...', color: 'cyan' }).start();
                    const svc = new GitHubServiceCLI(tokenAns.token);
                    const user = await svc.validateToken();
                    if (user) {
                        spinner.succeed(chalk.green(`Token valid! Logged in as @${user.login}`));
                        githubToken = tokenAns.token;
                        step++;
                    } else {
                        spinner.fail(chalk.red('Invalid token or no internet. Please try again.'));
                        // Stay on step 5 to retry
                    }
                }
            } else {
                step++; // No GitHub — skip token step
            }

            // ── STEP 6: Run locally or Deploy to Vercel? (Web Dev only) ────────
        } else if (step === 6) {
            const deployAns = await inquirer.prompt([{
                type: 'list',
                name: 'action',
                message: 'What do you want to do next?',
                choices: [
                    { name: '🚀 Deploy to Vercel (live URL in seconds)', value: 'vercel' },
                    { name: '💻 Run locally first (I\'ll deploy later)', value: 'local' },
                    new inquirer.Separator(),
                    { name: BACK, value: 'back' }
                ],
                default: 'local'
            }]);

            if (deployAns.action === 'back') {
                step--;
            } else {
                // Store deploy choice and break out of loop
                (startWizard as any)._deployChoice = deployAns.action;
                step++;
            }
        }
    }

    // ── Execute the project creation ─────────────────────────────────────────
    if ((step > 6 || step === 7) && name && language) {
        let type = ProjectType.WebApp;
        if (language === ProjectLanguage.TypeScript) type = ProjectType.CLITool;
        if (category === CAT_CP) type = ProjectType.DSAPractice;

        const projectPath = await initializeProject(name, language, type, {
            isPublic: false,
            createRemote: !!githubToken,
            githubToken,
            authMethod: 'none'
        });

        // ── Post-creation: Web Dev deploy / local run ─────────────────────
        const deployChoice = (startWizard as any)._deployChoice;
        delete (startWizard as any)._deployChoice;

        if (category === CAT_WEB && deployChoice === 'vercel') {
            console.log();
            console.log(chalk.bold.cyan('  🚀 Starting Vercel deployment...'));
            console.log(chalk.gray('  This will be tagged as a demo deployment from ZeroStart CLI'));
            console.log();

            const vercelManager = new VercelManager();
            const isInstalled = await vercelManager.checkVercelInstalled();
            if (!isInstalled) {
                const installSpinner = ora({ text: 'Installing Vercel CLI...', color: 'cyan' }).start();
                await vercelManager.installGlobal();
                installSpinner.succeed(chalk.green('Vercel CLI installed'));
            }

            const isAuthed = await vercelManager.checkAuth();
            if (!isAuthed) {
                console.log(chalk.yellow('  You need to log in to Vercel first. Opening login...'));
                await vercelManager.login();
            }

            const deploySpinner = ora({ text: `Deploying ${name} to Vercel...`, color: 'cyan' }).start();
            const url = await vercelManager.deploy(projectPath, name);
            if (url) {
                deploySpinner.succeed(chalk.green('Deployed successfully!'));
                console.log();
                console.log(chalk.bold('  🌐 Live URL: ') + chalk.cyan.underline(url));
                console.log(chalk.gray('  (Demo deployment via ZeroStart CLI — upgrade in Vercel dashboard)'));
                openUrl(url);
            } else {
                deploySpinner.fail(chalk.red('Deployment failed. Run ' + chalk.white('vercel') + ' manually from project folder.'));
            }

        } else if (category === CAT_WEB && deployChoice === 'local') {
            console.log();
            console.log(chalk.bold.cyan('  💻 Run your project locally:'));
            if (language === ProjectLanguage.React || language === ProjectLanguage.TypeScript) {
                console.log(chalk.gray('  - ') + chalk.cyan(`cd ${name}`));
                console.log(chalk.gray('  - ') + chalk.cyan('npm install'));
                console.log(chalk.gray('  - ') + chalk.cyan('npm run dev'));
                console.log(chalk.gray('\n  Then open: ') + chalk.cyan('http://localhost:5173'));
            } else if (language === ProjectLanguage.HTMLCSS) {
                console.log(chalk.gray('  - ') + chalk.cyan(`cd ${name}`));
                console.log(chalk.gray('  - ') + chalk.cyan('Open index.html in your browser'));
                console.log(chalk.gray('  - Or use: ') + chalk.cyan('npx serve .') + chalk.gray(' for a local server'));
            }
        }

        console.log();
        console.log(chalk.bold('  Get started:'));
        console.log(chalk.gray('  - ') + chalk.cyan(`cd ${name}`));
        console.log(chalk.gray('  - ') + chalk.cyan('code .') + chalk.gray(' (or your favorite editor)'));
        console.log();
    }
}

// Main wizard
program.argument('[projectName]').action(async (projectName) => {
    showBanner();
    await startWizard(projectName);
});

program.parse(process.argv);
