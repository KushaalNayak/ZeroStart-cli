# ZeroStart CLI - Quick Test Guide

## Quick Command Tests

Run these commands to quickly verify each feature:

### Basic Commands
```bash
# Show help
node out/cli.js --help

# Show version
node out/cli.js --version
```

### Main Commands (Test with --help to verify they exist)
```bash
# Initialize new project
node out/cli.js init --help

# Deploy project
node out/cli.js deploy --help

# Git operations
node out/cli.js git --help

# Add features
node out/cli.js add --help

# Environment variables
node out/cli.js env --help

# Testing setup
node out/cli.js test --help

# Build for production
node out/cli.js build --help

# Start dev server
node out/cli.js dev --help

# Clean artifacts
node out/cli.js clean --help

# Update CLI
node out/cli.js update --help

# Open docs
node out/cli.js docs --help
```

### Deployment Commands
```bash
# Deploy to Vercel
node out/cli.js deploy-vercel --help

# Deploy to Netlify
node out/cli.js deploy-netlify --help
```

### Shortcut Commands (DSA)
```bash
node out/cli.js dsa-py --help
node out/cli.js dsa-java --help
node out/cli.js dsa-cpp --help
node out/cli.js dsa-node --help
```

### Shortcut Commands (Web)
```bash
node out/cli.js web-react --help
node out/cli.js web-html --help
node out/cli.js web-node --help
node out/cli.js web-py --help
node out/cli.js web-java --help
node out/cli.js web-cpp --help
```

### Shortcut Commands (CLI Tools)
```bash
node out/cli.js cli-py --help
node out/cli.js cli-node --help
node out/cli.js cli-java --help
node out/cli.js cli-cpp --help
```

### Shortcut Commands (ML)
```bash
node out/cli.js ml-py --help
node out/cli.js ml-node --help
node out/cli.js ml-java --help
node out/cli.js ml-cpp --help
```

## Run All Tests
```bash
# Make test script executable and run
chmod +x test-commands.sh
./test-commands.sh
```

## Example Usage

### Create a React Web App
```bash
node out/cli.js web-react my-react-app
```

### Create a Python DSA Practice Project
```bash
node out/cli.js dsa-py leetcode-practice
```

### Initialize a Project Interactively
```bash
node out/cli.js init my-project
```

### Deploy Current Project
```bash
node out/cli.js deploy
```

### Manage Environment Variables
```bash
node out/cli.js env
```

### Clean and Rebuild
```bash
node out/cli.js clean
node out/cli.js build
```

## Notes

- All commands are working and verified ✅
- Use `--help` flag with any command to see detailed usage
- Shortcut commands provide quick project scaffolding
- Main commands offer full interactive experiences
