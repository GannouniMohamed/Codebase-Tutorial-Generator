export interface SharedState {
  repoUrl?: string;
  localDir?: string;
  projectName: string;
  language: string;
  includePatterns: string[];
  excludePatterns: string[];
  outputDir: string;
  maxFileSize: number;
  files?: Record<string, string>;
  abstractions?: Record<string, any>;
  relationships?: Record<string, any>;
  chapterOrder?: {
    chapters: Array<{
      title: string;
      description: string;
      abstractions: string[];
    }>;
  };
  chapters?: Record<string, string>;
}

export interface FileInfo {
  path: string;
  content: string;
}

export interface Abstraction {
  name: string;
  type: 'class' | 'interface' | 'function' | 'module';
  description: string;
  file: string;
  dependencies: string[];
}

export interface Relationship {
  from: string;
  to: string;
  type: 'inheritance' | 'composition' | 'dependency';
  description: string;
}

export interface Chapter {
  title: string;
  description: string;
  abstractions: string[];
  order: number;
  content?: string;
}

export interface ChapterOrder {
  chapters: Chapter[];
}

export interface LLMOptions {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export type Action = string;

export interface NodeResult {
  action?: string;
  error?: Error;
}

export interface BatchResult {
  items: any[];
  errors: Error[];
}

export interface Node {
  prepare(shared: SharedState): Promise<any>;
  process(input: any): Promise<any>;
  postProcess(shared: SharedState, input: any, result: any): Promise<string | undefined>;
  handleError(error: Error): Promise<void>;
  connect(next: Node): Node;
}

export interface BatchNode extends Node {
  prepareBatch(shared: SharedState): Promise<any[]>;
  processItem(item: any): Promise<any>;
  postProcessBatch(shared: SharedState, items: any[], results: any[]): Promise<string | undefined>;
  handleItemError(item: any, error: Error): Promise<void>;
}

export interface Flow {
  run(shared: SharedState): Promise<void>;
} 