import * as cp from 'child_process';
import * as util from 'util';
import { spawn } from 'child_process';
import chalk from 'chalk';

const exec = util.promisify(cp.exec);

export class NetlifyManager {
    public async checkNetlifyInstalled(): Promise<boolean> {
        try {
            await exec('netlify --version');
            return true;
        } catch (error) {
            return false;
        }
    }

    public async installGlobal(): Promise<boolean> {
        try {
            await exec('npm install -g netlify-cli');
            return true;
        } catch (error) {
            console.error('Failed to install Netlify CLI globally');
            return false;
        }
    }


    public async createSite(name: string, cwd: string): Promise<{ success: boolean; reason?: 'taken' | 'error'; siteId?: string }> {
        try {
            console.log(chalk.cyan(`  Creating Netlify site "${name}"...`));

            return new Promise((resolve) => {
                const child = spawn('netlify', ['sites:create', '--name', name], {
                    cwd,
                    stdio: ['inherit', 'pipe', 'pipe']
                });

                let output = '';

                child.stdout?.on('data', (data) => {
                    const str = data.toString();
                    output += str;
                    process.stdout.write(data);
                });

                child.stderr?.on('data', (data) => {
                    output += data.toString();
                    process.stderr.write(data);
                });

                child.on('close', (code) => {
                    if (code === 0) {
                        // Extract Site ID/Project ID
                        // Format: "Site ID: 022..." or "Project ID: 022..."
                        const idMatch = output.match(/(?:Site|Project)\s+ID:\s+([a-zA-Z0-9-]+)/i);
                        const siteId = idMatch ? idMatch[1] : undefined;
                        resolve({ success: true, siteId });
                    } else {
                        if (output.toLowerCase().includes('already exists') || output.toLowerCase().includes('taken')) {
                            resolve({ success: false, reason: 'taken' });
                        } else {
                            resolve({ success: false, reason: 'error' });
                        }
                    }
                });
            });

        } catch (error) {
            console.error('Failed to create Netlify site:', error);
            return { success: false, reason: 'error' };
        }
    }

    public async deploy(cwd: string, siteId?: string): Promise<boolean> {
        return new Promise((resolve) => {
            const args = ['deploy', '--prod'];
            if (siteId) {
                args.push('--site', siteId);
            }

            const child = spawn('netlify', args, {
                cwd,
                stdio: 'inherit'
            });

            child.on('close', (code) => {
                resolve(code === 0);
            });
        });
    }

    public async checkAuth(): Promise<boolean> {
        try {
            await exec('netlify status');
            return true;
        } catch {
            return false;
        }
    }

    public async login(): Promise<boolean> {
        return new Promise((resolve) => {
            const child = spawn('netlify', ['login'], { stdio: 'inherit' });
            child.on('close', (code) => {
                resolve(code === 0);
            });
        });
    }
}
