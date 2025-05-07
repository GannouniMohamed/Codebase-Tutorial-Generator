# Codebase Tutorial Generator - TypeScript Version

A TypeScript implementation of the codebase tutorial generator that uses LLMs to analyze codebases and generate comprehensive tutorials.

## Features

- Analyze codebases from local directories or GitHub repositories
- Identify code abstractions and their relationships
- Generate logical chapter ordering
- Create detailed tutorial chapters
- Combine everything into a well-structured tutorial

## Prerequisites

- Node.js v18 or later
- npm or yarn
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ts-version
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your OpenAI API key:
```bash
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

## Usage

### Build the Project

First, build the TypeScript code:
```bash
npm run build
```

### Generate a Tutorial

You can generate a tutorial from either a local directory or a GitHub repository:

#### From a Local Directory

```bash
npm start -- --dir /path/to/your/project --name "Project Name" --include "*.ts" "*.tsx" --exclude "node_modules/*" "dist/*" --language english --output tutorial-output
```

#### From a GitHub Repository

```bash
npm start -- --repo https://github.com/username/repo --name "Project Name" --include "*.ts" "*.tsx" --exclude "node_modules/*" "dist/*" --language english --output tutorial-output
```

### Command Line Options

- `-r, --repo <url>`: GitHub repository URL
- `-d, --dir <path>`: Path to local directory
- `-n, --name <name>`: Project name
- `-l, --language <lang>`: Tutorial language (default: english)
- `-i, --include <patterns...>`: File patterns to include (default: ["*.js", "*.jsx", "*.ts", "*.tsx"])
- `-e, --exclude <patterns...>`: File patterns to exclude (default: ["node_modules/*", "dist/*", "build/*"])
- `-o, --output <dir>`: Output directory (default: tutorials)
- `-s, --max-size <size>`: Maximum file size in bytes (default: 1000000)

## Development

### Project Structure

```
ts-version/
├── src/
│   ├── core/           # Core abstractions (Flow, Node)
│   ├── nodes/          # Node implementations
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── flow.ts         # Flow definition
│   └── main.ts         # Entry point
├── dist/               # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

### Development Commands

- `npm run build`: Build the TypeScript code
- `npm run dev`: Watch for changes and rebuild
- `npm start`: Run the compiled code
- `npm test`: Run tests

## License

MIT 