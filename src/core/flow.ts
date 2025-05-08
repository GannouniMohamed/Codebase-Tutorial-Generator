import { Node, SharedState } from "../types/index.js";
import chalk from "chalk";

export class Flow {
  constructor(private startNode: Node) {}

  async run(shared: SharedState): Promise<void> {
    try {
      let currentNode: Node | undefined = this.startNode;
      let processedNodes = new Set<Node>();

      while (currentNode && !processedNodes.has(currentNode)) {
        processedNodes.add(currentNode);
        const input = await currentNode.prepare(shared);
        const result = await currentNode.process(input);
        await currentNode.postProcess(shared, input, result);

        // Move to the next node
        currentNode = currentNode.getNextNode();
      }
    } catch (error) {
      console.error(chalk.red("Flow execution failed:"), error);
      throw error;
    }
  }
}
