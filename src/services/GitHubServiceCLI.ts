
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
        } catch (error) {
            return null;
        }
    }

    public async createRepo(config: ProjectConfig): Promise<string | undefined> {
        try {
            const client = this.getClient();

            // Get current user
            const { data: user } = await client.users.getAuthenticated();

            // repository create in authenticated user's account
            const { data: repo } = await client.repos.createForAuthenticatedUser({
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
                            config.type.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                            config.language.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                        ]
                    });
                } catch (e) {
                    console.warn("Could not set topics", e);
                }
            }

            // For CLI with PAT, we can inject the token for push
            // https://<token>@github.com/user/repo.git
            return `https://${this.token}@github.com/${user.login}/${config.name}.git`;

        } catch (error: any) {
            if (error.response) {
                console.error(`GitHub API Error (${error.status}): ${error.message}`);
                // console.debug(`Response:`, error.response.data);
            } else {
                console.error(`GitHub API Error: ${error.message}`);
            }
            // Don't throw, just return undefined so the process continues locally
            return undefined;
        }
    }
}
