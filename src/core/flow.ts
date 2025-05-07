import { Node, SharedState, Action } from '../types/index.js';
import chalk from 'chalk';

export class Flow {
  constructor(private startNode: Node) {}

  async run(shared: SharedState): Promise<void> {
    try {
      const input = await this.startNode.prepare(shared);
      const result = await this.startNode.process(input);
      const action = await this.startNode.postProcess(shared, input, result);
      
      if (action) {
        const nextNode = this.startNode.connect(this.startNode);
        if (nextNode) {
          const nextFlow = new Flow(nextNode);
          await nextFlow.run(shared);
        }
      }
    } catch (error) {
      console.error(chalk.red('Flow execution failed:'), error);
      throw error;
    }
  }
} 