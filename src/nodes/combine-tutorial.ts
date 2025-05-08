import { BaseNode } from '../core/node.js';
import { SharedState } from '../types/index.js';
import { callLLM } from '../utils/llm.js';
import { logInfo, logError } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';

export class CombineTutorial extends BaseNode {
  private shared: SharedState;

  constructor() {
    super();
    this.shared = {} as SharedState;
  }

  async prepare(shared: SharedState): Promise<{ chapters: Record<string, string>, projectName: string, language: string }> {
    this.shared = shared;
    if (!shared.chapters) {
      throw new Error('No chapters found to combine');
    }
    return {
      chapters: shared.chapters,
      projectName: shared.projectName,
      language: shared.language
    };
  }

  async process({ chapters, projectName, language }: { chapters: Record<string, string>, projectName: string, language: string }): Promise<string> {
    // Process chapters in chunks to avoid memory issues
    const chunkSize = 5; // Process 5 chapters at a time
    const chapterEntries = Object.entries(chapters);
    const chunks: string[] = [];

    for (let i = 0; i < chapterEntries.length; i += chunkSize) {
      const chunk = chapterEntries.slice(i, i + chunkSize);
      const chunkPrompt = `
Create a tutorial section by combining the following chapters.
Return the results in markdown format:

\`\`\`markdown
${chunk.map(([title, content]) => `## ${title}\n\n${content}`).join('\n\n')}
\`\`\`
`;

      try {
        const response = await callLLM(chunkPrompt);
        const markdownMatch = response.match(/```markdown\n([\s\S]*?)\n```/);
        if (!markdownMatch) {
          throw new Error('Failed to extract markdown from response');
        }
        chunks.push(markdownMatch[1]);
      } catch (error) {
        logError('Error processing chunk', error as Error);
        throw error;
      }
    }

    return chunks.join('\n\n');
  }

  async postProcess(shared: SharedState, _: { chapters: Record<string, string>, projectName: string, language: string }, result: string): Promise<string | undefined> {
    const outputDir = shared.outputDir || 'tutorial';
    const outputPath = path.join(outputDir, `${shared.projectName.toLowerCase().replace(/\s+/g, '-')}-tutorial.md`);

    try {
      await fs.mkdir(outputDir, { recursive: true });
      
      // Write the file using streams
      const writeStream = createWriteStream(outputPath);
      writeStream.write(`# ${shared.projectName} Tutorial\n\n`);
      
      // Write in chunks to avoid memory issues
      const chunkSize = 1024 * 1024; // 1MB chunks
      for (let i = 0; i < result.length; i += chunkSize) {
        const chunk = result.slice(i, i + chunkSize);
        writeStream.write(chunk);
      }
      
      writeStream.end();
      
      // Wait for the write to complete
      await new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve(undefined));
        writeStream.on('error', reject);
      });

      logInfo(`Tutorial written to ${outputPath}`);
      return 'default';
    } catch (error) {
      logError('Error writing tutorial file', error as Error);
      throw error;
    }
  }

  async handleError(error: Error): Promise<void> {
    logError('Error in CombineTutorial node', error);
  }
} 