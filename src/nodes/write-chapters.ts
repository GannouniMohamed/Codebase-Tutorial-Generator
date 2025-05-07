import { BaseBatchNode } from '../core/node.js';
import { SharedState } from '../types/index.js';
import { callLLM } from '../utils/llm.js';
import { logInfo, logError } from '../utils/logger.js';

export class WriteChapters extends BaseBatchNode {
  private shared: SharedState;
  private readonly BATCH_SIZE = 3; // Process 3 chapters at a time

  constructor() {
    super();
    this.shared = {} as SharedState;
  }

  async prepareBatch(shared: SharedState): Promise<any[]> {
    this.shared = shared;
    if (!shared.chapterOrder?.chapters) {
      logInfo('No chapters found to write');
      return [];
    }
    return shared.chapterOrder.chapters;
  }

  async processItem(chapter: any): Promise<Record<string, string>> {
    // Only include relevant abstractions and relationships for this chapter
    const relevantAbstractions = Object.entries(this.shared.abstractions || {})
      .filter(([name]) => chapter.abstractions.includes(name))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const relevantRelationships = Object.entries(this.shared.relationships || {})
      .filter(([_, rel]) => 
        chapter.abstractions.includes(rel.from) || 
        chapter.abstractions.includes(rel.to)
      )
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const prompt = `
Write a tutorial chapter based on the following information.
Return the results in YAML format:

\`\`\`yaml
title: <chapter title>
content: |
  <chapter content in markdown format>
\`\`\`

Chapter Information:
\`\`\`yaml
${JSON.stringify(chapter, null, 2)}
\`\`\`

Relevant Code Abstractions:
\`\`\`yaml
${JSON.stringify(relevantAbstractions, null, 2)}
\`\`\`

Relevant Relationships:
\`\`\`yaml
${JSON.stringify(relevantRelationships, null, 2)}
\`\`\`
`;

    try {
      const response = await callLLM(prompt);
      const yamlMatch = response.match(/```yaml\n([\s\S]*?)\n```/);
      if (!yamlMatch) {
        throw new Error('Failed to extract YAML from response');
      }

      const yaml = yamlMatch[1];
      const result = JSON.parse(yaml);
      return {
        [result.title]: result.content
      };
    } catch (error) {
      logError('Error writing chapter', error as Error);
      throw error;
    }
  }

  async postProcessBatch(shared: SharedState, _: any[], results: Record<string, string>[]): Promise<string | undefined> {
    // Merge results with existing chapters
    shared.chapters = {
      ...(shared.chapters || {}),
      ...Object.assign({}, ...results)
    };
    logInfo(`Wrote ${results.length} chapters`);
    return 'default';
  }

  async handleItemError(error: Error): Promise<void> {
    logError('Error in WriteChapters node', error);
  }
} 