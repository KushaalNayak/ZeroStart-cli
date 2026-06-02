
import { Octokit } from '@octokit/rest';
import { ProjectConfig } from '../types';

export class GitHubServiceCLI {
    private octokit: Octokit | undefined;

    constructor(private token: string) {
        if (token) {
            this.octokit = new Octokit({
                auth: token
            });
        }
    }

    private getClient(): Octokit {
        if (!this.octokit) {
            throw new Error("GitHub token not provided. Skipping GitHub operations.");
        }
        return this.octokit;
    }

    public async validateToken(): Promise<{ login: string } | null> {
        try {
            const client = this.getClient();
            const { data: user } = await client.users.getAuthenticated();
            return { login: user.login };
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(`GitHub token validation failed: ${error.message}`);
            }
            return null;
        }
    }

    public async createRepo(config: ProjectConfig): Promise<string | undefined> {
        try {
            const client = this.getClient();

            // Get current user
            const { data: user } = await client.users.getAuthenticated();

            // repository create in authenticated user's account
            await client.repos.createForAuthenticatedUser({
                name: config.name,
                description: config.description,
                private: !config.isTheRepoPublic,
                auto_init: false
            });

            if (config.type) {
                try {
                    await client.repos.replaceAllTopics({
                        owner: user.login,
                        repo: config.name,
                        names: [
                            config.type.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 35),
                            config.language.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 35)
                        ]
                    });
                } catch (e: unknown) {
                    console.warn("Could not set topics", e instanceof Error ? e.message : String(e));
                }
            }

            // Return clean HTTPS URL (without embedding the token)
            return `https://github.com/${user.login}/${config.name}.git`;

        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const apiErr = error as any;
                console.error(`GitHub API Error (${apiErr.status}): ${apiErr.message}`);
            } else if (error instanceof Error) {
                console.error(`GitHub API Error: ${error.message}`);
            } else {
                console.error(`Unknown GitHub API Error occurred`);
            }
            // Don't throw, just return undefined so the process continues locally
            return undefined;
        }
    }
}
