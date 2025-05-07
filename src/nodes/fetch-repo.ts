import { BaseNode } from '../core/node.js';
import { SharedState } from '../types/index.js';
import { findFiles } from '../utils/fs.js';
import { getRepositoryFiles } from '../utils/git.js';
import { logInfo, logError } from '../utils/logger.js';

export class FetchRepo extends BaseNode {
  private shared: SharedState;

  constructor() {
    super();
    this.shared = {} as SharedState;
  }

  async prepare(shared: SharedState): Promise<void> {
    this.shared = shared;
    if (!shared.repoUrl && !shared.localDir) {
      throw new Error('Either repoUrl or localDir must be provided');
    }
  }

  async process(_: void): Promise<Record<string, string>> {
    const { repoUrl, localDir, includePatterns, excludePatterns, maxFileSize } = this.shared;

    try {
      if (repoUrl) {
        logInfo(`Fetching files from repository: ${repoUrl}`);
        return await getRepositoryFiles(repoUrl, includePatterns, excludePatterns, maxFileSize);
      } else if (localDir) {
        logInfo(`Reading files from local directory: ${localDir}`);
        return await findFiles(localDir, includePatterns, excludePatterns, maxFileSize);
      }

      throw new Error('Neither repoUrl nor localDir is provided');
    } catch (error) {
      logError('Error fetching repository files', error as Error);
      throw error;
    }
  }

  async postProcess(shared: SharedState, _: void, files: Record<string, string>): Promise<string | undefined> {
    shared.files = files;
    logInfo(`Found ${Object.keys(files).length} files to process`);
    return 'default';
  }

  async handleError(error: Error): Promise<void> {
    logError('Error in FetchRepo node', error);
  }
} 