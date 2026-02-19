
import * as fs from 'fs';
import * as path from 'path';
import { ProjectConfig, ProjectLanguage, ProjectType } from '../types';

export class TemplateManager {
    public async createProjectStructure(config: ProjectConfig) {
        const root = config.path;
        if (!fs.existsSync(root)) {
            fs.mkdirSync(root, { recursive: true });
        }

        // Create standard files
        this.createReadme(config);
        this.createRoadmap(config);
        this.createGitIgnore(config);

        // Create type specific folders
        this.createTypeSpecificStructure(config);

        // Create language specific files
        switch (config.language) {
            case ProjectLanguage.Python:
                await this.createPythonStructure(config);
                break;
            case ProjectLanguage.Java:
                await this.createJavaStructure(config);
                break;
            case ProjectLanguage.CPP:
                await this.createCPPStructure(config);
                break;
            case ProjectLanguage.React:
                await this.createReactStructure(config);
                break;
            case ProjectLanguage.Nextjs:
                await this.createNextjsStructure(config);
                break;
            case ProjectLanguage.Vue:
                await this.createVueStructure(config);
                break;
            case ProjectLanguage.Svelte:
                await this.createSvelteStructure(config);
                break;
            case ProjectLanguage.Express:
                await this.createExpressStructure(config);
                break;
            case ProjectLanguage.TypeScript:
                await this.createTypeScriptStructure(config);
                break;
            case ProjectLanguage.HTMLCSS:
                await this.createHTMLCSSStructure(config);
                break;
        }
    }

    private async createTypeScriptStructure(config: ProjectConfig) {
        const packageJson = {
            name: config.name,
            version: "1.0.0",
            description: config.description,
            main: "dist/index.js",
            scripts: {
                build: "tsc",
                start: "node dist/index.js",
                dev: "ts-node src/index.ts",
                test: "echo \"Error: no test specified\" && exit 1"
            },
            devDependencies: {
                "typescript": "^5.3.3",
                "ts-node": "^10.9.2",
                "@types/node": "^20.11.0"
            }
        };
        fs.writeFileSync(path.join(config.path, 'package.json'), JSON.stringify(packageJson, null, 2));

        const src = path.join(config.path, 'src');
        if (!fs.existsSync(src)) fs.mkdirSync(src);

        fs.writeFileSync(path.join(src, 'index.ts'), 'console.log("Hello from TypeScript!");');

        fs.writeFileSync(path.join(config.path, 'tsconfig.json'), `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
`);
    }

    private createTypeSpecificStructure(config: ProjectConfig) {
        switch (config.type) {
            case ProjectType.WebApp:
                this.ensureDir(config.path, 'public');
                this.ensureDir(config.path, 'assets');
                break;
            case ProjectType.CLITool:
                this.ensureDir(config.path, 'bin');
                break;
            case ProjectType.DSAPractice:
                this.ensureDir(config.path, 'problems');
                this.ensureDir(config.path, 'solutions');
                break;
            case ProjectType.MLProject:
                this.ensureDir(config.path, 'data');
                this.ensureDir(config.path, 'notebooks');
                this.ensureDir(config.path, 'models');
                break;
        }
    }

    private ensureDir(root: string, dir: string) {
        const fullPath = path.join(root, dir);
        if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    }

    private createReadme(config: ProjectConfig) {
        const content = `# ${config.name}

## Description
${config.description}

## Tech Stack
- Language: ${config.language}
- Type: ${config.type}

## Installation
\`\`\`bash
# Clone the repository
git clone <repo-url>
cd ${config.name}

# Install dependencies
npm install # or pip install -r requirements.txt / mvn install
\`\`\`

## Usage
\`\`\`bash
npm start # or python main.py / java -jar target/app.jar
\`\`\`

## Future Scope
- Add more features
- Improve UI/UX
- optimize performance
`;
        fs.writeFileSync(path.join(config.path, 'README.md'), content);
    }

    private createRoadmap(config: ProjectConfig) {
        const content = `# Roadmap for ${config.name}

- [ ] Initial Setup
- [ ] Core Features Implementation
- [ ] Testing & Debugging
- [ ] Documentation
- [ ] Deployment
`;
        fs.writeFileSync(path.join(config.path, 'roadmap.md'), content);
    }

    private createGitIgnore(config: ProjectConfig) {
        let content = '';
        switch (config.language) {
            case ProjectLanguage.React:
            case ProjectLanguage.Nextjs:
            case ProjectLanguage.Vue:
            case ProjectLanguage.Svelte:
            case ProjectLanguage.Express:
            case ProjectLanguage.TypeScript:
                content = 'node_modules/\n.env\ndist/\nbuild/\n.next/\n.svelte-kit/';
                break;
            case ProjectLanguage.Python:
                content = '__pycache__/\n*.pyc\nvenv/\n.env';
                break;
            case ProjectLanguage.Java:
                content = 'target/\n*.class\n.idea/\n*.iml';
                break;
            case ProjectLanguage.CPP:
                content = 'build/\n*.o\n*.exe';
                break;
        }
        fs.writeFileSync(path.join(config.path, '.gitignore'), content);
    }

    private async createPythonStructure(config: ProjectConfig) {
        fs.writeFileSync(path.join(config.path, 'main.py'), 'print("Hello, World!")');
        fs.writeFileSync(path.join(config.path, 'requirements.txt'), '# Add your dependencies here');
    }

    private async createJavaStructure(config: ProjectConfig) {
        const srcDir = path.join(config.path, 'src', 'main', 'java', 'com', 'example');
        fs.mkdirSync(srcDir, { recursive: true });
        const mainClass = `package com.example;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
        fs.writeFileSync(path.join(srcDir, 'Main.java'), mainClass);

        const pomXml = `<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>${config.name}</artifactId>
    <version>1.0-SNAPSHOT</version>
</project>`;
        fs.writeFileSync(path.join(config.path, 'pom.xml'), pomXml);
    }

    private async createCPPStructure(config: ProjectConfig) {
        const mainCpp = `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`;
        fs.writeFileSync(path.join(config.path, 'main.cpp'), mainCpp);
        const cmake = `cmake_minimum_required(VERSION 3.10)
project(${config.name})

set(CMAKE_CXX_STANDARD 11)

add_executable(${config.name} main.cpp)`;
        fs.writeFileSync(path.join(config.path, 'CMakeLists.txt'), cmake);
    }

    private async createReactStructure(config: ProjectConfig) {
        const packageJson = {
            name: config.name,
            private: true,
            version: "0.0.0",
            type: "module",
            scripts: {
                dev: "vite",
                build: "tsc && vite build",
                preview: "vite preview"
            },
            dependencies: {
                react: "^18.2.0",
                "react-dom": "^18.2.0"
            },
            devDependencies: {
                "@types/react": "^18.2.43",
                "@types/react-dom": "^18.2.17",
                "@vitejs/plugin-react": "^4.2.1",
                "typescript": "^5.2.2",
                "vite": "^5.0.8"
            }
        };
        fs.writeFileSync(path.join(config.path, 'package.json'), JSON.stringify(packageJson, null, 2));

        const src = path.join(config.path, 'src');
        if (!fs.existsSync(src)) fs.mkdirSync(src);

        fs.writeFileSync(path.join(src, 'App.tsx'), `

function App() {
  return (
    <div>
      <h1>Hello React + Vite!</h1>
    </div>
  );
}

export default App;
`);
        fs.writeFileSync(path.join(src, 'main.tsx'), `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`);
        fs.writeFileSync(path.join(config.path, 'index.html'), `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);
        fs.writeFileSync(path.join(config.path, 'vite.config.ts'), `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
`);
        fs.writeFileSync(path.join(config.path, 'tsconfig.json'), `
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`);
        fs.writeFileSync(path.join(config.path, 'tsconfig.node.json'), `
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
`);
        this.createNetlifyConfig(config);
    }

    private async createHTMLCSSStructure(config: ProjectConfig) {
        fs.writeFileSync(path.join(config.path, 'index.html'), `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.name}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to ${config.name}</h1>
        <p>This is a simple HTML/CSS project created by ZeroStart CLI!</p>
    </div>
    <script src="script.js"></script>
</body>
</html>
`);
        fs.writeFileSync(path.join(config.path, 'style.css'), `
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f4f4f9;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

.container {
    text-align: center;
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

h1 {
    color: #007bff;
}
`);
        fs.writeFileSync(path.join(config.path, 'script.js'), `
console.log("${config.name} initialized!");
`);

        const netlifyContent = `[build]
  publish = "."
`;
        fs.writeFileSync(path.join(config.path, 'netlify.toml'), netlifyContent);
    }

    private async createNextjsStructure(config: ProjectConfig) {
        const packageJson = {
            name: config.name,
            version: "0.1.0",
            private: true,
            scripts: {
                dev: "next dev",
                build: "next build",
                start: "next start",
                lint: "next lint"
            },
            dependencies: {
                "next": "14.1.0",
                "react": "^18",
                "react-dom": "^18"
            },
            devDependencies: {
                "typescript": "^5",
                "@types/node": "^20",
                "@types/react": "^18",
                "@types/react-dom": "^18",
                "autoprefixer": "^10.0.1",
                "postcss": "^8",
                "tailwindcss": "^3.3.0",
                "eslint": "^8",
                "eslint-config-next": "14.1.0"
            }
        };
        fs.writeFileSync(path.join(config.path, 'package.json'), JSON.stringify(packageJson, null, 2));

        const app = path.join(config.path, 'app');
        if (!fs.existsSync(app)) fs.mkdirSync(app);

        fs.writeFileSync(path.join(app, 'layout.tsx'), `
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${config.name}",
  description: "${config.description}",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`);
        fs.writeFileSync(path.join(app, 'page.tsx'), `
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to ${config.name} (Next.js)</h1>
    </main>
  );
}
`);
        fs.writeFileSync(path.join(app, 'globals.css'), `
@tailwind base;
@tailwind components;
@tailwind utilities;
`);
        fs.writeFileSync(path.join(config.path, 'tailwind.config.ts'), `
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
`);
        fs.writeFileSync(path.join(config.path, 'next.config.mjs'), `
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
`);
        fs.writeFileSync(path.join(config.path, 'tsconfig.json'), `
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`);
        this.createNetlifyConfig(config);
    }

    private async createVueStructure(config: ProjectConfig) {
        const packageJson = {
            name: config.name,
            version: "0.0.0",
            private: true,
            type: "module",
            scripts: {
                dev: "vite",
                build: "vue-tsc && vite build",
                preview: "vite preview"
            },
            dependencies: {
                "vue": "^3.4.15"
            },
            devDependencies: {
                "@vitejs/plugin-vue": "^5.0.3",
                "typescript": "^5.3.3",
                "vite": "^5.0.12",
                "vue-tsc": "^1.8.27"
            }
        };
        fs.writeFileSync(path.join(config.path, 'package.json'), JSON.stringify(packageJson, null, 2));

        const src = path.join(config.path, 'src');
        if (!fs.existsSync(src)) fs.mkdirSync(src);

        fs.writeFileSync(path.join(src, 'App.vue'), `
<template>
  <div>
    <h1>Hello Vue 3 + Vite!</h1>
  </div>
</template>
`);
        fs.writeFileSync(path.join(src, 'main.ts'), `
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`);
        fs.writeFileSync(path.join(config.path, 'index.html'), `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${config.name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`);
        fs.writeFileSync(path.join(config.path, 'vite.config.ts'), `
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
`);
        this.createNetlifyConfig(config);
    }

    private async createSvelteStructure(config: ProjectConfig) {
        const packageJson = {
            name: config.name,
            version: "0.0.1",
            private: true,
            type: "module",
            scripts: {
                dev: "vite",
                build: "vite build",
                preview: "vite preview",
                check: "svelte-check --tsconfig ./tsconfig.json"
            },
            devDependencies: {
                "@sveltejs/vite-plugin-svelte": "^3.0.1",
                "@tsconfig/svelte": "^5.0.2",
                "svelte": "^4.2.9",
                "svelte-check": "^3.6.3",
                "tslib": "^2.6.2",
                "typescript": "^5.3.3",
                "vite": "^5.0.12"
            }
        };
        fs.writeFileSync(path.join(config.path, 'package.json'), JSON.stringify(packageJson, null, 2));

        const src = path.join(config.path, 'src');
        if (!fs.existsSync(src)) fs.mkdirSync(src);

        fs.writeFileSync(path.join(src, 'App.svelte'), `
<script lang="ts">
  let name = "${config.name}";
</script>

<main>
  <h1>Hello {name} (Svelte)</h1>
</main>
`);
        fs.writeFileSync(path.join(src, 'main.ts'), `
import './app.css'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app')!,
})

export default app
`);
        fs.writeFileSync(path.join(src, 'app.css'), `
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}
`);
        fs.writeFileSync(path.join(config.path, 'index.html'), `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${config.name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`);
        fs.writeFileSync(path.join(config.path, 'vite.config.ts'), `
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
})
`);
        this.createNetlifyConfig(config);
    }

    private async createExpressStructure(config: ProjectConfig) {
        const packageJson = {
            name: config.name,
            version: "1.0.0",
            description: config.description,
            main: "src/index.js",
            scripts: {
                start: "node src/index.js",
                dev: "nodemon src/index.js"
            },
            dependencies: {
                "express": "^4.18.2",
                "cors": "^2.8.5",
                "dotenv": "^16.3.1"
            },
            devDependencies: {
                "nodemon": "^3.0.2"
            }
        };
        fs.writeFileSync(path.join(config.path, 'package.json'), JSON.stringify(packageJson, null, 2));

        const src = path.join(config.path, 'src');
        if (!fs.existsSync(src)) fs.mkdirSync(src);

        fs.writeFileSync(path.join(src, 'index.js'), `
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${config.name} API' });
});

app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
});
`);
        fs.writeFileSync(path.join(config.path, '.env'), "PORT=3000\n");
    }

    private createNetlifyConfig(config: ProjectConfig) {
        const content = `[build]
  command = "npm run build"
  publish = "dist"

[dev]
  command = "npm run dev"
`;
        fs.writeFileSync(path.join(config.path, 'netlify.toml'), content);
    }
}
