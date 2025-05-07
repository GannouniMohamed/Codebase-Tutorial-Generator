import { BaseNode } from '../core/node.js';
import { SharedState } from '../types/index.js';
import { callLLM } from '../utils/llm.js';
import { logInfo, logError } from '../utils/logger.js';

export class OrderChapters extends BaseNode {
  private shared: SharedState;

  constructor() {
    super();
    this.shared = {} as SharedState;
  }

  async prepare(shared: SharedState): Promise<{ abstractions: Record<string, any>, relationships: Record<string, any> }> {
    this.shared = shared;
    if (!shared.abstractions || !shared.relationships) {
      throw new Error('Missing abstractions or relationships data');
    }
    return { abstractions: shared.abstractions, relationships: shared.relationships };
  }

  async process({ abstractions, relationships }: { abstractions: Record<string, any>, relationships: Record<string, any> }): Promise<{ chapters: any[] }> {
    const prompt = `
Based on the following code abstractions and their relationships, create a logical order for tutorial chapters.
Return the results in YAML format:

\`\`\`yaml
chapters:
  - title: <chapter title>
    description: <brief description of what this chapter covers>
    abstractions: [<list of abstraction names covered in this chapter>]
\`\`\`

Abstractions:
\`\`\`yaml
${JSON.stringify(abstractions, null, 2)}
\`\`\`

Relationships:
\`\`\`yaml
${JSON.stringify(relationships, null, 2)}
\`\`\`
`;

    try {
      const response = await callLLM(prompt);
      const yamlMatch = response.match(/```yaml\n([\s\S]*?)\n```/);
      if (!yamlMatch) {
        throw new Error('Failed to extract YAML from response');
      }

      const yaml = yamlMatch[1];
      return JSON.parse(yaml);
    } catch (error) {
      logError('Error ordering chapters', error as Error);
      throw error;
    }
  }

  async postProcess(shared: SharedState, _: { abstractions: Record<string, any>, relationships: Record<string, any> }, result: { chapters: any[] }): Promise<string | undefined> {
    shared.chapterOrder = result;
    logInfo(`Created ${result.chapters.length} chapters in logical order`);
    return 'default';
  }

  async handleError(error: Error): Promise<void> {
    logError('Error in OrderChapters node', error);
  }
} 