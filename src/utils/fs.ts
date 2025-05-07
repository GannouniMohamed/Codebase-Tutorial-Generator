import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { minimatch } from 'minimatch';

export async function ensureDirectoryExists(dir: string): Promise<void> {
  await fs.ensureDir(dir);
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

export async function findFiles(
  dir: string,
  includePatterns: string[],
  excludePatterns: string[],
  maxSize: number
): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  
  // Use glob to find all files first
  const allFiles = await glob('**/*', { 
    cwd: dir,
    nodir: true,
    absolute: false 
  });
  
  // Filter files based on patterns
  const filteredFiles = allFiles.filter(filePath => {
    // Check include patterns
    if (includePatterns.length > 0) {
      const included = includePatterns.some(pattern => 
        minimatch(filePath, pattern, { matchBase: true })
      );
      if (!included) return false;
    }
    
    // Check exclude patterns
    if (excludePatterns.length > 0) {
      const excluded = excludePatterns.some(pattern => 
        minimatch(filePath, pattern, { matchBase: true })
      );
      if (excluded) return false;
    }
    
    return true;
  });
  
  // Read each file that's under the size limit
  for (const filePath of filteredFiles) {
    const fullPath = path.join(dir, filePath);
    try {
      const stats = await fs.stat(fullPath);
      if (stats.size <= maxSize) {
        const content = await readFile(fullPath);
        files[filePath] = content;
      } else {
        console.warn(`Skipping ${filePath} - exceeds size limit of ${maxSize} bytes`);
      }
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
    }
  }
  
  return files;
}

export async function cleanDirectory(dir: string): Promise<void> {
  await fs.emptyDir(dir);
}

export async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest);
}

export async function removeDirectory(dir: string): Promise<void> {
  await fs.remove(dir);
} 