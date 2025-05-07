import { simpleGit } from 'simple-git';
import path from 'path';
import { ensureDirectoryExists, removeDirectory } from './fs.js';

export async function cloneRepository(repoUrl: string, targetDir: string): Promise<void> {
  try {
    // Ensure the target directory exists
    await ensureDirectoryExists(targetDir);
    
    // Clone the repository
    const git = simpleGit();
    await git.clone(repoUrl, targetDir);
    
    console.log(`Successfully cloned ${repoUrl} to ${targetDir}`);
  } catch (error) {
    console.error(`Error cloning repository ${repoUrl}:`, error);
    // Clean up the target directory if it exists
    await removeDirectory(targetDir);
    throw error;
  }
}

export async function getRepositoryFiles(
  repoUrl: string,
  includePatterns: string[],
  excludePatterns: string[],
  maxSize: number
): Promise<Record<string, string>> {
  const tempDir = path.join(process.cwd(), 'temp', Date.now().toString());
  
  try {
    // Clone the repository to a temporary directory
    await cloneRepository(repoUrl, tempDir);
    
    // Use the file system utility to find and read files
    const { findFiles } = await import('./fs.js');
    const files = await findFiles(tempDir, includePatterns, excludePatterns, maxSize);
    
    return files;
  } finally {
    // Clean up the temporary directory
    await removeDirectory(tempDir);
  }
} 