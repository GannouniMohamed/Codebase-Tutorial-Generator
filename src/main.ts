import { program } from 'commander';
import dotenv from 'dotenv';
import { createTutorialFlow } from './flow.js';
import chalk from 'chalk';
import { SharedState } from './types/index.js';

// Load environment variables
dotenv.config();

// Configure command line options
program
  .option('-r, --repo <url>', 'GitHub repository URL')
  .option('-d, --dir <path>', 'Path to local directory')
  .option('-n, --name <name>', 'Project name')
  .option('-l, --language <lang>', 'Tutorial language', 'english')
  .option('-i, --include <patterns...>', 'File patterns to include', ['*.js', '*.jsx', '*.ts', '*.tsx'])
  .option('-e, --exclude <patterns...>', 'File patterns to exclude', ['node_modules/*', 'dist/*', 'build/*'])
  .option('-o, --output <dir>', 'Output directory', 'tutorials')
  .option('-s, --max-size <size>', 'Maximum file size in bytes', '1000000');

program.parse(process.argv);

const options = program.opts();

// Validate required options
if (!options.repo && !options.dir) {
  console.error(chalk.red('Error: Either --repo or --dir must be specified'));
  process.exit(1);
}

// Create shared state
const shared: SharedState = {
  repoUrl: options.repo,
  localDir: options.dir,
  projectName: options.name,
  language: options.language,
  includePatterns: options.include,
  excludePatterns: options.exclude,
  outputDir: options.output,
  maxFileSize: parseInt(options.maxSize)
};

// Run the tutorial generation
async function main() {
  try {
    console.log(chalk.blue(`Starting tutorial generation for: ${options.dir || options.repo} in ${options.language} language`));
    
    const flow = createTutorialFlow();
    await flow.run(shared);
    
    console.log(chalk.green('Tutorial generation completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error running tutorial generation:'), error);
    process.exit(1);
  }
}

main(); 