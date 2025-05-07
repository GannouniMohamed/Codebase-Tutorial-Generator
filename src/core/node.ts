import { Node, SharedState } from '../types/index.js';

export abstract class BaseNode implements Node {
  protected nextNode?: Node;

  async prepare(shared: SharedState): Promise<any> {
    return undefined;
  }

  abstract process(input: any): Promise<any>;

  async postProcess(shared: SharedState, input: any, result: any): Promise<string | undefined> {
    return 'default';
  }

  async handleError(error: Error): Promise<void> {
    console.error(`Error in ${this.constructor.name}:`, error);
  }

  connect(next: Node): Node {
    this.nextNode = next;
    return next;
  }

  protected async runNext(shared: SharedState, action: string = 'default'): Promise<void> {
    if (this.nextNode) {
      await this.nextNode.prepare(shared);
      const input = await this.nextNode.prepare(shared);
      const result = await this.nextNode.process(input);
      const nextAction = await this.nextNode.postProcess(shared, input, result);
      if (nextAction) {
        await this.runNext(shared, nextAction);
      }
    }
  }
}

export abstract class BaseBatchNode extends BaseNode {
  async prepare(shared: SharedState): Promise<any[]> {
    return this.prepareBatch(shared);
  }

  async process(input: any[]): Promise<any[]> {
    const results: any[] = [];
    const errors: Error[] = [];

    for (const item of input) {
      try {
        const result = await this.processItem(item);
        results.push(result);
      } catch (error) {
        await this.handleItemError(item, error as Error);
        errors.push(error as Error);
      }
    }

    return results;
  }

  async postProcess(shared: SharedState, input: any[], results: any[]): Promise<string | undefined> {
    return this.postProcessBatch(shared, input, results);
  }

  abstract prepareBatch(shared: SharedState): Promise<any[]>;
  abstract processItem(item: any): Promise<any>;
  abstract postProcessBatch(shared: SharedState, items: any[], results: any[]): Promise<string | undefined>;
  abstract handleItemError(item: any, error: Error): Promise<void>;
} 