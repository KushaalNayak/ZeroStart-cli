
import * as cp from 'child_process';
import * as util from 'util';

const exec = util.promisify(cp.exec);

export class GitManager {
    public async checkGitInstalled(): Promise<boolean> {
        try {
            await exec('git --version');
            return true;
        } catch (error) {
            return false;
        }
    }

    public async init(cwd: string) {
        try {
            await exec('git init', { cwd });
        } catch (error: any) {
            throw new Error(`Failed to initialize git: ${error.message}`);
        }
    }

    public async commit(cwd: string, message: string) {
        try {
            await exec('git add .', { cwd });
            await exec(`git commit -m "${message}"`, { cwd });
            // Ensure branch is main
            await exec('git branch -M main', { cwd });
        } catch (error: any) {
            // If no changes to commit, it might fail, which is okay but let's log/throw if critical
            console.warn(`Git commit failed (might be empty): ${error.message}`);
        }
    }

    /**
     * Stage only specific files and commit them.
     * Used for the first human-style commit (README, .gitignore etc.) before
     * committing the rest of the project structure as a second commit.
     */
    public async commitSelective(cwd: string, files: string[], message: string) {
        try {
            for (const file of files) {
                // git add is silent if the file doesn't exist — that's fine
                await exec(`git add "${file}"`, { cwd }).catch(() => { });
            }
            await exec(`git commit -m "${message}" --allow-empty`, { cwd });
        } catch (error: any) {
            console.warn(`Selective git commit failed: ${error.message}`);
        }
    }

    public async addRemote(cwd: string, url: string) {
        try {
            await exec(`git remote add origin ${url}`, { cwd });
        } catch (error: any) {
            throw new Error(`Failed to add remote: ${error.message}`);
        }
    }

    public async push(cwd: string) {
        try {
            await exec('git push -u origin main', { cwd });
        } catch (error: any) {
            throw new Error(`Failed to push to remote: ${error.message}`);
        }
    }

    public async setRemoteUrl(cwd: string, url: string) {
        try {
            await exec(`git remote set-url origin ${url}`, { cwd });
        } catch (error: any) {
            console.warn(`Failed to set remote url: ${error.message}`);
        }
    }

    public async checkGhInstalled(): Promise<boolean> {
        try {
            await exec('gh --version');
            return true;
        } catch (error) {
            return false;
        }
    }

    public async checkGhAuth(): Promise<boolean> {
        try {
            await exec('gh auth status');
            return true;
        } catch (error) {
            return false;
        }
    }

    public async createRepoWithGh(cwd: string, name: string, isPublic: boolean): Promise<string> {
        try {
            const visibility = isPublic ? '--public' : '--private';
            // Create repo and push
            // gh repo create <name> --<visibility> --source=. --remote=origin --push
            await exec(`gh repo create "${name}" ${visibility} --source=. --remote=origin`, { cwd });
            return `https://github.com/${(await this.getGhUser())}/${name}`;
        } catch (error: any) {
            throw new Error(`Failed to create repo with gh: ${error.message}`);
        }
    }

    private async getGhUser(): Promise<string> {
        try {
            const { stdout } = await exec('gh api user --jq .login');
            return stdout.trim();
        } catch {
            return 'unknown';
        }
    }
}
