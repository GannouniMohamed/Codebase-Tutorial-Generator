import { BaseBatchNode } from '../core/node.js';
import { SharedState } from '../types/index.js';
import { callLLM } from '../utils/llm.js';
import { logInfo, logError } from '../utils/logger.js';
import yaml from 'js-yaml';

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
Return the results in YAML format. Make sure to use proper YAML array syntax with commas between array entries:

\`\`\`yaml
abstractions:
  - name: <abstraction name>
    type: <class|interface|type|function|etc>
    description: <brief description>
    location: <file path>
    dependencies: [<dependency1>, <dependency2>, <dependency3>]  # Note the commas between array items
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

      const yamlContent = yamlMatch[1];
      
      // Validate YAML structure before parsing
      if (!yamlContent.includes('abstractions:')) {
        throw new Error('Invalid YAML structure: missing abstractions key');
      }
      
      // Ensure proper array syntax
      const fixedYamlContent = yamlContent
        .replace(/dependencies:\s*\[([^\]]+)\]/g, (match, deps) => {
          // Clean up dependencies array:
          // 1. Remove double commas
          // 2. Remove quotes around items
          // 3. Split by comma and clean up each item
          // 4. Filter out empty items
          // 5. Join with proper comma spacing
          const cleanedDeps = deps
            .replace(/,,/g, ',')  // Remove double commas
            .replace(/"([^"]+)"/g, '$1')  // Remove quotes
            .split(',')
            .map((dep: string) => dep.trim())
            .filter(Boolean)
            .join(', ');
          return `dependencies: [${cleanedDeps}]`;
        });

      const parsed = yaml.load(fixedYamlContent) as { abstractions: any[] };
      if (!parsed || !parsed.abstractions) {
        throw new Error('Invalid YAML structure: missing abstractions array');
      }

      return { filePath, abstractions: parsed.abstractions };
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