import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export interface Config {
    openaiApiKey?: string;
    // Add more config fields here as needed
}

export class ConfigManager {
    private configPath: string;

    constructor() {
        // Store config in ~/.zerostart/config.json
        const homeDir = os.homedir();
        const configDir = path.join(homeDir, '.zerostart');
        this.configPath = path.join(configDir, 'config.json');
    }

    private async ensureConfigDir() {
        const configDir = path.dirname(this.configPath);
        if (!fs.existsSync(configDir)) {
            await fs.ensureDir(configDir);
        }
    }

    async getConfig(): Promise<Config> {
        try {
            if (fs.existsSync(this.configPath)) {
                const content = await fs.readFile(this.configPath, 'utf8');
                return JSON.parse(content);
            }
        } catch (error) {
            console.error('Error reading config file:', error);
        }
        return {};
    }

    async setConfig(newConfig: Partial<Config>): Promise<void> {
        await this.ensureConfigDir();
        const currentConfig = await this.getConfig();
        const updatedConfig = { ...currentConfig, ...newConfig };
        await fs.writeFile(this.configPath, JSON.stringify(updatedConfig, null, 2));
    }

    async getOpenAIApiKey(): Promise<string | undefined> {
        // Environment variable takes precedence
        if (process.env.OPENAI_API_KEY) {
            return process.env.OPENAI_API_KEY;
        }

        const config = await this.getConfig();
        return config.openaiApiKey;
    }

    async setOpenAIApiKey(key: string): Promise<void> {
        await this.setConfig({ openaiApiKey: key });
    }
}
