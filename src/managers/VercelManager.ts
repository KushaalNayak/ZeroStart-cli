
import * as cp from 'child_process';
import * as util from 'util';
import { spawn } from 'child_process';

const exec = util.promisify(cp.exec);

export class VercelManager {
    public async checkVercelInstalled(): Promise<boolean> {
        try {
            await exec('vercel --version');
            return true;
        } catch (error) {
            return false;
        }
    }

    public async deploy(cwd: string, projectName?: string): Promise<string | null> {
        try {
            // vercel deploy --prod --yes --name <name>
            const cmd = projectName
                ? `vercel deploy --prod --yes --name ${projectName}`
                : 'vercel deploy --prod --yes';

            const { stdout } = await exec(cmd, { cwd });
            return stdout.trim();
        } catch (error: any) {
            console.error(`Vercel deployment failed: ${error.message}`);
            return null;
        }
    }

    public async checkAuth(): Promise<boolean> {
        try {
            // vercel login usually requires interaction. failing that, we check status.
            // simpler to just check if they can access user info
            await exec('vercel whoami');
            return true;
        } catch {
            return false;
        }
    }

    public async login(): Promise<boolean> {
        return new Promise((resolve) => {
            const child = spawn('vercel', ['login'], { stdio: 'inherit' });
            child.on('close', (code) => {
                resolve(code === 0);
            });
        });
    }

    public async installGlobal(): Promise<boolean> {
        try {
            await exec('npm install -g vercel');
            return true;
        } catch (error) {
            console.error('Failed to install Vercel CLI globally');
            return false;
        }
    }
}
