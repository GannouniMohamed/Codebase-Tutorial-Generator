import { BaseNode } from '../core/node.js';
import { SharedState } from '../types/index.js';
import { callLLM } from '../utils/llm.js';
import { logInfo, logError } from '../utils/logger.js';

export class AnalyzeRelationships extends BaseNode {
  private shared: SharedState;

  constructor() {
    super();
    this.shared = {} as SharedState;
  }

  async prepare(shared: SharedState): Promise<{ abstractions: Record<string, any> }> {
    this.shared = shared;
    if (!shared.abstractions) {
      throw new Error('No abstractions found to analyze');
    }
    return { abstractions: shared.abstractions };
  }

  async process({ abstractions }: { abstractions: Record<string, any> }): Promise<Record<string, any>> {
    const prompt = `
Analyze the relationships between the following code abstractions.
Return the results in YAML format:

\`\`\`yaml
relationships:
  - from: <abstraction name>
    to: <abstraction name>
    type: <inheritance|composition|dependency|etc>
    description: <brief description of the relationship>
\`\`\`

Abstractions:
\`\`\`yaml
${JSON.stringify(abstractions, null, 2)}
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
      logError('Error analyzing relationships', error as Error);
      throw error;
    }
  }

  async postProcess(shared: SharedState, _: { abstractions: Record<string, any> }, result: Record<string, any>): Promise<string | undefined> {
    shared.relationships = result.relationships;
    logInfo(`Analyzed ${result.relationships.length} relationships between abstractions`);
    return 'default';
  }

  async handleError(error: Error): Promise<void> {
    logError('Error in AnalyzeRelationships node', error);
  }
} 