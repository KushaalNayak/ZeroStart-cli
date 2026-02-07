
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
}
