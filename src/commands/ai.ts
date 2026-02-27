import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs-extra';
import { AIService } from '../services/aiService';
import { ConfigManager } from '../managers/ConfigManager';
import open from 'open';

async function ensureAuth(): Promise<string | null> {
    const configManager = new ConfigManager();
    const existingKey = await configManager.getOpenAIApiKey();

    if (existingKey) {
        return existingKey;
    }

    console.log(chalk.yellow('  OpenAI API Key not found.'));
    console.log(chalk.gray('  To use the AI Architect, you need an API key from OpenAI.'));
    console.log(chalk.cyan('  1. Visit: ') + chalk.white('https://platform.openai.com/api-keys'));
    console.log(chalk.cyan('  2. Create a new secret key.'));
    console.log(chalk.cyan('  3. Paste it here to save it for future use.\n'));

    const { openLink } = await inquirer.prompt([{
        type: 'confirm',
        name: 'openLink',
        message: 'Would you like to open the OpenAI API key page in your browser?',
        default: true
    }]);

    if (openLink) {
        await open('https://platform.openai.com/api-keys');
    }

    const { apiKey } = await inquirer.prompt([{
        type: 'password',
        name: 'apiKey',
        message: 'Paste your OpenAI API Key:',
        validate: (input) => input.startsWith('sk-') || 'Invalid key format. Usually starts with "sk-"'
    }]);

    const { saveKey } = await inquirer.prompt([{
        type: 'confirm',
        name: 'saveKey',
        message: 'Save this key locally for future use?',
        default: true
    }]);

    if (saveKey) {
        await configManager.setOpenAIApiKey(apiKey);
        console.log(chalk.green('  ✔ Key saved successfully to ~/.zerostart/config.json\n'));
    }

    return apiKey;
}

export async function handleAICommand(initialPrompt?: string) {
    console.log(chalk.bold.cyan('\n  ✨ ZeroStart AI Architect'));
    console.log(chalk.gray('  Describe your project and let AI build the foundation.\n'));

    const apiKey = await ensureAuth();
    if (!apiKey) return;

    let description = initialPrompt;
    let stack = '';

    if (!description) {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'description',
                message: 'Describe your project idea:',
                validate: (input) => input.length > 5 || 'Please provide a more detailed description.'
            },
            {
                type: 'input',
                name: 'stack',
                message: 'Preferred stack (optional, e.g., React, Next.js, Express):',
                default: ''
            }
        ]);
        description = answers.description;
        stack = answers.stack;
    }

    const spinner = ora({
        text: 'AI is architecting your project...',
        color: 'cyan'
    }).start();

    try {
        const aiService = new AIService(apiKey);
        const projectTemplate = await aiService.generateProject(description!, stack);

        spinner.text = 'AI analysis complete. Generating files...';

        const rootDir = process.cwd();
        // Sanitize project name: lowercase, replace spaces/special chars with dashes, remove redundant dashes
        const sanitizedName = projectTemplate.projectName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        // Final safety check: ensuring it stays within the current directory
        const projectDir = path.join(rootDir, path.basename(sanitizedName));

        // Check if directory exists
        if (fs.existsSync(projectDir)) {
            spinner.stop();
            const { overwrite } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'overwrite',
                    message: `Directory ${chalk.yellow(projectTemplate.projectName)} already exists. Overwrite?`,
                    default: false
                }
            ]);

            if (!overwrite) {
                console.log(chalk.yellow('\n  Aborted. No files were created.'));
                return;
            }
            spinner.start('Removing existing directory...');
            await fs.remove(projectDir);
            spinner.text = 'Generating files...';
        }

        // Create folders
        await fs.ensureDir(projectDir);
        for (const folder of projectTemplate.folders) {
            await fs.ensureDir(path.join(projectDir, folder));
        }

        // Create files
        for (const file of projectTemplate.files) {
            const filePath = path.join(projectDir, file.path);
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, file.content);
        }

        spinner.succeed(chalk.green(`  ✔ Project "${projectTemplate.projectName}" generated successfully!`));

        console.log('\n' + chalk.bold('  Next Steps:'));
        console.log(chalk.cyan(`    cd ${path.basename(projectDir)}`));
        if (projectTemplate.dependencies.length > 0 || projectTemplate.devDependencies.length > 0) {
            console.log(chalk.cyan('    npm install'));
        }
        console.log(chalk.cyan('    npm start (or your project\'s start command)'));
        console.log();

        if (projectTemplate.dependencies.length > 0) {
            console.log(chalk.gray('  Key dependencies suggested: ') + chalk.white(projectTemplate.dependencies.slice(0, 5).join(', ') + (projectTemplate.dependencies.length > 5 ? '...' : '')));
        }

    } catch (error: any) {
        spinner.fail(chalk.red(`  Error: ${error.message}`));
    }
}
