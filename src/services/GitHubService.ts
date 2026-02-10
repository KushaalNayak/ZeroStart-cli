
import * as vscode from 'vscode';
import { Octokit } from '@octokit/rest';
import { ProjectConfig } from '../types';

export class GitHubService {
    private octokit: Octokit | undefined;

    private async getClient(): Promise<Octokit> {
        if (this.octokit) {
            return this.octokit;
        }

        const session = await vscode.authentication.getSession('github', ['repo', 'user'], { createIfNone: true });

        this.octokit = new Octokit({
            auth: session.accessToken
        });

        return this.octokit;
    }

    public async createRepo(config: ProjectConfig): Promise<string | undefined> {
        try {
            const client = await this.getClient();

            // Get current user to avoid hardcoding or guessing
            const { data: user } = await client.users.getAuthenticated();

            // repository create in authenticated user's account
            const { data: repo } = await client.repos.createForAuthenticatedUser({
                name: config.name,
                description: config.description,
                private: !config.isTheRepoPublic,
                auto_init: false // We will push our own init
            });

            // Add topics if possible (separate call usually or check docs, octokit create might support it? 
            // no, 'topics' is not in createRepo options usually, updateRepo is needed)
            // But for MVP, skipping topics or doing update
            if (config.type) {
                try {
                    await client.repos.replaceAllTopics({
                        owner: user.login,
                        repo: config.name,
                        names: [config.type.toLowerCase().replace(/ /g, '-'), config.language.toLowerCase()]
                    });
                } catch (e) {
                    console.warn("Could not set topics", e);
                }
            }

            // Return the clone URL. We can inject token for push if we want to be sure.
            // But better to use the clone_url and let GitManager handle auth or inject token there.
            // I'll return the URL with token for the initial push to ensure it works without prompting.
            // CAREFUL: This token is in the remote URL.
            // A safer way is to use the standard clone_url and assume credential helper, 
            // OR use the token but warn user.
            // Given "Production Ready", relying on global git auth is better practice than baking tokens into .git/config.
            // HOWEVER, for "One Command" automated experience, users might not have git cli auth set up.
            // I will use the token method for reliability in this specific session, but it is a trade-off.
            // Actually, cleaner is: return `https://x-access-token:${token}@github.com/${user.login}/${config.name}.git`

            const session = await vscode.authentication.getSession('github', ['repo'], { createIfNone: false });
            if (session) {
                return `https://x-access-token:${session.accessToken}@github.com/${user.login}/${config.name}.git`;
            }
            return repo.clone_url;

        } catch (error: any) {
            vscode.window.showErrorMessage(`GitHub API Error: ${error.message}`);
            throw error;
        }
    }
}
