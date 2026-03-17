# ZeroStart CLI 🚀

> **Create and deploy a complete project — in seconds.**

[![npm version](https://img.shields.io/npm/v/zerostart-cli?color=cyan&label=version&style=flat-square)](https://www.npmjs.com/package/zerostart-cli)
[![npm downloads](https://img.shields.io/npm/dm/zerostart-cli?color=blue&style=flat-square)](https://www.npmjs.com/package/zerostart-cli)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](./LICENSE)

**ZeroStart** is a developer CLI that scaffolds a fully structured project, initializes Git with human-style commits, and optionally pushes to GitHub or deploys to Vercel — all from a single interactive command.

🌐 **Website:** [zerostart.zeroonedevs.in](https://zerostart.zeroonedevs.in)
📦 **npm:** [npmjs.com/package/zerostart-cli](https://www.npmjs.com/package/zerostart-cli)

---

## 📦 Installation

Install globally to use the `zerostart` command anywhere:

```bash
npm install -g zerostart-cli
```

> ⚠️ **Must use `-g`** — without the global flag, the CLI won't be available in your terminal.

---

## ✨ Features

- **🆕 AI Architect**: Build custom projects from a single sentence prompt.
- **🚀 One-Command Setup**: Scaffold, initialize Git, and deploy in seconds.
- **📦 Pre-built Templates**: React, Next.js, Express, C++, Java, Python, and more.
- **🐙 GitHub Integration**: Auto-create repositories and push with human-style commits.
- **🏆 CP Smart Practice**: Choose between an online compiler, local terminal, or both for your competitive programming practice.
- **🌐 Instant Deployment**: Vercel and Netlify support built-in.

---

## ⚡ Quick Start

### 1. The Standard Way
```bash
zerostart
```
Follow the interactive wizard to set up your project.

### 2. The AI Way (New!) ✨
```bash
zerostart ai "a simple blog with react and express"
```
Tell the AI what you want, and it will architect the entire project for you.

---

## 🛠 Commands

### Core

| Command | Description |
| :--- | :--- |
| `zerostart` | Launch the full interactive wizard |
| `zerostart ai [prompt]` | **AI Architect**: Build a project from a description |
| `zerostart init [name]` | Start a new project (with optional name) |
| `zerostart deploy` | Deploy the current project (Vercel / Netlify) |
| `zerostart git` | Initialize Git + optionally push to GitHub |
| `zerostart docs` | Open the ZeroStart website in your browser |
| `zerostart update` | Check for CLI updates |

### Shortcut Commands ⚡

Skip the wizard — create a project in one line:

```bash
zerostart dsa-cpp my-solution
zerostart web-react my-portfolio
zerostart ml-py my-model
```

**All shortcuts:**

| Category | Commands |
| :--- | :--- |
| **DSA Practice** | `dsa-py`, `dsa-java`, `dsa-cpp` |
| **Web Apps** | `web-react`, `web-html`, `web-py`, `web-java`, `web-cpp` |
| **CLI Tools** | `cli-py`, `cli-java`, `cli-cpp` |
| **ML Projects** | `ml-py`, `ml-java`, `ml-cpp` |

### Dev Tools

| Command | Description |
| :--- | :--- |
| `zerostart dev` | Start the local development server |
| `zerostart build` | Build the project for production |
| `zerostart clean` | Remove `node_modules`, `dist`, cache files |
| `zerostart env` | Manage `.env` variables interactively |
| `zerostart test` | Set up a testing framework |
| `zerostart add [feature]` | Add features to an existing project |

### Development Commands

| Command | Description |
| :--- | :--- |
| `npm run lint` | Run ESLint to check for code issues |
| `npm run compile` | Compile TypeScript into JavaScript |

### Deployment

| Command | Description |
| :--- | :--- |
| `zerostart deploy-vercel` | Deploy current project to Vercel |
| `zerostart deploy-netlify` | Deploy current project to Netlify |

---

## 🗂 Project Structure

Every project created by ZeroStart includes:

```
my-project/
├── src/                  ← Language-specific source files
├── .gitignore
├── README.md             ← Auto-generated project README
├── roadmap.md            ← Editable project roadmap
└── (config files based on template)
```

**Git history (2 human-style commits):**
```
feat: initialize project with ZeroStart CLI
chore: add project structure and configuration files
```

---

## 🧰 Requirements

- **Node.js** v18 or higher
- **Git** — must be installed and in your PATH
- **GitHub PAT** — optional, only needed for GitHub push. [Create one here →](https://github.com/settings/tokens/new?scopes=repo&description=ZeroStart%20CLI%20Token)

---

## 🐛 Troubleshooting

**`zerostart: command not found`**
```bash
# You missed the -g flag. Fix it:
npm install -g zerostart-cli
```

**`Git is not installed`**
→ Download and install Git from [git-scm.com](https://git-scm.com/)

**`GitHub repository creation failed`**
→ Make sure your token has the `repo` scope. [Generate a new token →](https://github.com/settings/tokens)

---

## 🔧 Development

```bash
# Clone the repo
git clone https://github.com/KushaalNayak/ZeroStart-cli.git
cd ZeroStart-cli

# Install dependencies
npm install

# Build
npm run compile

# Run locally
node ./out/cli.js
```

### Source Structure

```
src/
├── cli.ts                    ← CLI entry point & all commands
├── types.ts                  ← TypeScript enums & interfaces
├── managers/
│   ├── TemplateManager.ts    ← Project file scaffolding
│   ├── GitManager.ts         ← Git & GitHub operations
│   ├── ProjectManager.ts     ← Orchestration
│   ├── VercelManager.ts      ← Vercel deployment
│   └── NetlifyManager.ts     ← Netlify deployment
└── services/
    └── GitHubServiceCLI.ts   ← GitHub REST API client
```

---

## 📄 License

MIT © [ZeroStart](https://zerostart.zeroonedevs.in)

---

## 🤝 Contributing

PRs and issues are welcome!
Open one at [github.com/KushaalNayak/ZeroStart-cli](https://github.com/KushaalNayak/ZeroStart-cli/issues)

---

> **Made with ❤️ by the ZeroStart team — [zerostart.zeroonedevs.in](https://zerostart.zeroonedevs.in)**
