import { BaseBatchNode } from '../core/node.js';
import { SharedState } from '../types/index.js';
import { callLLM } from '../utils/llm.js';
import { logInfo, logError } from '../utils/logger.js';

export class IdentifyAbstractions extends BaseBatchNode {
  private shared: SharedState;

  constructor() {
    super();
    this.shared = {} as SharedState;
  }

  async prepareBatch(shared: SharedState): Promise<[string, string][]> {
    this.shared = shared;
    if (!shared.files) {
      logInfo('No files found to analyze');
      return [];
    }
    return Object.entries(shared.files);
  }

  async processItem([filePath, content]: [string, string]): Promise<Record<string, any>> {
    const prompt = `
Analyze the following code file and identify the key abstractions (classes, interfaces, types, functions, etc.).
Return the results in YAML format:

\`\`\`yaml
abstractions:
  - name: <abstraction name>
    type: <class|interface|type|function|etc>
    description: <brief description>
    location: <file path>
    dependencies: [<list of dependencies>]
\`\`\`

File: ${filePath}
\`\`\`
${content}
\`\`\`
`;

    try {
      const response = await callLLM(prompt);
      const yamlMatch = response.match(/```yaml\n([\s\S]*?)\n```/);
      if (!yamlMatch) {
        throw new Error('Failed to extract YAML from response');
      }

      const yaml = yamlMatch[1];
      const abstractions = JSON.parse(yaml).abstractions;
      return { filePath, abstractions };
    } catch (error) {
      logError(`Error analyzing file ${filePath}`, error as Error);
      throw error;
    }
  }

  async postProcessBatch(shared: SharedState, _: [string, string][], results: Record<string, any>[]): Promise<string | undefined> {
    const allAbstractions: Record<string, any> = {};
    
    for (const result of results) {
      for (const abstraction of result.abstractions) {
        allAbstractions[abstraction.name] = {
          ...abstraction,
          filePath: result.filePath
        };
      }
    }

    shared.abstractions = allAbstractions;
    logInfo(`Identified ${Object.keys(allAbstractions).length} abstractions`);
    return 'default';
  }

  async handleItemError([filePath]: [string, string], error: Error): Promise<void> {
    logError(`Error processing file ${filePath}`, error);
  }
} 