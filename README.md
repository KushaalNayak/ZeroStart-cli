# ZeroStart CLI 🚀

Create and deploy a complete project with **one command**.

[![npm version](https://img.shields.io/npm/v/zerostart-cli.svg)](https://www.npmjs.com/package/zerostart-cli)
[![npm downloads](https://img.shields.io/npm/dm/zerostart-cli.svg)](https://www.npmjs.com/package/zerostart-cli)

---

## 📦 Installation

**⚠️ IMPORTANT: Use the `-g` flag to install globally!**

```bash
npm install -g zerostart-cli
```

> **Why `-g`?** The `-g` flag installs ZeroStart globally on your system, making the `zerostart` command available from anywhere in your terminal. Without it, you'll only get `node_modules` and `package-lock.json` files, and the CLI won't work!

---

## 🚀 Quick Start

After installing globally, create a new project:

```bash
zerostart my-awesome-project
```

Or simply run:

```bash
zerostart
```

Then follow the interactive prompts!

---

## ✨ Features

- 🎯 **Interactive CLI** - Guided prompts for project setup
- 🌐 **Multiple Languages** - Node.js, React, Python, Java, C++
- 📦 **Project Types** - Web App, CLI Tool, DSA Practice, ML Project
- 🔧 **Auto-scaffolding** - Complete project structure generation
- 📝 **Documentation** - Auto-generated README, roadmap, .gitignore
- 🔄 **Git Integration** - Automatic Git initialization and first commit
- 🐙 **GitHub Integration** - Create and push to GitHub repository
- 🔒 **Visibility Control** - Choose public or private repositories

---

## 📖 Usage

### Basic Usage

```bash
# Create a project with interactive prompts
zerostart

# Create a project with a specific name
zerostart my-project-name

# Check version
zerostart --version

# Get help
zerostart --help
```

### Shortcut Commands ⚡

Skip the wizard and build instantly with these shortcuts:

| Category | Shortcut Commands |
| :--- | :--- |
| **DSA Practice** | `dsa-py`, `dsa-java`, `dsa-cpp`, `dsa-node` |
| **Web Apps** | `web-react`, `web-html`, `web-node`, `web-py`, `web-java`, `web-cpp` |
| **CLI Tools** | `cli-py`, `cli-node`, `cli-java`, `cli-cpp` |
| **ML Projects** | `ml-py`, `ml-node`, `ml-java`, `ml-cpp` |

**Example Usage**:
```bash
zerostart dsa-cpp my-calculator
```

### Standalone Deployment
Retry deployments or deploy existing projects without scaffolding:

```bash
# Deploy to Vercel (Login -> Deploy)
zerostart deploy-vercel

# Deploy to Netlify (Login -> Deploy)
zerostart deploy-netlify
```

### Example Workflow

```bash
$ zerostart my-web-app

ZeroStart: Project Starter AI

? Select Programming Language: › Node.js
? Select Project Type: › Web App
? Select Repository Visibility: › Private
? Create GitHub Repository? › Yes
? Enter GitHub Personal Access Token: ********

✔ Generating project structure...
✔ Initializing Git...
✔ Creating GitHub Repository...
✔ Pushing to GitHub...
✔ Project 'my-web-app' created successfully!

Path: C:\Users\YourName\my-web-app
To get started:
  cd my-web-app
  code .
```

---

## 🛠️ Requirements

- **Node.js** (v18 or higher)
- **Git** (must be installed and in PATH)
- **GitHub Personal Access Token** (optional, for GitHub integration)

### Getting a GitHub Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token and use it when prompted by ZeroStart

---

## 🏗️ What Gets Created

ZeroStart automatically generates:

```
my-project/
├── src/
│   └── (language-specific files)
├── .gitignore
├── README.md
├── roadmap.md
└── (additional config files based on language/type)
```

Plus:
- ✅ Git repository initialized
- ✅ Initial commit made
- ✅ GitHub repository created (if requested)
- ✅ Code pushed to GitHub (if requested)

---

## 🔧 Development

Want to contribute or modify ZeroStart?

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/zerostart-cli.git
cd zerostart-cli

# Install dependencies
npm install

# Build the project
npm run compile

# Test locally
node ./out/cli.js --help
```

### Project Structure

```
src/
├── cli.ts                      # CLI entry point
├── extension.ts                # VS Code extension entry (legacy)
├── types.ts                    # TypeScript interfaces
├── managers/
│   ├── TemplateManager.ts      # Project scaffolding
│   ├── GitManager.ts           # Git operations
│   └── ProjectManager.ts       # Main orchestration
└── services/
    ├── GitHubServiceCLI.ts     # GitHub API (CLI)
    └── GitHubService.ts        # GitHub API (VS Code)
```

---

## 📝 Publishing Updates

```bash
# Update version
npm version patch  # or minor, or major

# Rebuild
npm run compile

# Publish to npm
npm publish
```

---

## 🐛 Troubleshooting

### "zerostart: command not found"

**Problem:** You installed without the `-g` flag.

**Solution:**
```bash
# Remove local installation
rm -rf node_modules package-lock.json

# Install globally
npm install -g zerostart-cli
```

### "Git is not installed"

**Problem:** Git is not in your system PATH.

**Solution:** Install Git from [git-scm.com](https://git-scm.com/) and ensure it's in your PATH.

### "GitHub repository creation failed"

**Problem:** Invalid or insufficient GitHub token permissions.

**Solution:** Generate a new token with `repo` scope from GitHub settings.

---

## 📄 License

MIT

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📧 Support

- 📦 npm: [zerostart-cli](https://www.npmjs.com/package/zerostart-cli)
- 🐙 GitHub: [Issues](https://github.com/yourusername/zerostart-cli/issues)

---

**Made with ❤️ by ZeroStart Team**



