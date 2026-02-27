import OpenAI from 'openai';
import { ConfigManager } from '../managers/ConfigManager';

export interface AIProjectTemplate {
    projectName: string;
    folders: string[];
    files: Array<{
        path: string;
        content: string;
    }>;
    dependencies: string[];
    devDependencies: string[];
}

export class AIService {
    private openai: OpenAI | null = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
        }
    }

    private async ensureInitialized() {
        if (this.openai) return;

        const configManager = new ConfigManager();
        const apiKey = await configManager.getOpenAIApiKey();

        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
        }
    }

    async generateProject(prompt: string, stack?: string): Promise<AIProjectTemplate> {
        await this.ensureInitialized();
        if (!this.openai) {
            throw new Error('OpenAI API Key not found. Please set it using environment variables or user config.');
        }

        const systemPrompt = `
            You are a world-class software architect and lead developer. 
            Generate a complete, professional project structure based on the user's requirements.
            
            Strictly follow this JSON schema for your response:
            {
                "projectName": "Name of the project",
                "folders": ["list/of/folders", "src", "src/components"],
                "files": [
                    {
                        "path": "folder/filename.ext",
                        "content": "Full code content"
                    }
                ],
                "dependencies": ["list", "of", "npm", "dependencies"],
                "devDependencies": ["list", "of", "npm", "dev", "dependencies"]
            }

            Rules:
            - Create a robust, production-ready starting point.
            - Include all necessary configuration files:
                - For Node.js: package.json (with scripts), tsconfig.json, .gitignore, README.md.
                - For others: Relevant manifest/config files.
            - Ensure the \`dependencies\` and \`devDependencies\` arrays match what is in the package.json/manifest.
            - Ensure all paths are relative to the project root.
            - Do not include placeholders; provide actual initial code.
            - The output must be valid JSON only.
        `;

        const userMessage = `Project Description: ${prompt}${stack ? `\nPreferred Stack: ${stack}` : ''}`;

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                response_format: { type: 'json_object' }
            });

            const content = response.choices[0].message.content;
            if (!content) {
                throw new Error('AI returned an empty response.');
            }

            return JSON.parse(content) as AIProjectTemplate;
        } catch (error: any) {
            if (error.status === 401) {
                throw new Error('Invalid OpenAI API Key.');
            }
            throw new Error(`AI Service Error: ${error.message}`);
        }
    }
}
